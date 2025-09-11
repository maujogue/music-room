import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native';
import useSearchGlobal from '@/hooks/useSearchGlobal';
import SearchHeader from './SearchHeader';
import ResultsSection from './ResultsSection';
import TrackListItem from '@/components/track/TrackListItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import UserListItem from '@/components/profile/UserListItem';
import EventListItem from '@/components/events/EventListItem';
import { Text } from '@/components/ui/text';

interface Props {
  showFilters?: boolean;
  defaultType?: string;
}

export default function Search({ showFilters = true, defaultType = 'All' }: Props) {
  const {
    query,
    setQuery,
    filter,
    setFilter,
    onChangeFilter,
    loading,
    results
  } = useSearchGlobal(defaultType);

  const users = results.userResults ?? [];
  const playlists = results.playlistResults?.playlists?.items ?? results.playlistResults ?? [];
  const tracks = results.trackResults?.tracks?.items ?? results.trackResults ?? [];
  const events = results.eventResults?.events ?? results.eventResults ?? [];

  const limit = filter === 'all' ? 3 : undefined;

  return (
    <GestureHandlerRootView>
      <ScrollView keyboardShouldPersistTaps="handled">
        <SearchHeader
          query={query}
          onChangeQuery={setQuery}
          selectedFilter={filter}
          onChangeFilter={onChangeFilter}
          showFilters={showFilters}
          defaultType={defaultType}
        />

        <ResultsSection
          title="Tracks"
          items={tracks}
          limit={limit}
          renderItem={(t: any) => <TrackListItem track={t} key={t.id} />}
        />

        <ResultsSection
          title="Playlists"
          items={playlists}
          limit={limit}
          onShowMore={(label) => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={(p: any) => <PlaylistListItem playlist={p} key={p.id} />}
        />

        <ResultsSection
          title="Users"
          items={users}
          limit={limit}
          onShowMore={(label) => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={(u: any) => <UserListItem user={u} key={u.id} showFollowButtons={false} />}
        />

        <ResultsSection
          title="Events"
          items={events}
          limit={limit}
          onShowMore={(label) => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={(e: any) => <EventListItem event={e} key={e.id} />}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
