// import package modules
import { z } from 'zod';

// config for environment variables
export const envConfig = {
  ORIGIN_URL: String(process.env.ORIGIN_URL),
  PORT: Number(process.env.PORT),
  MONGODB_URI: String(process.env.MONGODB_URI),
  NODE_ENV: String(process.env.NODE_ENV),
};

// zod schema for environment variables
export const envSchema = z.object({
  ORIGIN_URL: z.url({ message: 'ORIGIN_URL must be a valid URL' }),
  PORT: z.number().int().positive(),
  MONGODB_URI: z.url({ message: 'MONGO_URI must be a valid MongoDB URI' }),
  NODE_ENV: z.enum(['development', 'testing', 'production']),
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
