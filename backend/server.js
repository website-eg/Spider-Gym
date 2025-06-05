const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Admin User Model
const AdminSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const Admin = mongoose.model('Admin', AdminSchema);

// Trainer Model
const TrainerSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  image: String,
});
const Trainer = mongoose.model('Trainer', TrainerSchema);

// Middleware to verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin Login Route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ message: 'Invalid username' });

  const validPass = await bcrypt.compare(password, admin.password);
  if (!validPass) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Get all trainers (protected route)
app.get('/admin/trainers', authenticateToken, async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
});

// Add new trainer (protected)
app.post('/admin/trainers', authenticateToken, async (req, res) => {
  const { name, specialty, image } = req.body;
  const newTrainer = new Trainer({ name, specialty, image });
  await newTrainer.save();
  res.json({ message: 'Trainer added' });
});

// Delete trainer by id (protected)
app.delete('/admin/trainers/:id', authenticateToken, async (req, res) => {
  await Trainer.findByIdAndDelete(req.params.id);
  res.json({ message: 'Trainer deleted' });
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
