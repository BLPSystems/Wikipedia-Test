import { Link } from 'react-router-dom';
import type { Article } from '../../lib/types';
import { formatDate } from '../../lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-card">
      <Link to={`/articles/${article.slug}`} className="article-card__link">
        <h3 className="article-card__title">{article.title}</h3>
      </Link>
      <p className="article-card__summary">{article.summary}</p>
      <div className="article-card__meta">
        {article.tags.length > 0 && (
          <div className="article-card__tags">
            {article.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        <time className="article-card__date" dateTime={article.created_at}>
          {formatDate(article.created_at)}
        </time>
      </div>
    </article>
  );
}
