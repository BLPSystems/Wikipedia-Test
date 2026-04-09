import { useEffect, useState } from 'react';
import type { ArticleSection } from '../../lib/types';

interface TableOfContentsProps {
  sections: ArticleSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = sections.map(s => document.getElementById(`section-${s.id}`));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    headings.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <p className="toc__title">Contents</p>
      <ol className="toc__list">
        {sections.map((section, i) => (
          <li key={section.id} className={`toc__item toc__item--level-${section.level}`}>
            <a
              href={`#section-${section.id}`}
              className={`toc__link ${activeId === `section-${section.id}` ? 'toc__link--active' : ''}`}
            >
              <span className="toc__num">{i + 1}</span>
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
