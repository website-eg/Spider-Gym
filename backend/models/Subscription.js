const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  description: String,
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
