// import local modules
import { envConfig } from './utils/env.js';
import { healthCheckRouter, cohortRouter, authRouter, userRouter } from './api/routers.api.js';

// import external modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// create new express app
const app = express();

// middleware for usage of cookies
app.use(cookieParser(envConfig.COOKIE_SECRET));

// middleware for CORS configuration
app.use(
  cors({
    origin: envConfig.ORIGIN_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie', '*'],
  })
);

// middleware for handling JSON data
app.use(express.json());

// middleware for handling URL-encoded data
app.use(express.urlencoded({ extended: true }));

// middlewares for handling API routes
app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/cohort', cohortRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

// export app
export default app;
