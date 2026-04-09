import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/types';

export function useArticles(query: string = '', tag: string = '') {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArticles = useCallback(async (q: string, t: string) => {
    setLoading(true);
    setError(null);

    try {
      let queryBuilder = supabase
        .from('articles')
        .select('id, title, slug, summary, tags, upload_id, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (q.trim()) {
        queryBuilder = queryBuilder.textSearch('search_vector', q.trim(), {
          type: 'websearch',
          config: 'english',
        });
      }

      if (t) {
        queryBuilder = queryBuilder.contains('tags', [t]);
      }

      const { data, error: fetchError } = await queryBuilder;
      if (fetchError) throw fetchError;
      setArticles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchArticles(query, tag);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, tag, fetchArticles]);

  return { articles, loading, error, refetch: () => fetchArticles(query, tag) };
}

export function useAllTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('articles')
      .select('tags')
      .then(({ data }) => {
        if (!data) return;
        const all = new Set<string>();
        data.forEach(row => row.tags?.forEach((t: string) => all.add(t)));
        setTags([...all].sort());
      });
  }, []);

  return tags;
}
