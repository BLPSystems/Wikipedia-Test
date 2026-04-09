import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/browse/SearchBar';
import { ArticleGrid } from '../components/browse/ArticleGrid';
import { useArticles } from '../hooks/useArticles';

interface HomePageProps {
  onUploadClick: () => void;
}

export function HomePage({ onUploadClick }: HomePageProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { articles, loading } = useArticles('', '');

  function handleSearch() {
    const trimmed = query.trim();
    if (trimmed) navigate(`/browse?q=${encodeURIComponent(trimmed)}`);
    else navigate('/browse');
  }

  const recent = articles.slice(0, 6);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__inner">
          <h1 className="hero__title">Department Knowledge Base</h1>
          <p className="hero__subtitle">
            Upload documents and guides — they become searchable wiki articles instantly.
          </p>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search guides, tutorials, and more..."
            size="large"
          />
          <div className="hero__actions">
            <button className="btn btn--primary btn--lg" onClick={onUploadClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 15V3m0 0-4 4m4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Upload a Document
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => navigate('/browse')}>
              Browse All Articles
            </button>
          </div>
        </div>
      </section>

      <section className="home-recent">
        <div className="container">
          <div className="home-recent__header">
            <h2 className="home-recent__title">Recent Articles</h2>
            <a href="/browse" className="home-recent__link">View all</a>
          </div>
          <ArticleGrid
            articles={recent}
            loading={loading}
            emptyMessage="No articles yet. Upload your first document to get started."
          />
        </div>
      </section>
    </div>
  );
}
