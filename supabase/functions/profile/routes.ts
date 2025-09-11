import { Hono } from 'jsr:@hono/hono';
import {
  fetchUserProfile,
  updateProfile,
  fetchUserFollows,
  followUser,
  unfollowUser,
  searchUsers,
  checkFriendship,
} from './controller.ts';

const router = new Hono();

// Profile CRUD operations
router.get('/user/:userId', fetchUserProfile);
router.put('/update', updateProfile);

// Follow system
router.get('/follows/:userId', fetchUserFollows);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/search', searchUsers);
router.get('/friends/:userId1/:userId2', checkFriendship);

export default router;
