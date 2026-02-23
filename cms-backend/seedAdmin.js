import mongoose from 'mongoose';
import { DB_URI } from './config/env.js'; // Use your existing env config
import User from './models/user.js';

// Get admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validation
if (!ADMIN_PASSWORD) {
  console.error('❌ Error: ADMIN_PASSWORD environment variable is required');
  console.log('Set it in your .env.development.local file or run: ADMIN_PASSWORD=yourpassword node seedAdmin.js');
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 8) {
  console.error('❌ Error: Password must be at least 8 characters');
  process.exit(1);
}

// Connect using your existing DB_URI
mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if admin user already exists
    const existing = await User.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log('Admin user already exists.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin user
    const user = new User({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    
    await user.save();
    console.log('✅ Admin user created successfully!');
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log('Use this to login via POST /api/auth/login');
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });