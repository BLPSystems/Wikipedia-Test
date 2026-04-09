interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  size?: 'default' | 'large';
}

export function SearchBar({ value, onChange, onSubmit, placeholder = 'Search articles...', size = 'default' }: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.();
  }

  return (
    <form className={`search-bar search-bar--${size}`} onSubmit={handleSubmit} role="search">
      <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
      />
      {value && (
        <button type="button" className="search-bar__clear" onClick={() => onChange('')} aria-label="Clear search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m18 6-12 12M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </form>
  );
}
