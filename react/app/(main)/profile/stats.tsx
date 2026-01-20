import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authCtx';
import {
  useUserStats,
  useFriendsLeaderboard,
  LeaderboardEntry,
} from '@/hooks/useStats';
import useTracks from '@/hooks/useTracks';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';
import { ArrowLeftIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import TrackListItem from '@/components/track/TrackListItem';

function StatCard({
  label,
  value,
  color = 'bg-primary-500',
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <View
      className={`flex-1 p-4 rounded-xl ${color} bg-opacity-10 items-center justify-center`}
    >
      <Text className='text-3xl font-bold text-typography-900 mb-1'>
        {value}
      </Text>
      <Text className='text-xs text-typography-500 text-center uppercase tracking-wider'>
        {label}
      </Text>
    </View>
  );
}

function PodiumItem({
  entry,
  rank,
  isUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isUser: boolean;
}) {
  const height = rank === 1 ? 160 : rank === 2 ? 120 : 100;
  const color =
    rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-orange-300';

  return (
    <VStack className='items-center justify-end flex-1 gap-2'>
      <View className='items-center'>
        {entry.avatar_url ? (
          <Image
            source={{ uri: entry.avatar_url }}
            alt={entry.username}
            className='w-10 h-10 rounded-full mb-1 border-2 border-background-0'
          />
        ) : (
          <View className='w-10 h-10 rounded-full bg-primary-100 items-center justify-center mb-1 border-2 border-background-0'>
            <Text className='text-xs font-bold'>
              {entry.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          className={`text-xs font-medium ${isUser ? 'text-primary-500 font-bold' : 'text-typography-700'}`}
          numberOfLines={1}
        >
          {entry.username}
        </Text>
        <Text className='text-[10px] text-typography-400'>
          {entry.successful_votes} pts
        </Text>
      </View>
      <View
        className={`w-full rounded-t-lg items-center justify-end p-2 ${color} opacity-80`}
        style={{ height }}
      >
        <Text className='text-white font-bold text-xl'>{rank}</Text>
      </View>
    </VStack>
  );
}

function LeaderboardRow({
  entry,
  rank,
  isUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isUser: boolean;
}) {
  return (
    <HStack
      className={`items-center p-3 rounded-lg ${isUser ? 'bg-primary-50' : 'bg-background-50'} justify-between`}
    >
      <HStack className='items-center gap-3'>
        <Text className='font-bold text-typography-500 w-6'>{rank}</Text>
        {entry.avatar_url ? (
          <Image
            source={{ uri: entry.avatar_url }}
            alt={entry.username}
            className='w-10 h-10 rounded-full'
          />
        ) : (
          <View className='w-10 h-10 rounded-full bg-primary-100 items-center justify-center'>
            <Text className='text-xs font-bold'>
              {entry.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          className={`font-medium ${isUser ? 'text-primary-600' : 'text-typography-900'}`}
        >
          {entry.username}
        </Text>
      </HStack>
      <VStack className='items-end'>
        <Text className='font-bold text-typography-900'>
          {entry.successful_votes}
        </Text>
        <Text className='text-[10px] text-typography-400'>Points</Text>
      </VStack>
    </HStack>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id || '');
  const { data: leaderboard, isLoading: lbLoading } = useFriendsLeaderboard(
    user?.id || ''
  );

  const trackIds = stats?.most_voted_tracks?.map(t => t.track_id) || [];
  const { tracks: topTracks, loading: tracksLoading } = useTracks(trackIds);

  if (!user) return null;

  const isLoading = statsLoading || lbLoading;

  return (
    <View className='flex-1 bg-background-0'>
      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <Spinner size='large' color='$primary500' />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          className='flex-1'
        >
          {/* Overview Cards */}
          <VStack className='gap-4 mb-8'>
            <Text className='text-lg font-bold text-typography-900'>
              Overview
            </Text>
            <HStack className='gap-3'>
              <StatCard
                label='Playlists'
                value={stats?.playlists_count || 0}
                color='bg-blue-100'
              />
              <StatCard
                label='Events'
                value={stats?.events_participated || 0}
                color='bg-purple-100'
              />
            </HStack>
            <HStack className='gap-3'>
              <StatCard
                label='Votes Cast'
                value={stats?.votes_cast || 0}
                color='bg-orange-100'
              />
              <StatCard
                label='Succeeded'
                value={stats?.successful_votes || 0}
                color='bg-green-100'
              />
            </HStack>
          </VStack>

          <Divider className='my-4' />

          {/* Leaderboard */}
          <VStack className='gap-6'>
            <Text className='text-lg font-bold text-typography-900'>
              Friends Leaderboard
            </Text>

            {leaderboard && leaderboard.length >= 3 ? (
              <HStack className='items-end justify-center px-4 h-48 gap-2'>
                {/* Order: 2, 1, 3 */}
                <PodiumItem
                  entry={leaderboard[1]}
                  rank={2}
                  isUser={leaderboard[1].user_id === user.id}
                />
                <PodiumItem
                  entry={leaderboard[0]}
                  rank={1}
                  isUser={leaderboard[0].user_id === user.id}
                />
                <PodiumItem
                  entry={leaderboard[2]}
                  rank={3}
                  isUser={leaderboard[2].user_id === user.id}
                />
              </HStack>
            ) : null}

            {/* List View for all */}
            <VStack className='gap-2'>
              {leaderboard?.map((entry, index) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  rank={index + 1}
                  isUser={entry.user_id === user.id}
                />
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <Text className='text-center text-typography-400 py-4'>
                  No friends to compare with yet!
                </Text>
              )}
            </VStack>
          </VStack>

          {/* Top Tracks (Optional) */}
          {stats?.most_voted_tracks && stats.most_voted_tracks.length > 0 && (
            <VStack className='mt-8 gap-4'>
              <Text className='text-lg font-bold text-typography-900'>
                Your Top Selections
              </Text>
              {tracksLoading ? (
                <View className='py-8 items-center'>
                  <Spinner size='small' color='$primary500' />
                </View>
              ) : (
                stats.most_voted_tracks.map(statTrack => {
                  const normalizedId = statTrack.track_id.includes(':')
                    ? statTrack.track_id.split(':').pop()
                    : statTrack.track_id;
                  const fullTrack = topTracks.find(t => t.id === normalizedId);
                  if (!fullTrack) return null;

                  return (
                    <TrackListItem
                      key={statTrack.track_id}
                      track={fullTrack}
                      voteCount={statTrack.my_vote_count}
                    />
                  );
                })
              )}
            </VStack>
          )}
        </ScrollView>
      )}
    </View>
  );
}
