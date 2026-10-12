const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  comment:  { type: String, required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  createdAt:{ type: Date, default: Date.now }
});

const locationSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  area:          { type: String, required: true },
  description:   { type: String, required: true },
  history:       { type: String, required: true },
  howToReach:    { type: String, required: true },
  imageUrl:      { type: String, required: true },
  rating:        { type: Number, default: 4.5 },
  weatherSummary:{ type: String, default: 'Sunny & Pleasant • 30°C' },
  entryFee:      { type: Number, default: 0 },
  guideName:     { type: String, default: 'Local Expert' },
  guideFee:      { type: Number, default: 500 },
  reviews:       [reviewSchema]
});

module.exports = mongoose.model('Location', locationSchema);
