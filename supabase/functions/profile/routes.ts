import { Hono } from 'jsr:@hono/hono';
import {
  fetchProfile,
  updateProfile,
  fetchUserFollowers,
  fetchUserFollowing,
  followUser,
  unfollowUser,
  searchUsers,
  checkFriendship,
} from './controller.ts';

const router = new Hono();

// Profile CRUD operations
router.get('/get', fetchProfile);
router.put('/update', updateProfile);

// Follow system
router.get('/followers/:userId', fetchUserFollowers);
router.get('/following/:userId', fetchUserFollowing);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/search', searchUsers);
router.get('/friends/:userId1/:userId2', checkFriendship);

export default router;
