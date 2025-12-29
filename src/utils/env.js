// import package modules
import { z } from 'zod';

// config for environment variables
export const envConfig = {
  ORIGIN_URL: String(process.env.ORIGIN_URL),
  PORT: Number(process.env.PORT),
  MONGODB_URI: String(process.env.MONGODB_URI),
  NODE_ENV: String(process.env.NODE_ENV),
  COOKIE_SECRET: String(process.env.COOKIE_SECRET),
  ACCESS_TOKEN_SECRET: String(process.env.ACCESS_TOKEN_SECRET),
  REFRESH_TOKEN_SECRET: String(process.env.REFRESH_TOKEN_SECRET),
  GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
  GOOGLE_REDIRECT_URI: String(process.env.GOOGLE_REDIRECT_URI),
};

// zod schema for environment variables
const envSchema = z.object({
  ORIGIN_URL: z.url({ error: 'ORIGIN_URL must be a valid URL' }),
  PORT: z.number().int().positive(),
  MONGODB_URI: z.url({ error: 'MONGO_URI must be a valid MongoDB URI' }),
  NODE_ENV: z.enum(['development', 'testing', 'production']),
  COOKIE_SECRET: z.string().min(32, { error: 'COOKIE_SECRET must be 32 chars' }),
  ACCESS_TOKEN_SECRET: z.string().min(32, { error: 'ACCESS_TOKEN_SECRET must be 32 chars' }),
  REFRESH_TOKEN_SECRET: z.string().min(32, { error: 'REFRESH_TOKEN_SECRET must be 32 chars' }),
  GOOGLE_CLIENT_ID: z.string().trim().nonempty({ error: 'GOOGLE_CLIENT_ID is required' }),
  GOOGLE_CLIENT_SECRET: z.string().trim().nonempty({ error: 'GOOGLE_CLIENT_SECRET is required' }),
  GOOGLE_REDIRECT_URI: z.url({ error: 'GOOGLE_REDIRECT_URI must be a valid URL' }),
});

// function to validate environment variables
export const validateEnv = () => {
  // get parsed result of environment variables
  const result = envSchema.safeParse(envConfig);

  // return new Promise
  return new Promise((resolve, reject) => {
    // if validation succeeds, resolves with a success message
    if (result.success) resolve(console.log('Env variables validation: ✅'));

    // prepare validation error messages
    const errorMessages = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // if validation fails, rejects with error messages
    reject(`Env variables validation: ❌\n${errorMessages}`);
  });
};
