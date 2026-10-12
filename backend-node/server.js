const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import MongoDB Models
const User = require('./models/User');
const Location = require('./models/Location');
const Booking = require('./models/Booking');

const app = express();

// Middlewares
app.use(express.json()); // Allows server to parse JSON request bodies
app.use(cors());         // Allows front-end apps to communicate with back-end

// 1. Connect to MongoDB (Dynamic Atlas URI with local fallback)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is missing!');
  process.exit(1);
}
// 2. Logging Middleware (Lab Exp 7: Node File Handling)
// Every time an HTTP request comes in, write a timestamped line to 'access.log'
app.use((req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} request to ${req.url}\n`;
  fs.appendFile(path.join(__dirname, 'access.log'), logMessage, (err) => {
    if (err) console.error('Failed to write access log:', err);
  });
  next();
});

// ==========================================
// API ROUTES
// ==========================================

// Route A: User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists!' });
    }

    // Save new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful!', user: { fullName, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route B: User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with matching email and password
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Email or Password!' });
    }

    res.json({ message: 'Login successful!', user: { fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route C: Search Places by Area or Get All Places
app.get('/api/locations', async (req, res) => {
  try {
    const { area } = req.query;
    let query = {};

    // If an area search query is provided, perform case-insensitive search
    if (area) {
      query.area = new RegExp(area, 'i');
    }

    const locations = await Location.find(query);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route D: Fake Payment & Tour Guide Booking
app.post('/api/pay-and-book', async (req, res) => {
  try {
    const { email, password, locationName, guideName, bookingDate, slotTiming, amountPaid } = req.body;

    // Verify user password before confirming fake payment
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Payment Declined: Invalid Account Password!' });
    }

    // Save confirmed booking in database
    const newBooking = new Booking({
      userEmail: email,
      locationName,
      guideName,
      bookingDate,
      slotTiming,
      amountPaid
    });

    await newBooking.save();

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Payment Confirmed & Guide Booked Successfully!',
      booking: newBooking
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route E: Get All Bookings (For AngularJS Admin Portal)
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: Add Review to a Location
app.post('/api/locations/:id/review', async (req, res) => {
  try {
    const { userName, comment, rating } = req.body;
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Add review to array
    location.reviews.push({ userName, comment, rating: Number(rating) });
    await location.save();

    res.json({ message: 'Review submitted successfully!', location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server (Dynamic Port for Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Touristic Mumbai Express Server running on port ${PORT}`);
});