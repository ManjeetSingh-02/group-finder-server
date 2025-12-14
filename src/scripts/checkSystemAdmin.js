// import local modules
import { User } from '../models/index.js';

// import external modules
import mongoose from 'mongoose';

(async function () {
  try {
    // connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Database Connection: ✅');

    // check if an admin user exists (can be 1 or more)
    const existingAdminUsers = await User.find({ role: USER_ROLES.ADMIN });
    if (existingAdminUsers.length < 1) throw new Error('No Admin User Found');
    console.log('--- Admin User Exists: ✅');

    // disconnect from database
    await mongoose.disconnect();
    console.log('--- Database Disconnected: ✅');
  } catch (error) {
    // log error
    console.error('---------------------------------------------------------');
    console.error('ERROR DURING SYSTEM ADMIN CHECK');
    console.error('RUN SYSTEM ADMIN INITIALIZATION SCRIPT AGAIN');
    console.error(`ERROR DETAILS: ${error.message}`);
    console.error('---------------------------------------------------------');

    // clean database to maintain consistency
    await User.deleteMany({});
    console.log('--- Database Cleanup: ✅');

    // disconnect from database
    await mongoose.disconnect();
    console.log('--- Database Disconnected: ✅');

    // exit with failure
    process.exit(1);
  }
})();
