const mongoose = require('mongoose');

// Simple Location Schema for spots in Mumbai
const locationSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  area:          { type: String, required: true }, // e.g. South Mumbai, Bandra, Borivali
  description:   { type: String, required: true },
  howToReach:    { type: String, required: true },
  entryFee:      { type: Number, default: 0 },
  guideName:     { type: String, default: 'Local Expert' },
  guideFee:      { type: Number, default: 500 }
});

module.exports = mongoose.model('Location', locationSchema);

