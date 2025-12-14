// import local modules
import { User } from '../models/index.js';
import { USER_ROLES } from '../utils/constants.js';

// import external modules
import mongoose from 'mongoose';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function getAdminUserEmailFromCLI() {
  // create readline interface to read email and close it
  const rl = readline.createInterface({ input, output });
  const email = await rl.question('--- Enter Admin User Email: ');
  rl.close();

  // check for empty email
  if (!email.trim()) throw new Error('Email is required');

  // return email
  return email.trim().toLowerCase();
}

(async function () {
  try {
    // connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Database Connection: ✅');

    // get adminUserEmail from CLI
    const email = await getAdminUserEmailFromCLI();

    // check if any admin user already exists
    const existingAdminUsers = await User.find({ role: USER_ROLES.ADMIN });

    // create adminUser with provided email
    const adminUser = await User.create({
      email,
      fullName: `System Admin ${existingAdminUsers.length + 1}`,
      role: USER_ROLES.ADMIN,
      username: `system_admin_${existingAdminUsers.length + 1}`,
    });
    if (!adminUser) throw new Error('Something went wrong while creating Admin User');
    console.log('--- Admin User Created Successfully: ✅');

    // disconnect from database
    await mongoose.disconnect();
    console.log('--- Database Disconnected: ✅');
  } catch (error) {
    // log error
    console.error('---------------------------------------------------------');
    console.error('ERROR DURING SYSTEM ADMIN INITIALIZATION');
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
