const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// غيّر هذا إلى رابط اتصال قاعدة بياناتك في Railway
const MONGO_URI = 'mongodb://mongo:VclTFUqCmkvNVMFErlQnXLoDjkJOFaLV@gondola.proxy.rlwy.net:49729';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB on Railway'))
.catch(err => console.error('MongoDB connection error:', err));

// تعريف نموذج الأدمن
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin(username, plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    console.log(`Admin created: ${username}`);
  } catch (error) {
    if (error.code === 11000) {
      console.log('Username already exists.');
    } else {
      console.error('Error creating admin:', error);
    }
  } finally {
    mongoose.connection.close();
  }
}

// استبدل 'admin1' و 'yourSecurePassword123' بالقيم التي تريدها
createAdmin('spider', 'spider');
