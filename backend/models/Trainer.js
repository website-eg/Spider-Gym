const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model('Trainer', TrainerSchema);
