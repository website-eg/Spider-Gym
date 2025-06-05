const Trainer = require('../models/Trainer');

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المدربين' });
  }
};

exports.addTrainer = async (req, res) => {
  try {
    const { name, specialty, image } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ message: 'يرجى إدخال الاسم والتخصص' });
    }
    const newTrainer = new Trainer({ name, specialty, image });
    await newTrainer.save();
    res.json({ message: 'تم إضافة المدرب' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة المدرب' });
  }
};

exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'لم يتم العثور على المدرب' });
    }
    res.json({ message: 'تم حذف المدرب' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المدرب' });
  }
};
