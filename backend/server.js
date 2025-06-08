require("dotenv").config();

console.log("Mongo URI:", process.env.MONGO_URI);
console.log("JWT Secret:", process.env.JWT_SECRET ? "موجود" : "غير موجود");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("تم الاتصال بقاعدة البيانات MongoDB"))
  .catch((err) => console.error("خطأ في الاتصال بقاعدة البيانات:", err));

// Admin
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("Admin", AdminSchema);

// Trainer
const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  image: { type: String, required: true },
});
const Trainer = mongoose.model("Trainer", TrainerSchema);

// Subscription
const SubscriptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: false },
});
const Subscription = mongoose.model("Subscription", SubscriptionSchema);

// News
const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  image: { type: String, required: false },
});
const News = mongoose.model("News", NewsSchema);

// Testimonial (آراء العملاء)
const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String, required: false },
});
const Testimonial = mongoose.model("Testimonial", TestimonialSchema);

// Contact Message (رسائل التواصل)
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", ContactSchema);

// Middleware للتحقق من التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "يجب تقديم رمز الدخول (التوكن)" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "رمز الدخول غير صالح أو منتهي" });
    req.user = user;
    next();
  });
};

// Routes

// Admin Register
app.post("/admin/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin)
      return res.status(400).json({ message: "اسم المستخدم موجود مسبقًا" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "تم تسجيل المدير بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// Admin Login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(400).json({ message: "اسم المستخدم غير صحيح" });

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass)
      return res.status(400).json({ message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign(
      { username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// ====== Trainers ======
// جلب كل المدربين
app.get("/admin/trainers", authenticateToken, async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب المدربين" });
  }
});

// جلب مدرب معين
app.get("/admin/trainers/:id", authenticateToken, async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "المدرب غير موجود" });
    res.json(trainer);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب بيانات المدرب" });
  }
});

// إضافة مدرب
app.post("/admin/trainers", authenticateToken, async (req, res) => {
  const { name, specialty, image } = req.body;
  try {
    const newTrainer = new Trainer({ name, specialty, image });
    await newTrainer.save();
    res.status(201).json({ message: "تم إضافة المدرب بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في إضافة المدرب" });
  }
});

// تعديل مدرب
app.put("/admin/trainers/:id", authenticateToken, async (req, res) => {
  const { name, specialty, image } = req.body;
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { name, specialty, image },
      { new: true }
    );
    if (!updatedTrainer)
      return res.status(404).json({ message: "المدرب غير موجود" });
    res.json({ message: "تم تحديث بيانات المدرب", trainer: updatedTrainer });
  } catch {
    res.status(500).json({ message: "حدث خطأ في تحديث بيانات المدرب" });
  }
});

// حذف مدرب
app.delete("/admin/trainers/:id", authenticateToken, async (req, res) => {
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!deletedTrainer)
      return res.status(404).json({ message: "المدرب غير موجود" });
    res.json({ message: "تم حذف المدرب بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في حذف المدرب" });
  }
});

// ====== Subscriptions ======
app.get("/admin/subscriptions", authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب الاشتراكات" });
  }
});

app.post("/admin/subscriptions", authenticateToken, async (req, res) => {
  const { title, price, duration, description } = req.body;
  try {
    const newSubscription = new Subscription({
      title,
      price,
      duration,
      description,
    });
    await newSubscription.save();
    res.status(201).json({ message: "تم إضافة الاشتراك بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في إضافة الاشتراك" });
  }
});

app.put("/admin/subscriptions/:id", authenticateToken, async (req, res) => {
  const { title, price, duration, description } = req.body;
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { title, price, duration, description },
      { new: true }
    );
    if (!updatedSubscription)
      return res.status(404).json({ message: "الاشتراك غير موجود" });
    res.json({
      message: "تم تحديث الاشتراك",
      subscription: updatedSubscription,
    });
  } catch {
    res.status(500).json({ message: "حدث خطأ في تحديث الاشتراك" });
  }
});

app.delete("/admin/subscriptions/:id", authenticateToken, async (req, res) => {
  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(
      req.params.id
    );
    if (!deletedSubscription)
      return res.status(404).json({ message: "الاشتراك غير موجود" });
    res.json({ message: "تم حذف الاشتراك بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في حذف الاشتراك" });
  }
});

// ====== News ======
app.get("/admin/news", authenticateToken, async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب الأخبار" });
  }
});

app.post("/admin/news", authenticateToken, async (req, res) => {
  const { title, content, image } = req.body;
  try {
    const newNews = new News({ title, content, image });
    await newNews.save();
    res.status(201).json({ message: "تم إضافة الخبر بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في إضافة الخبر" });
  }
});

app.put("/admin/news/:id", authenticateToken, async (req, res) => {
  const { title, content, image } = req.body;
  try {
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, image },
      { new: true }
    );
    if (!updatedNews)
      return res.status(404).json({ message: "الخبر غير موجود" });
    res.json({ message: "تم تحديث الخبر", news: updatedNews });
  } catch {
    res.status(500).json({ message: "حدث خطأ في تحديث الخبر" });
  }
});

app.delete("/admin/news/:id", authenticateToken, async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews)
      return res.status(404).json({ message: "الخبر غير موجود" });
    res.json({ message: "تم حذف الخبر بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في حذف الخبر" });
  }
});

// ====== Testimonials ======
app.get("/admin/testimonials", authenticateToken, async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب آراء العملاء" });
  }
});

app.post("/admin/testimonials", authenticateToken, async (req, res) => {
  const { name, message, image } = req.body;
  try {
    const newTestimonial = new Testimonial({ name, message, image });
    await newTestimonial.save();
    res.status(201).json({ message: "تم إضافة رأي العميل بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في إضافة رأي العميل" });
  }
});

app.put("/admin/testimonials/:id", authenticateToken, async (req, res) => {
  const { name, message, image } = req.body;
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, message, image },
      { new: true }
    );
    if (!updatedTestimonial)
      return res.status(404).json({ message: "رأي العميل غير موجود" });
    res.json({
      message: "تم تحديث رأي العميل",
      testimonial: updatedTestimonial,
    });
  } catch {
    res.status(500).json({ message: "حدث خطأ في تحديث رأي العميل" });
  }
});

app.delete("/admin/testimonials/:id", authenticateToken, async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTestimonial)
      return res.status(404).json({ message: "رأي العميل غير موجود" });
    res.json({ message: "تم حذف رأي العميل بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في حذف رأي العميل" });
  }
});

// ====== Contact Messages ======
// استقبال رسالة تواصل (غير محمي، ليتمكن الزوار من إرسال رسائل)
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ message: "تم إرسال الرسالة بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في إرسال الرسالة" });
  }
});

// جلب كل رسائل التواصل (محمية)
app.get("/admin/contacts", authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ message: "حدث خطأ في جلب رسائل التواصل" });
  }
});

// حذف رسالة تواصل (محمية)
app.delete("/admin/contacts/:id", authenticateToken, async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact)
      return res.status(404).json({ message: "الرسالة غير موجودة" });
    res.json({ message: "تم حذف الرسالة بنجاح" });
  } catch {
    res.status(500).json({ message: "حدث خطأ في حذف الرسالة" });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`السيرفر يعمل على البورت ${PORT}`);
});
