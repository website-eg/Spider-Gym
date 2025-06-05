// scripts/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/spideradmin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = new Admin({
      username: 'spider',         // اسم المستخدم الذي تريد
      password: 'spider',        // كلمة المرور التي تريد (سيتم تشفيرها تلقائياً)
    });

    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
