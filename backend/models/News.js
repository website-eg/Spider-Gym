const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  date: { type: Date, default: Date.now },
  image: String,
});

module.exports = mongoose.model('News', NewsSchema);
