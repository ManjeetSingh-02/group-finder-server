// import local modules
import { googleLogin, googleLoginCallback, googleLogout } from './auth.controllers.js';
import { isLoggedIn, isSessionActive } from '../../../utils/route-protectors/index.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @controller GET /login/google
router.get('/login/google', isSessionActive, googleLogin);

// @controller GET /login/google/callback
router.get('/login/google/callback', googleLoginCallback);

// @controller GET /logout
router.get('/logout', isLoggedIn, googleLogout);

// export router
export default router;
