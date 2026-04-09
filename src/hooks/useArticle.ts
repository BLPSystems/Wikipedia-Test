import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ArticleWithSections } from '../lib/types';

export function useArticle(slug: string) {
  const [article, setArticle] = useState<ArticleWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    supabase
      .from('articles')
      .select('*, article_sections(*)')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else if (!data) {
          setError('Article not found');
        } else {
          const sorted = {
            ...data,
            article_sections: [...(data.article_sections ?? [])].sort(
              (a, b) => a.position - b.position
            ),
          };
          setArticle(sorted);
        }
        setLoading(false);
      });
  }, [slug]);

  return { article, loading, error };
}
