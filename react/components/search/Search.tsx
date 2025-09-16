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

interface Props {
  placeholder?: string;
  showFilters?: boolean;
  defaultType?: string;
  renderItemTrack?: (item: any) => React.ReactNode;
  renderItemPlaylist?: (item: any) => React.ReactNode;
  renderItemUser?: (item: any) => React.ReactNode;
  renderItemEvent?: (item: any) => React.ReactNode;
}

export default function Search({
  placeholder = 'Search for songs, playlists, users, events...',
  showFilters = true,
  defaultType = 'All',
  renderItemTrack = (item: any) => <TrackListItem track={item} key={item.id} />,
  renderItemPlaylist = (item: any) => (
    <PlaylistListItem playlist={item} key={item.id} />
  ),
  renderItemUser = (item: any) => (
    <UserListItem user={item} key={item.id} showFollowButtons={false} />
  ),
  renderItemEvent = (item: any) => <EventListItem event={item} key={item.id} />,
}: Props) {
  const { query, setQuery, filter, setFilter, onChangeFilter, results } =
    useSearchGlobal(defaultType);

  const users = results.userResults ?? [];
  const playlists =
    results.playlistResults?.playlists?.items ?? results.playlistResults ?? [];
  const tracks =
    results.trackResults?.tracks?.items ?? results.trackResults ?? [];
  const events = results.eventResults?.events ?? results.eventResults ?? [];

  const limit = filter === 'all' ? 3 : undefined;

  console.log('Search results:', tracks);

  return (
    <GestureHandlerRootView>
      <ScrollView keyboardShouldPersistTaps='handled'>
        <SearchHeader
          placeholder={placeholder}
          query={query}
          onChangeQuery={setQuery}
          selectedFilter={filter}
          onChangeFilter={onChangeFilter}
          showFilters={showFilters}
          defaultType={defaultType}
        />

        <ResultsSection
          title='Tracks'
          items={tracks}
          limit={limit}
          renderItem={renderItemTrack}
        />

        <ResultsSection
          title='Playlists'
          items={playlists}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={renderItemPlaylist}
        />

        <ResultsSection
          title='Events'
          items={events}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={renderItemEvent}
        />

        <ResultsSection
          title='Users'
          items={users}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
            console.log('filter:', filter);
          }}
          renderItem={renderItemUser}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
