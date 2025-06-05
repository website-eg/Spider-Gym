const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // التحقق من وجود الحقول
  if (!username || !password) {
    return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'اسم المستخدم غير صحيح' });
    }

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
    }

    // إنشاء التوكن مع تضمين معرف المدير واسم المستخدم
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error in adminLogin:', err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};
