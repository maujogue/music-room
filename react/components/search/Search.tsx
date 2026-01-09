import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native';
import useSearchGlobal from '@/hooks/useSearchGlobal';
import SearchHeader from './SearchHeader';
import ResultsSection from './ResultsSection';
import TrackListItem from '@/components/track/TrackListItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import UserListItem from '@/components/profile/UserListItem';
import EventListItem from '@/components/events/EventListItem';
import { useAppToast } from '@/hooks/useAppToast';

interface Props {
  placeholder?: string;
  showFilters?: boolean;
  defaultType?: string;
  renderItemTrack?: (item: any) => React.ReactNode;
  renderItemPlaylist?: (item: any) => React.ReactNode;
  renderItemUser?: (item: any) => React.ReactNode;
  renderItemEvent?: (item: any) => React.ReactNode;
  noHorizontalPadding?: boolean;
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
    <UserListItem user={item} key={item.id} showActionButtons={false} />
  ),
  renderItemEvent = (item: any) => (
    <EventListItem event={item} owner={item.owner} key={item.id} />
  ),
  noHorizontalPadding = false,
}: Props) {
  const { query, setQuery, filter, setFilter, onChangeFilter, results, error } =
    useSearchGlobal(defaultType);

  const normalizeItems = <T,>(payload: any): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as T[];
    if (payload.items && Array.isArray(payload.items))
      return payload.items as T[];
    if (
      payload.tracks &&
      payload.tracks.items &&
      Array.isArray(payload.tracks.items)
    )
      return payload.tracks.items as T[];
    if (
      payload.playlists &&
      payload.playlists.items &&
      Array.isArray(payload.playlists.items)
    )
      return payload.playlists.items as T[];
    if (payload.events && Array.isArray(payload.events))
      return payload.events as T[];
    return [];
  };

  const users = normalizeItems<any>(results.userResults ?? []);
  const playlists = normalizeItems<any>(results.playlistResults ?? []);
  const tracks = normalizeItems<any>(results.trackResults ?? []);
  const events = normalizeItems<any>(results.eventResults ?? []);
  const toast = useAppToast();
  const limit = filter === 'all' ? 3 : undefined;

  useEffect(() => {
    if (error) {
      toast.error({
        title: 'Search Error',
        description: error.message,
        duration: 3000,
      });
    }
  }, [error]);

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
          noHorizontalPadding={noHorizontalPadding}
        />

        <ResultsSection
          title='Playlists'
          items={playlists}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
          }}
          renderItem={renderItemPlaylist}
          noHorizontalPadding={noHorizontalPadding}
        />

        <ResultsSection
          title='Events'
          items={events}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
          }}
          renderItem={renderItemEvent}
          noHorizontalPadding={noHorizontalPadding}
        />

        <ResultsSection
          title='Users'
          items={users}
          limit={limit}
          onShowMore={label => {
            setFilter(label);
          }}
          renderItem={renderItemUser}
          noHorizontalPadding={noHorizontalPadding}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
