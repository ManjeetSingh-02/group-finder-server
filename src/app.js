// import local modules
import { envConfig } from './utils/env.js';

// import external modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// create new express app
const app = express();

// middleware for usage of cookies
app.use(cookieParser());

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

// middleware for serving static files
app.use(express.static('public'));

// export app
export default app;
