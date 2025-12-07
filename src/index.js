// import local modules
import { envConfig, validateEnv } from './utils/env.js';
import app from './app.js';

// Validate ENV variables, connect to database and then start the server
validateEnv()
  .then(() => {
    app.listen(envConfig.PORT, () => console.log(`Server running on PORT ${envConfig.PORT}: ✅`));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
