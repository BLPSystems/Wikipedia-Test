import { ArticleCard } from './ArticleCard';
import type { Article } from '../../lib/types';

interface ArticleGridProps {
  articles: Article[];
  loading?: boolean;
  emptyMessage?: string;
}

export function ArticleGrid({ articles, loading, emptyMessage = 'No articles found.' }: ArticleGridProps) {
  if (loading) {
    return (
      <div className="article-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="article-card article-card--skeleton" aria-hidden="true">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text skeleton--short" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 12h6m-6 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="article-grid">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
