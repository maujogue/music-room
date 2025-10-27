import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/apiFetch';

export type Filters = 'all' | 'event' | 'playlist' | 'user' | 'track';

const normalizeFilter = (f: any): Filters => {
  if (!f) return 'all';
  const s = String(f).toLowerCase();
  if (s === 'events') return 'event';
  if (s === 'playlists') return 'playlist';
  if (s === 'users') return 'user';
  if (s === 'tracks') return 'track';
  if (
    s === 'event' ||
    s === 'playlist' ||
    s === 'user' ||
    s === 'track' ||
    s === 'all'
  )
    return s as Filters;
  return 'all';
};

export default function useSearchGlobal(
  initialFilter: Filters | string = 'all'
) {
  const [query, setQuery] = useState('');
  const [filterInternal, setFilterInternal] = useState<Filters>(
    normalizeFilter(initialFilter)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HttpError | null>(null);
  const [results, setResults] = useState<any>({});

  const setFilter = (f: Filters | string) => {
    setFilterInternal(normalizeFilter(f));
  };

  const onChangeFilter = (f: string) => {
    setFilter(f);
  };

  useEffect(() => {
    if (!query) {
      setResults({});
      return;
    }
    const t = setTimeout(() => {
      void doSearch(query, filterInternal);
    }, 400);
    return () => clearTimeout(t);
  }, [query, filterInternal]);

  const doSearch = useCallback(async (q: string, f: Filters) => {
    setLoading(true);
    try {
      const uriQuery = encodeURIComponent(q);
      const uriFilter = encodeURIComponent(f);
      const res: any = await apiFetch<any>(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/search?q=${uriQuery}&type=${uriFilter}`
      );
      console.log('search results', res);
      if (res?.success) {
        setError(null);
        setResults(res.data || {});
      } else {
        setError({
          message: 'Failed to fetch search results',
          status: res.status,
        });
        setResults({});
      }
    } catch (err) {
      console.error('search error', err);
      setError({
        message: 'Failed to fetch search results',
        status: 500,
      });
      setResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    query,
    setQuery,
    filter: filterInternal,
    setFilter,
    onChangeFilter,
    loading,
    results,
    error,
  } as const;
}
