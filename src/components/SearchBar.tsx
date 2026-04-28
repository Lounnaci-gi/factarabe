import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (numab: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  // Effet de debounce pour déclencher la recherche automatiquement
  useEffect(() => {
    const handler = setTimeout(() => {
      const cleanValue = value.trim();
      // Recherche uniquement si on a exactement 6 caractères !
      if (cleanValue.length === 6) {
        onSearch(cleanValue);
      }
    }, 100); // Délai réduit puisqu'on attend la saisie exacte de 6 caractères

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Rechercher NUMAB (ex: 001000)..."
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        maxLength={6}
        autoFocus
      />
    </div>
  );
};
