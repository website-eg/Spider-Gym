const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
