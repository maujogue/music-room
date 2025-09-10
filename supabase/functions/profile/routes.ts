import { Hono } from 'jsr:@hono/hono';
import {
  fetchProfile,
  updateProfile,
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
  searchUsers,
} from './controller.ts';

const router = new Hono();

// Profile CRUD operations
router.get('/get-profile', fetchProfile);
router.put('/update-profile', updateProfile);

// Follow system
router.get('/followers', fetchFollowers);
router.get('/following', fetchFollowing);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/search', searchUsers);

export default router;
