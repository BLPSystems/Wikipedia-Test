import type { Article } from '../../lib/types';
import { formatDate } from '../../lib/utils';

interface ArticleHeaderProps {
  article: Article;
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <h1 className="article-header__title">{article.title}</h1>
      <p className="article-header__summary">{article.summary}</p>
      <div className="article-header__meta">
        <time dateTime={article.created_at}>
          Last updated: {formatDate(article.updated_at)}
        </time>
        {article.tags.length > 0 && (
          <div className="article-header__tags">
            {article.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
