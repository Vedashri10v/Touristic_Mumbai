const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import MongoDB Models
const User = require('./models/User');
const Location = require('./models/Location');
const Booking = require('./models/Booking');

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(cors());

// Log every incoming request
app.use((req, res, next) => {
const logMessage =
`[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

fs.appendFile(
path.join(__dirname, 'access.log'),
logMessage,
(err) => {
if (err) {
console.error('Failed to write access log:', err.message);
}
}
);

next();
});

// ==========================================
// 2. DATABASE CONFIGURATION
// ==========================================

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

// ==========================================
// 3. USER REGISTRATION
// ==========================================

app.post('/api/register', async (req, res) => {
try {
const { fullName, email, password } = req.body;

```
if (
  typeof fullName !== 'string' ||
  !fullName.trim() ||
  typeof email !== 'string' ||
  !email.trim() ||
  typeof password !== 'string' ||
  password.length < 8
) {
  return res.status(400).json({
    message: 'Enter your name, a valid email, and a password of at least 8 characters.'
  });
}

const normalizedEmail = email.trim().toLowerCase();

const existingUser = await User.findOne({
  email: normalizedEmail
});

if (existingUser) {
  return res.status(409).json({
    message: 'An account with this email already exists.'
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
  fullName: fullName.trim(),
  email: normalizedEmail,
  password: hashedPassword
});

await newUser.save();

return res.status(201).json({
  message: 'Registration successful!',
  user: {
    fullName: newUser.fullName,
    email: newUser.email
  }
});
```

} catch (err) {
if (err.code === 11000) {
return res.status(409).json({
message: 'An account with this email already exists.'
});
}

```
console.error('Registration error:', err.message);

return res.status(500).json({
  message: 'Registration failed. Please try again.'
});
```

}
});

// ==========================================
// 4. USER LOGIN
// ==========================================

app.post('/api/login', async (req, res) => {
try {
const { email, password } = req.body;

```
if (
  typeof email !== 'string' ||
  !email.trim() ||
  typeof password !== 'string' ||
  !password
) {
  return res.status(400).json({
    message: 'Email and password are required.'
  });
}

const user = await User.findOne({
  email: email.trim().toLowerCase()
});

if (!user) {
  return res.status(401).json({
    message: 'Invalid email or password.'
  });
}

// Compare the entered password with its stored hash
const passwordMatches = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatches) {
  return res.status(401).json({
    message: 'Invalid email or password.'
  });
}

return res.json({
  message: 'Login successful!',
  user: {
    fullName: user.fullName,
    email: user.email
  }
});
```

} catch (err) {
console.error('Login error:', err.message);

```
return res.status(500).json({
  message: 'Login failed. Please try again.'
});
```

}
});

// ==========================================
// 5. GET OR SEARCH TOURIST LOCATIONS
// ==========================================

app.get('/api/locations', async (req, res) => {
try {
const area = req.query.area;

```
const query = {};

if (area) {
  if (typeof area !== 'string' || area.length > 100) {
    return res.status(400).json({
      message: 'Please enter a valid area name.'
    });
  }

  // Escape special regex characters in the search term
  const escapedArea = area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  query.area = new RegExp(escapedArea, 'i');
}

const locations = await Location.find(query).lean();

return res.json(locations);
```

} catch (err) {
console.error('Location retrieval error:', err.message);

```
return res.status(500).json({
  message: 'Unable to retrieve tourist locations.'
});
```

}
});

// ==========================================
// 6. TOUR GUIDE BOOKING
// ==========================================

app.post('/api/pay-and-book', async (req, res) => {
try {
const {
email,
password,
locationName,
guideName,
bookingDate,
slotTiming,
amountPaid
} = req.body;

```
if (
  typeof email !== 'string' ||
  typeof password !== 'string' ||
  !locationName ||
  !guideName ||
  !bookingDate ||
  !slotTiming ||
  amountPaid === undefined ||
  amountPaid === null
) {
  return res.status(400).json({
    message: 'Please provide all required booking details.'
  });
}

const user = await User.findOne({
  email: email.trim().toLowerCase()
});

if (!user) {
  return res.status(401).json({
    message: 'Invalid account email or password.'
  });
}

const passwordMatches = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatches) {
  return res.status(401).json({
    message: 'Invalid account email or password.'
  });
}

const parsedAmount = Number(amountPaid);

if (
  !Number.isFinite(parsedAmount) ||
  parsedAmount < 0
) {
  return res.status(400).json({
    message: 'Please provide a valid booking amount.'
  });
}

// This is a demonstration booking, not a real payment gateway.
const newBooking = new Booking({
  userEmail: user.email,
  locationName,
  guideName,
  bookingDate,
  slotTiming,
  amountPaid: parsedAmount,
  paymentStatus: 'CONFIRMED'
});

await newBooking.save();

return res.status(201).json({
  status: 'SUCCESS',
  message: 'Booking saved successfully!',
  booking: newBooking
});
```

} catch (err) {
console.error('Booking error:', err.message);

```
return res.status(500).json({
  message: 'Unable to save the booking.'
});
```

}
});

// ==========================================
// 7. ADMIN: GET ALL BOOKINGS
// ==========================================

app.get('/api/admin/bookings', async (req, res) => {
try {
const bookings = await Booking.find().lean();

```
return res.json(bookings);
```

} catch (err) {
console.error('Booking retrieval error:', err.message);

```
return res.status(500).json({
  message: 'Unable to retrieve bookings.'
});
```

}
});

// ==========================================
// 8. ADD A REVIEW TO A TOURIST LOCATION
// ==========================================

app.post('/api/locations/:id/review', async (req, res) => {
try {
const { userName, comment, rating } = req.body;

```
if (
  typeof userName !== 'string' ||
  !userName.trim() ||
  typeof comment !== 'string' ||
  !comment.trim() ||
  rating === undefined ||
  rating === null
) {
  return res.status(400).json({
    message: 'Please provide your name, review, and rating.'
  });
}

const numericRating = Number(rating);

if (
  !Number.isInteger(numericRating) ||
  numericRating < 1 ||
  numericRating > 5
) {
  return res.status(400).json({
    message: 'Rating must be a whole number between 1 and 5.'
  });
}

const location = await Location.findById(req.params.id);

if (!location) {
  return res.status(404).json({
    message: 'Tourist location not found.'
  });
}

location.reviews.push({
  userName: userName.trim(),
  comment: comment.trim(),
  rating: numericRating
});

await location.save();

return res.json({
  message: 'Review submitted successfully!',
  location
});
```

} catch (err) {
if (err.name === 'CastError') {
return res.status(400).json({
message: 'Invalid tourist location ID.'
});
}

```
console.error('Review error:', err.message);

return res.status(500).json({
  message: 'Unable to submit the review.'
});
```

}
});

// ==========================================
// 9. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
res.json({
status: 'OK',
database: mongoose.connection.readyState === 1
? 'connected'
: 'disconnected',
databaseName: mongoose.connection.name || null
});
});

// ==========================================
// 10. START SERVER AFTER DATABASE CONNECTS
// ==========================================

async function startServer() {
if (!MONGODB_URI) {
console.error('❌ MONGODB_URI environment variable is missing!');
process.exit(1);
}

try {
await mongoose.connect(MONGODB_URI);

```
console.log('✅ Connected to MongoDB!');
console.log('📂 Database:', mongoose.connection.name);
console.log('📍 Locations collection:', Location.collection.name);
console.log('👤 Users collection:', User.collection.name);
console.log('🗓️ Bookings collection:', Booking.collection.name);

app.listen(PORT, () => {
  console.log(`🚀 Touristic Mumbai server running on port ${PORT}`);
});
```

} catch (err) {
console.error('❌ MongoDB connection failed:', err.message);
process.exit(1);
}
}

startServer();
