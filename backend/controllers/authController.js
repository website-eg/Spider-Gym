const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ message: 'اسم المستخدم غير صحيح' });

  const validPass = await bcrypt.compare(password, admin.password);
  if (!validPass) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

  const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
