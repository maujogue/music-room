import {
  handleVote,
  handleUnvote,
  getVotesForEvent
} from '../services/votes.ts';
import { getEventMemberDetails } from '../services/events.ts';
import { sendErrorMessage, sendSuccessMessage } from './error.ts';
import { getOwnerCurrentPlayingTrack } from "../services/player.ts";

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export interface VoteMessage extends WebSocketMessage {
  type: 'vote';
  eventId: string;
  trackId: string;
}

export async function handleMessage(
  userId: string,
  userEmail: string,
  message: WebSocketMessage,
  socket: WebSocket
): Promise<void> {
  try {
    console.log('ws: message from user', { userId, msgType: message.type });

    switch (message.type) {
      case 'ping':
        handlePing(userId, socket, message);
        break;

      case 'vote':
        await handleVoteMessage(userId, message, socket);
        break;

      case 'unvote':
        await handleUnvoteMessage(userId, message, socket);
        break;

      case 'vote:get':
        await handleGetVoteMessage(userId, message, socket);
        break;

      case 'user:info':
        handleUserInfo(userId, message, socket);
        break;

      default:
        console.log('ws: unhandled message type:', message.type);
        sendErrorMessage(socket, 'Unknown message type');
    }
  } catch (error) {
    console.error('ws: error processing message:', error);
    sendErrorMessage(socket, 'Error processing message');
  }
}

async function handleUserInfo(userId: string, message: WebSocketMessage, socket: WebSocket): Promise<void> {
  try {
    if (!isUserInfoMessage(message)) {
      sendErrorMessage(socket, 'Invalid user info message format');
      return;
    }
    const userDataRes = await getEventMemberDetails(message.eventId!, userId);
    if (userDataRes.success && userDataRes.data) {
      const vote_remaining = userDataRes.data.max_votes - userDataRes.data.vote_count;
      sendSuccessMessage(socket, {
        type: 'user:info:response',
        userId: userId,
        vote_remaining: vote_remaining,
        voteCount: userDataRes.data.vote_count,
        voteMax: userDataRes.data.max_votes,
        voted_tracks: userDataRes.data.voted_tracks,
        message: 'User info retrieved successfully'
      });
    }
  } catch (error) {
    console.error('ws: error handling user info message:', error);
    sendErrorMessage(socket, 'Error processing user info message');
  }
}

async function handlePing(userId: string, socket: WebSocket, message: WebSocketMessage): Promise<void> {
  try {
    const eventId = message.eventId as string;
    const ownerTrack = await getOwnerCurrentPlayingTrack(eventId);
    sendSuccessMessage(socket, {
      type: 'pong',
      track: ownerTrack,
    });
  } catch (error) {
    console.error('ws: error sending pong:', error);
  }
}

async function handleUnvoteMessage(
  userId: string,
  message: WebSocketMessage,
  socket: WebSocket
): Promise<void> {
  if (!isUnvoteMessage(message)) {
    sendErrorMessage(socket, 'Invalid unvote message format');
    return;
  }

  const result = await handleUnvote(userId, message.trackId, message.eventId);

  if (result.success) {
    sendSuccessMessage(socket, {
      type: 'unvote:confirmed',
      eventId: result.data!.eventId,
      trackId: result.data!.trackId,
      voteCount: result.data!.voteCount,
      voters: result.data!.voters,
      message: result.message
    });
  } else {
    sendErrorMessage(socket, result.message);
  }
}

async function handleGetVoteMessage(
  userId: string,
  message: WebSocketMessage,
  socket: WebSocket
): Promise<void> {
  if (!isGetVoteMessage(message)) {
    sendErrorMessage(socket, 'Invalid get vote message format');
    return;
  }

  const result = await getVotesForEvent(userId, message.eventId);

  if (result.success) {
    sendSuccessMessage(socket, {
      type: 'vote:list',
      eventId: message.eventId,
      votes: result.data,
      message: result.message
    });
  } else {
    sendErrorMessage(socket, result.message ? result.message : 'Unknown error');
  }
}


async function handleVoteMessage(
  userId: string,
  message: WebSocketMessage,
  socket: WebSocket
): Promise<void> {
  if (!isVoteMessage(message)) {
    sendErrorMessage(socket, 'Invalid vote message format');
    return;
  }

  const result = await handleVote(userId, message);

  if (result.success) {
    sendSuccessMessage(socket, {
      type: 'vote:confirmed',
      eventId: result.data!.eventId,
      trackId: result.data!.trackId,
      message: result.message
    });
  } else {
    sendErrorMessage(socket, result.message);
  }
}

function isVoteMessage(message: WebSocketMessage): message is VoteMessage {
  console.log('Checking if message is a vote message:', message);
  return message.type === 'vote' &&
         typeof message.eventId === 'string' &&
         typeof message.trackId === 'string';
}

function isUnvoteMessage(message: WebSocketMessage): message is { type: 'unvote'; eventId: string; trackId: string; } {
  return message.type === 'unvote' &&
         typeof message.eventId === 'string' &&
         typeof message.trackId === 'string';
}

function isGetVoteMessage(message: WebSocketMessage): message is { type: 'vote:get'; eventId: string;} {
  return message.type === 'vote:get' &&
         typeof message.eventId === 'string';
}

function isUserInfoMessage(message: WebSocketMessage): message is { type: 'user:info'; eventId: string;} {
  return message.type === 'user:info' &&
         typeof message.eventId === 'string';
}
