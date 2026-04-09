import { ArticleSection } from './ArticleSection';
import type { ArticleSection as ArticleSectionType } from '../../lib/types';

interface ArticleBodyProps {
  sections: ArticleSectionType[];
}

export function ArticleBody({ sections }: ArticleBodyProps) {
  return (
    <div className="article-body">
      {sections.map((section, i) => (
        <ArticleSection key={section.id} section={section} index={i} />
      ))}
    </div>
  );
}
