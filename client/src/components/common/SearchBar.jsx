import PropTypes from 'prop-types';
import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search' }) => (
  <label className="relative block w-full">
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copySoft" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="input-base w-full pl-10"
    />
  </label>
);

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

