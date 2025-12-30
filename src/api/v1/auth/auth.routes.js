// import local modules
import {
  googleLogin,
  googleLoginCallback,
  googleLogout,
  refreshTokens,
} from './auth.controllers.js';
import { isLoggedIn, isSessionActive } from '../../../utils/route-protectors/index.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @route GET /login/google
router.get('/login/google', isSessionActive, googleLogin);

// @route GET /login/google/callback
router.get('/login/google/callback', googleLoginCallback);

// @route GET /logout
router.get('/logout', isLoggedIn, googleLogout);

// @route PATCH /token/refresh
router.get('/token/refresh', refreshTokens);

// export router
export default router;
