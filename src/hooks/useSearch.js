import { useState, useEffect, useMemo } from 'react';
import { brandData } from '../data/brandData';

export const useSearch = (query) => {
  const [allModels, setAllModels] = useState([]);

  useEffect(() => {
    const models = [];
    Object.entries(brandData).forEach(([brandKey, brandInfo]) => {
      if (brandInfo.categories) {
        Object.values(brandInfo.categories).forEach((category) => {
          if (Array.isArray(category)) {
            category.forEach((model) => {
              models.push({
                brand: brandInfo.brand || brandKey,
                model: model.name,
                brandKey,
                searchString: `${brandInfo.brand || brandKey} ${model.name}`.toLowerCase()
              });
            });
          }
        });
      }
    });
    setAllModels(models);
  }, []);

  const searchResults = useMemo(() => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return [];
    }

    const searchTerms = trimmedQuery.toLowerCase().split(' ');
    return allModels.filter((model) =>
      searchTerms.every(term =>
        model.searchString.includes(term)
      )
    );
  }, [query, allModels]);

  return { searchResults, allModels };
};