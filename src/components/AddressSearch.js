// Address search with autocomplete via api.floodcaster.com/geocode
import { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../api';

const DEBOUNCE_MS = 300;

export default function AddressSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = async (q) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(q)}&limit=5`);
      if (resp.ok) {
        const data = await resp.json();
        setResults(data.data?.results || []);
        setOpen(true);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), DEBOUNCE_MS);
  };

  const handleSelect = (result) => {
    setQuery(result.display_name);
    setOpen(false);
    setResults([]);
    if (onSelect) {
      onSelect(result);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="address-search" ref={wrapRef}>
      <div className="address-input-wrap">
        <input
          type="text"
          className="address-input"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search an address..."
          autoComplete="off"
          aria-label="Search address"
        />
        {loading && <span className="address-spinner" />}
      </div>

      {open && results.length > 0 && (
        <ul className="address-results" role="listbox">
          {results.map((r, i) => (
            <li
              key={i}
              className="address-result"
              role="option"
              aria-selected="false"
              onClick={() => handleSelect(r)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(r)}
              tabIndex={0}
            >
              <span className="address-name">{r.display_name}</span>
              <span className="address-detail">
                {[r.city, r.state, r.country_code].filter(Boolean).join(', ')}
                {r.postcode && ` ${r.postcode}`}
              </span>
              <span className="address-source">{r.source}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
