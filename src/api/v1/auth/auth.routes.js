// import local modules
import { googleLogin, googleLoginCallback } from './auth.controllers.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @controller GET /google
router.get('/google', googleLogin);

// @controller GET /google/callback
router.get('/google/callback', googleLoginCallback);

// export router
export default router;
