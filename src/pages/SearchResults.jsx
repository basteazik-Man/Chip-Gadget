import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import { motion } from 'framer-motion';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  
  // ✅ ЗАЩИТА ДОБАВЛЕНА
  const searchHook = useSearch || (() => ({ searchResults: [] }));
  const { searchResults = [] } = searchHook(searchQuery);

  const handleQueryChange = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleModelClick = (brandKey, model) => {
    navigate(`/brand/${brandKey}/model/${encodeURIComponent(model)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium relative z-10"
        >
          ← Назад
        </button>

        {/* Поисковая строка */}
        <div className="mb-8 relative z-10">
          <SearchBar 
            query={searchQuery}
            onQueryChange={handleQueryChange}
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 relative z-10">
          Результаты поиска: {searchQuery || 'все модели'}
        </h1>

        {/* Сетка моделей в стиле BrandPage */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 relative z-10">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleModelClick(item.brandKey, item.model)}
                className="bg-white rounded-2xl py-4 px-6 text-gray-800 font-semibold border border-gray-200 hover:shadow-lg transition-all text-base md:text-lg w-full text-center relative z-10"
                style={{ cursor: 'pointer' }}
              >
                {item.model}
                <div className="text-xs text-gray-500 mt-1 font-normal">
                  {item.brand}
                </div>
              </motion.button>
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">Ничего не найдено для "{searchQuery}"</p>
              <p className="text-gray-400 mt-2">Попробуйте изменить запрос</p>
            </div>
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">Введите запрос для поиска моделей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;