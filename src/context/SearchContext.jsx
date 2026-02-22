import React, { createContext, useContext, useEffect, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(recentSearches)
    );
  }, [recentSearches]);

  const addSearch = (dish) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== dish.id);
      return [{ ...dish, searchedAt: Date.now() }, ...filtered];
    });
  };

  const removeSearch = (id) => {
    setRecentSearches((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const clearAll = () => {
    setRecentSearches([]);
  };

  return (
    <SearchContext.Provider
      value={{
        recentSearches,
        addSearch,
        removeSearch,
        clearAll,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
