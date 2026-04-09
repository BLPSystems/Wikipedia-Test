import type { ReactNode } from 'react';

interface WikiLayoutProps {
  main: ReactNode;
  sidebar?: ReactNode;
}

export function WikiLayout({ main, sidebar }: WikiLayoutProps) {
  return (
    <div className="wiki-layout">
      <main className="wiki-layout__main">{main}</main>
      {sidebar && <aside className="wiki-layout__sidebar">{sidebar}</aside>}
    </div>
  );
}
