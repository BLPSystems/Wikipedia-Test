import { useParams, Link } from 'react-router-dom';
import { WikiLayout } from '../components/layout/WikiLayout';
import { ArticleHeader } from '../components/article/ArticleHeader';
import { ArticleBody } from '../components/article/ArticleBody';
import { TableOfContents } from '../components/article/TableOfContents';
import { useArticle } from '../hooks/useArticle';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { article, loading, error } = useArticle(slug ?? '');

  if (loading) {
    return (
      <div className="container article-loading">
        <div className="skeleton skeleton--heading" />
        <div className="skeleton skeleton--text" />
        <div className="skeleton skeleton--text skeleton--short" />
        <div style={{ marginTop: '2rem' }}>
          <div className="skeleton skeleton--heading skeleton--sm" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text skeleton--short" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container article-error">
        <div className="error-page">
          <h1>Article not found</h1>
          <p>{error ?? 'The article you are looking for does not exist.'}</p>
          <Link to="/browse" className="btn btn--primary">Browse all articles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/browse">Articles</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>

      <WikiLayout
        main={
          <>
            <ArticleHeader article={article} />
            <ArticleBody sections={article.article_sections} />
          </>
        }
        sidebar={<TableOfContents sections={article.article_sections} />}
      />
    </div>
  );
}
