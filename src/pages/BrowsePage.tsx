import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/browse/SearchBar';
import { TagFilter } from '../components/browse/TagFilter';
import { ArticleGrid } from '../components/browse/ArticleGrid';
import { useArticles, useAllTags } from '../hooks/useArticles';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedTag, setSelectedTag] = useState('');

  const tags = useAllTags();
  const { articles, loading, error } = useArticles(query, selectedTag);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
  }, [searchParams]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim()) setSearchParams({ q: value.trim() });
    else setSearchParams({});
  }

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1 className="browse-page__title">Browse Articles</h1>
        <p className="browse-page__subtitle">
          {articles.length > 0 && !loading
            ? `${articles.length} article${articles.length === 1 ? '' : 's'} found`
            : ''}
        </p>
      </div>

      <div className="browse-page__controls">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by keyword..."
        />
        <TagFilter tags={tags} selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      <ArticleGrid
        articles={articles}
        loading={loading}
        emptyMessage={query || selectedTag
          ? 'No articles match your search. Try different keywords or clear filters.'
          : 'No articles yet. Upload your first document to get started.'
        }
      />
    </div>
  );
}
