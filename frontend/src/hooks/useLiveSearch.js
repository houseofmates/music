// premium live search hook with intelligent debouncing and caching
import { useState, useEffect, useCallback, useRef } from 'react';

export const useLiveSearch = (
  searchFunction,
  options = {
    debounceMs: 300,
    minQueryLength: 1,
    cacheResults: true,
    maxCacheSize: 50
  }
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for debouncing and caching
  const debounceTimeoutRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastQueryRef = useRef('');
  const abortControllerRef = useRef(null);

  // Clear previous search when starting new one
  const clearPreviousSearch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Perform actual search with caching
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < options.minQueryLength) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Check cache first
    if (options.cacheResults && cacheRef.current.has(searchQuery)) {
      setResults(cacheRef.current.get(searchQuery));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create new abort controller for this search
      abortControllerRef.current = new AbortController();
      
      const searchResults = await searchFunction(searchQuery, {
        signal: abortControllerRef.current.signal
      });


      // Cache results if enabled
      if (options.cacheResults) {
        // Manage cache size
        if (cacheRef.current.size >= options.maxCacheSize) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(searchQuery, searchResults);
      }

      setResults(searchResults);
      lastQueryRef.current = searchQuery;
    } catch (err) {
      // Don't show error for aborted requests
      if (err.name !== 'AbortError') {
        setError(err.message || 'search failed');
      }
    } finally {
      setLoading(false);
    }
  }, [searchFunction, options.cacheResults, options.maxCacheSize, options.minQueryLength]);

  // Debounced search handler
  const debouncedSearch = useCallback((searchQuery) => {
    clearPreviousSearch();
    
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, options.debounceMs);
  }, [performSearch, clearPreviousSearch, options.debounceMs]);

  // Handle query change
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    debouncedSearch(newQuery.trim());
  }, [debouncedSearch]);

  // Expose raw state setter for direct value changes without triggering search
  const setQueryValue = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  // Immediate search for Enter key or when user explicitly wants instant search
  const handleImmediateSearch = useCallback(() => {
    clearPreviousSearch();
    performSearch(query.trim());
  }, [query, performSearch, clearPreviousSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    clearPreviousSearch();
  }, [clearPreviousSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPreviousSearch();
    };
  }, [clearPreviousSearch]);

  return {
    query,
    setQuery: handleQueryChange,
    setQueryValue,
    results,
    loading,
    error,
    clearSearch,
    immediateSearch: handleImmediateSearch
  };
};
