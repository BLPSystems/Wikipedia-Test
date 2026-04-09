import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface SiteHeaderProps {
  onUploadClick: () => void;
}

export function SiteHeader({ onUploadClick }: SiteHeaderProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') ?? '';
    if (location.pathname === '/browse') setQuery(q);
  }, [location]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : '/browse');
    inputRef.current?.blur();
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.9" />
            <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
          </svg>
          <span>Knowledge Base</span>
        </Link>

        <form className="site-header__search" onSubmit={handleSearch} role="search">
          <svg className="site-header__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search articles..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search articles"
          />
        </form>

        <nav className="site-header__nav">
          <Link to="/browse" className="site-header__nav-link">Browse</Link>
          <button className="btn btn--primary" onClick={onUploadClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 15V3m0 0-4 4m4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Upload
          </button>
        </nav>
      </div>
    </header>
  );
}
