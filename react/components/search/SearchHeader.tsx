import React from 'react';
import { Box } from '@/components/ui/box';
import { SearchBar } from '@/components/ui/searchbar';
import FilterChips from '@/components/ui/filter-chips';

type Props = {
  query: string;
  placeholder?: string;
  onChangeQuery: (q: string) => void;
  selectedFilter: string;
  onChangeFilter: (f: string) => void;
  showFilters?: boolean;
  defaultType?: string;
};

export default function SearchHeader({
  query,
  onChangeQuery,
  selectedFilter,
  onChangeFilter,
  showFilters = true,
  defaultType,
  placeholder,
}: Props) {
  // map internal filter values back to UI labels
  const mapFilterToLabel = (filter: string) => {
    switch (filter) {
      case 'event':
        return 'Events';
      case 'playlist':
        return 'Playlists';
      case 'user':
        return 'Users';
      case 'track':
        return 'Tracks';
      case 'all':
        return 'All';
      default:
        return filter;
    }
  };

  return (
    <Box className='pt-5 px-6'>
      <SearchBar
        value={query}
        onChange={onChangeQuery}
        placeholder={placeholder}
      />
      {showFilters && (
        <Box className='px-0 pt-4'>
          <FilterChips
            defaultActive={defaultType}
            active={mapFilterToLabel(selectedFilter)}
            filters={['Events', 'Playlists', 'Users']}
            onChange={onChangeFilter}
          />
        </Box>
      )}
    </Box>
  );
}
