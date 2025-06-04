require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Replace with your actual admin model path
const Admin = require('./models/Admin'); 

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const email = 'binay@orionpest.com';
    const password = 'Binay@1972';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists with this email.');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();
    console.log('✅ Admin user created successfully.');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
