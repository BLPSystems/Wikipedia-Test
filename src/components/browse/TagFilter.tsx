interface TagFilterProps {
  tags: string[];
  selected: string;
  onSelect: (tag: string) => void;
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="tag-filter" role="group" aria-label="Filter by tag">
      <button
        className={`tag-filter__btn ${selected === '' ? 'tag-filter__btn--active' : ''}`}
        onClick={() => onSelect('')}
      >
        All
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          className={`tag-filter__btn ${selected === tag ? 'tag-filter__btn--active' : ''}`}
          onClick={() => onSelect(tag === selected ? '' : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
