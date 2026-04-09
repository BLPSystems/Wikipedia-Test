import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ArticleSection as ArticleSectionType } from '../../lib/types';

interface ArticleSectionProps {
  section: ArticleSectionType;
  index: number;
}

export function ArticleSection({ section, index }: ArticleSectionProps) {
  const HeadingTag = section.level === 3 ? 'h3' : 'h2';

  return (
    <section className={`article-section article-section--level-${section.level}`}>
      <HeadingTag
        id={`section-${section.id}`}
        className="article-section__heading"
      >
        <span className="article-section__num">{index + 1}</span>
        {section.heading}
      </HeadingTag>
      <div className="article-section__body prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {section.body}
        </ReactMarkdown>
      </div>
    </section>
  );
}
