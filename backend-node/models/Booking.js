const mongoose = require('mongoose');

// Simple Booking Schema for saving payments
const bookingSchema = new mongoose.Schema({
  userEmail:    { type: String, required: true },
  locationName: { type: String, required: true },
  guideName:    { type: String, required: true },
  bookingDate:  { type: String, required: true },
  slotTiming:   { type: String, required: true },
  amountPaid:   { type: Number, required: true },
  paymentStatus:{ type: String, default: 'CONFIRMED' }
});

module.exports = mongoose.model('Booking', bookingSchema);