import React from 'react';

const SearchBar = ({ query, onQueryChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="🔍 Поиск модели или бренда (например, note, iphone 15, galaxy)"
          className="w-full p-4 rounded-l-2xl border border-gray-300 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-800 text-lg transition-all"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className={`px-6 py-4 font-semibold rounded-r-2xl transition-all ${
            query.trim() 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Поиск
        </button>
      </div>
    </form>
  );
};

export default SearchBar;