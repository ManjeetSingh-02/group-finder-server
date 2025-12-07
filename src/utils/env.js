// import package modules
import { z } from 'zod';

// config for environment variables
export const envConfig = {
  ORIGIN_URL: String(process.env.ORIGIN_URL),
  PORT: Number(process.env.PORT),
  NODE_ENV: String(process.env.NODE_ENV),
};

// zod schema for environment variables
export const envSchema = z.object({
  ORIGIN_URL: z.url({ message: 'ORIGIN_URL must be a valid URL' }),
  PORT: z.number().int().positive(),
  NODE_ENV: z.enum(['development', 'testing', 'production']),
});

// function to validate environment variables
export const validateEnv = () => {
  // get parsed result of environment variables
  const result = envSchema.safeParse(envConfig);

  // if validation fails, throw an error with details
  if (!result.success) {
    const errorMessages = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    Promise.reject(`Env variables validation: ❌\n${errorMessages}`);
  }

  // if validation succeeds, return new Promise that resolves with a success message
  return new Promise(resolve => resolve(console.log('Env variables validation: ✅')));
};
