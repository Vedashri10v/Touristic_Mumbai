const express = require('express'); // Import Express web framework
const mongoose = require('mongoose'); // Import Mongoose for MongoDB integration
const cors = require('cors'); // Import CORS to allow cross-origin API requests
const fs = require('fs'); // Import Node.js File System module
const path = require('path'); // Import Path module for handling file paths

// Import MongoDB Models
const User = require('./models/User'); // Load User database schema/model
const Location = require('./models/Location'); // Load Location database schema/model
const Booking = require('./models/Booking'); // Load Booking database schema/model

const app = express(); // Initialize Express application instance

// Middlewares
app.use(express.json()); // Middleware to parse JSON in incoming request bodies
app.use(cors()); // Middleware to enable CORS for cross-domain requests

// 1. Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/touristic_mumbai_db') // Connect to local MongoDB database
  .then(() => console.log('✅ Connected to MongoDB: touristic_mumbai_db')) // Log success message when DB connects
  .catch(err => console.error('❌ MongoDB Connection Error:', err)); // Log error if DB connection fails

// 2. Logging Middleware (Lab Exp 7: Node File Handling)
// Every time an HTTP request comes in, write a timestamped line to 'access.log'
app.use((req, res, next) => { // Define custom middleware function for request logging
  const logMessage = `[${new Date().toISOString()}] ${req.method} request to ${req.url}\n`; // Format log string with timestamp, method, & URL
  fs.appendFile(path.join(__dirname, 'access.log'), logMessage, (err) => { // Append formatted string to access.log file
    if (err) console.error('Failed to write access log:', err); // Log error if writing to access.log fails
  }); // End fs.appendFile callback
  next(); // Pass control to the next middleware or route handler
}); // End logging middleware

// ==========================================
// USER AUTHENTICATION & PROFILE ROUTES
// ==========================================

// Route A: User Registration
app.post('/api/register', async (req, res) => { // Define POST route for user registration
  try { // Start error handling block
    const { fullName, email, password } = req.body; // Extract user registration fields from request body

    const existingUser = await User.findOne({ email }); // Search database to check if email already exists
    if (existingUser) { // If user with this email exists in DB
      return res.status(400).json({ message: 'User with this email already exists!' }); // Return HTTP 400 Bad Request error
    } // End existing user check

    const newUser = new User({ fullName, email, password }); // Create new User model instance with request data
    await newUser.save(); // Save new user document into MongoDB database

    res.status(201).json({ message: 'Registration successful!', user: { fullName, email } }); // Send HTTP 201 Created response with user data
  } catch (err) { // Catch any unexpected server or database errors
    res.status(500).json({ error: err.message }); // Send HTTP 500 Internal Server Error with error message
  } // End try-catch block
}); // End registration route

// Route B: User Login
app.post('/api/login', async (req, res) => { // Define POST route for user login authentication
  try { // Start error handling block
    const { email, password } = req.body; // Extract login credentials (email, password) from request body

    const user = await User.findOne({ email, password }); // Find user matching both provided email and password
    if (!user) { // If no matching user document is found
      return res.status(401).json({ message: 'Invalid Email or Password!' }); // Return HTTP 401 Unauthorized error response
    } // End user validation check

    res.json({ message: 'Login successful!', user: { fullName: user.fullName, email: user.email } }); // Send success response with basic user profile
  } catch (err) { // Catch any server or execution errors
    res.status(500).json({ error: err.message }); // Send HTTP 500 response with exception message
  } // End try-catch block
}); // End login route

// Route: Update User Profile (PUT)
app.put('/api/user/update', async (req, res) => { // Define PUT route to update user account details
  try { // Start error handling block
    const { email, fullName, password } = req.body; // Extract update parameters from request body

    const updatedUser = await User.findOneAndUpdate( // Find matching user and update their attributes
      { email }, // Filter condition to locate user by email
      { fullName, password }, // New fields/data to update in document
      { new: true } // Return updated document instead of original
    ); // End findOneAndUpdate query

    if (!updatedUser) { // If no user matched target email address
      return res.status(404).json({ message: 'User not found!' }); // Return HTTP 404 Not Found error message
    } // End null check for updated user

    res.json({ // Send JSON response containing confirmation and updated data
      message: 'Profile updated successfully!', // Success feedback message
      user: { fullName: updatedUser.fullName, email: updatedUser.email } // Return refreshed user info
    }); // End JSON payload response
  } catch (err) { // Catch operational errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 error response
  } // End try-catch block
}); // End profile update route

// Route: Delete User Account (DELETE)
app.delete('/api/user/delete', async (req, res) => { // Define DELETE route to remove user account
  try { // Start error handling block
    const { email } = req.body; // Extract user email to delete from request body

    const deletedUser = await User.findOneAndDelete({ email }); // Locate and delete user document matching email

    if (!deletedUser) { // If no user document matched given email
      return res.status(404).json({ message: 'User not found!' }); // Return HTTP 404 Not Found response
    } // End deletion target check

    res.json({ message: 'Account deleted successfully!' }); // Return success confirmation message upon deletion
  } catch (err) { // Catch database or code execution errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 internal error response
  } // End try-catch block
}); // End user deletion route

// ==========================================
// LOCATION & REVIEW ROUTES
// ==========================================

// Search Places by Area or Get All Places
app.get('/api/locations', async (req, res) => { // Define GET route to fetch tourist locations
  try { // Start error handling block
    const { area } = req.query; // Extract optional 'area' URL query parameter
    let query = {}; // Initialize empty filter query object for MongoDB

    if (area) { // If 'area' parameter was provided in request query
      query.area = new RegExp(area, 'i'); // Add case-insensitive Regex filter for area matching
    } // End area query parameter check

    const locations = await Location.find(query); // Fetch location documents matching query from DB
    res.json(locations); // Send array of matching locations as JSON response
  } catch (err) { // Catch database search errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 error response
  } // End try-catch block
}); // End locations route

// Add Review to a Location
app.post('/api/locations/:id/review', async (req, res) => { // Define POST route to add a location review
  try { // Start error handling block
    const { userName, comment, rating } = req.body; // Extract review details from request payload
    const location = await Location.findById(req.params.id); // Search for target location using URL path ID

    if (!location) { // If target location ID doesn't exist
      return res.status(404).json({ message: 'Location not found' }); // Return HTTP 404 Not Found error
    } // End location existence check

    location.reviews.push({ userName, comment, rating: Number(rating) }); // Append new review object into reviews array
    await location.save(); // Save updated location document with new review to DB

    res.json({ message: 'Review submitted successfully!', location }); // Return success message along with updated location
  } catch (err) { // Catch unexpected execution errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 error response
  } // End try-catch block
}); // End add-review route

// Update a Review
app.put('/api/locations/:locationId/review/:reviewId', async (req, res) => { // Define PUT route to edit existing review
  try { // Start error handling block
    const { comment, rating } = req.body; // Extract updated review data from body
    const location = await Location.findById(req.params.locationId); // Find location by locationId parameter

    if (!location) { // If location doesn't exist
      return res.status(404).json({ message: 'Location not found' }); // Return HTTP 404 Not Found response
    } // End location check

    const review = location.reviews.id(req.params.reviewId); // Access subdocument review using reviewId parameter
    if (!review) { // If review subdocument is not found
      return res.status(404).json({ message: 'Review not found' }); // Return HTTP 404 Not Found response
    } // End subdocument review check

    if (comment) review.comment = comment; // Update comment text if provided in request
    if (rating) review.rating = Number(rating); // Update numeric rating if provided in request

    await location.save(); // Save updated parent location document with modified review
    res.json({ message: 'Review updated successfully!', location }); // Send success confirmation response
  } catch (err) { // Catch database update errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 server error response
  } // End try-catch block
}); // End update-review route

// Delete a Review
app.delete('/api/locations/:locationId/review/:reviewId', async (req, res) => { // Define DELETE route to remove review
  try { // Start error handling block
    const location = await Location.findById(req.params.locationId); // Find parent location document by locationId

    if (!location) { // If location document isn't found
      return res.status(404).json({ message: 'Location not found' }); // Return HTTP 404 error message
    } // End location check

    location.reviews.pull(req.params.reviewId); // Remove subdocument review using Mongoose pull method
    await location.save(); // Save updated parent document back to database

    res.json({ message: 'Review deleted successfully!', location }); // Send confirmation message and updated location
  } catch (err) { // Catch execution errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 internal error response
  } // End try-catch block
}); // End review deletion route

// ==========================================
// BOOKING & PAYMENT ROUTES
// ==========================================

// Fake Payment & Tour Guide Booking
app.post('/api/pay-and-book', async (req, res) => { // Define POST route for guide booking and payment processing
  try { // Start error handling block
    const { email, password, locationName, guideName, bookingDate, slotTiming, amountPaid } = req.body; // Destructure input parameters

    const user = await User.findOne({ email, password }); // Authenticate user by validating password credentials
    if (!user) { // If credential check fails
      return res.status(401).json({ message: 'Payment Declined: Invalid Account Password!' }); // Return HTTP 401 unauthorized status
    } // End credential check

    const newBooking = new Booking({ // Instantiate new Booking model instance
      userEmail: email, // Map email to booking record
      locationName, // Map target location name
      guideName, // Map tour guide name
      bookingDate, // Map booked date
      slotTiming, // Map slot timing window
      amountPaid // Map total paid amount
    }); // End Booking initialization

    await newBooking.save(); // Save new booking document into MongoDB

    res.status(201).json({ // Send HTTP 201 Created confirmation response
      status: 'SUCCESS', // Success payload flag
      message: 'Payment Confirmed & Guide Booked Successfully!', // User feedback message
      booking: newBooking // Return saved booking object details
    }); // End JSON response
  } catch (err) { // Catch database or process failures
    res.status(500).json({ error: err.message }); // Return HTTP 500 server error response
  } // End try-catch block
}); // End pay-and-book route

// Get Bookings for Specific User
app.get('/api/user/bookings', async (req, res) => { // Define GET route to list user bookings
  try { // Start error handling block
    const { email } = req.query; // Extract user email from query string parameters
    const userBookings = await Booking.find({ userEmail: email }); // Retrieve all bookings matching user email
    res.json(userBookings); // Return array of matching bookings in JSON response
  } catch (err) { // Catch database retrieval errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 error response
  } // End try-catch block
}); // End get user bookings route

// Get All Bookings (For AngularJS Admin Portal)
app.get('/api/admin/bookings', async (req, res) => { // Define GET route for admin booking access
  try { // Start error handling block
    const bookings = await Booking.find(); // Fetch every booking document from database collection
    res.json(bookings); // Send complete list of bookings as JSON response
  } catch (err) { // Catch database fetch errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 internal error response
  } // End try-catch block
}); // End admin bookings route

// Update Booking Details (Date, Slot, or Status)
app.put('/api/bookings/:id', async (req, res) => { // Define PUT route to edit booking information
  try { // Start error handling block
    const { bookingDate, slotTiming, paymentStatus } = req.body; // Extract update values from body payload

    const updatedBooking = await Booking.findByIdAndUpdate( // Locate booking by ID and apply changes
      req.params.id, // Route URL booking ID parameter
      { bookingDate, slotTiming, paymentStatus }, // Fields to update in database record
      { new: true } // Option flag returning updated document
    ); // End findByIdAndUpdate query

    if (!updatedBooking) { // If target booking ID doesn't exist
      return res.status(404).json({ message: 'Booking not found' }); // Return HTTP 404 response
    } // End updated booking target check

    res.json({ message: 'Booking updated successfully!', booking: updatedBooking }); // Return success confirmation and updated object
  } catch (err) { // Catch update process errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 server error response
  } // End try-catch block
}); // End booking update route

// Delete a Booking
app.delete('/api/bookings/:id', async (req, res) => { // Define DELETE route to cancel/delete booking
  try { // Start error handling block
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id); // Find booking by ID parameter and delete it

    if (!deletedBooking) { // If booking document wasn't found
      return res.status(404).json({ message: 'Booking not found' }); // Return HTTP 404 Not Found response
    } // End check for deleted document

    res.json({ message: 'Booking deleted successfully!' }); // Return deletion success response
  } catch (err) { // Catch query/execution errors
    res.status(500).json({ error: err.message }); // Return HTTP 500 server error response
  } // End try-catch block
}); // End delete booking route

// Start Express Server
const PORT = 5000; // Define server port number
app.listen(PORT, () => { // Start server listening on port 5000
  console.log(`🚀 Touristic Mumbai Express Server running on http://localhost:${PORT}`); // Print startup URL message to console
}); // End app listener