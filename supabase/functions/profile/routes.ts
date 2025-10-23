import { Hono } from '@hono/hono';
import {
  fetchUserProfile,
  updateProfile,
  fetchUserFollows,
  followUser,
  unfollowUser,
  searchUsers
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

export default router;
