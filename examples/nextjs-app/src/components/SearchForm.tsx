'use client';

import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

export default function SearchForm({ 
  onSearch, 
  placeholder = 'Search...', 
  initialQuery = '' 
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        data-testid="search-input"
      />
      <button 
        type="submit" 
        className="search-button"
        data-testid="search-button"
      >
        Search
      </button>
    </form>
  );
}
