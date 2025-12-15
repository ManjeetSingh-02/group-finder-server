// import local modules
import { googleLogin, googleLoginCallback } from './auth.controllers.js';
import { isSessionActive } from '../../../utils/route-protector.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @controller GET /login/google
router.get('/login/google', isSessionActive, googleLogin);

// @controller GET /login/google/callback
router.get('/login/google/callback', googleLoginCallback);

// export router
export default router;
