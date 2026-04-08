import PropTypes from 'prop-types';
import { SearchBar } from '../common/SearchBar';

export const AssetFilterBar = ({ search, onSearchChange, activeType, onTypeChange, sort, onSortChange }) => {
  const types = [
    { label: 'All', value: 'All' },
    { label: 'Videos', value: 'video' },
    { label: 'Images', value: 'image' },
    { label: 'Documents', value: 'document' },
    { label: 'Audio', value: 'audio' }
  ];

  return (
    <div className="panel animate-fade-in p-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search assets by filename"
        />
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onTypeChange(type.value)}
              className={`h-10 rounded-control border px-4 text-[13px] font-semibold transition ${activeType === type.value ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-panelAlt text-copyMuted hover:text-copy'}`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <label className="grid gap-2">
          <span className="label-small">Sort</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value)} className="input-base min-w-[180px]">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="largest">Largest</option>
          </select>
        </label>
      </div>
    </div>
  );
};

AssetFilterBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  activeType: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  sort: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired
};

