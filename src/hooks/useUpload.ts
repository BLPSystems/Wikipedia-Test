import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getFileType } from '../lib/utils';

export type UploadState =
  | { stage: 'idle' }
  | { stage: 'uploading'; progress: number }
  | { stage: 'processing' }
  | { stage: 'done'; slug: string }
  | { stage: 'error'; message: string };

export function useUpload() {
  const [state, setState] = useState<UploadState>({ stage: 'idle' });

  const reset = useCallback(() => setState({ stage: 'idle' }), []);

  const upload = useCallback(async (file: File) => {
    setState({ stage: 'uploading', progress: 0 });

    try {
      const fileType = getFileType(file.name);
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { error: storageError } = await supabase.storage
        .from('uploads')
        .upload(path, file);

      if (storageError) throw new Error(`Storage error: ${storageError.message}`);

      setState({ stage: 'uploading', progress: 50 });

      const { data: uploadRow, error: dbError } = await supabase
        .from('uploads')
        .insert({
          filename: file.name,
          file_path: path,
          file_type: fileType,
          file_size: file.size,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError || !uploadRow) throw new Error('Failed to record upload');

      setState({ stage: 'processing' });

      const { error: fnError } = await supabase.functions.invoke('process-upload', {
        body: { upload_id: uploadRow.id },
      });

      if (fnError) throw new Error(`Processing error: ${fnError.message}`);

      const slug = await pollForCompletion(uploadRow.id);
      setState({ stage: 'done', slug });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setState({ stage: 'error', message });
    }
  }, []);

  return { state, upload, reset };
}

async function pollForCompletion(uploadId: string): Promise<string> {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 3000));
    attempts++;

    const { data } = await supabase
      .from('uploads')
      .select('status, error_msg, article_id')
      .eq('id', uploadId)
      .maybeSingle();

    if (!data) continue;

    if (data.status === 'error') {
      throw new Error(data.error_msg ?? 'Processing failed');
    }

    if (data.status === 'done' && data.article_id) {
      const { data: article } = await supabase
        .from('articles')
        .select('slug')
        .eq('id', data.article_id)
        .maybeSingle();

      if (article?.slug) return article.slug;
    }
  }

  throw new Error('Processing timed out. Please try again.');
}
