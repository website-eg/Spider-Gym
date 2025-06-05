const Trainer = require('../models/Trainer');

exports.getAllTrainers = async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
};

exports.addTrainer = async (req, res) => {
  const { name, specialty, image } = req.body;
  const newTrainer = new Trainer({ name, specialty, image });
  await newTrainer.save();
  res.json({ message: 'تمت إضافة المدرب' });
};

exports.deleteTrainer = async (req, res) => {
  await Trainer.findByIdAndDelete(req.params.id);
  res.json({ message: 'تم حذف المدرب' });
};
