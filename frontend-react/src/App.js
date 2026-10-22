import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });

  // User Profile Edit & Delete State
  const [editMode, setEditMode] = useState(false);
  const [updateForm, setUpdateForm] = useState({ fullName: '', password: '' });

  // Navigation Tab State ('explore', 'book', or 'my-bookings')
  const [activeTab, setActiveTab] = useState('explore');

  // Search & Locations State
  const [searchArea, setSearchArea] = useState('');
  const [places, setPlaces] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // Booking & Payment State
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slotTiming, setSlotTiming] = useState('10:00 AM - 1:00 PM');
  const [paymentPassword, setPaymentPassword] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  // User My-Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  // Review Form & Editing State
  const [reviewData, setReviewData] = useState({ locationId: '', comment: '', rating: '5' });
  const [editingReview, setEditingReview] = useState(null);

  // Authentication Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'register' 
      ? 'http://localhost:5000/api/register' 
      : 'http://localhost:5000/api/login';

    try {
      const response = await axios.post(endpoint, authForm);
      if (response.data.user) {
        setUser(response.data.user);
        alert(`${authMode === 'register' ? 'Registered' : 'Logged in'} Successfully!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication Failed');
    }
  };

  // Handler: Update User Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/api/user/update', {
        email: user.email,
        fullName: updateForm.fullName || user.fullName,
        password: updateForm.password
      });

      setUser(response.data.user);
      setEditMode(false);
      alert(response.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  // Handler: Delete User Account
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete('http://localhost:5000/api/user/delete', {
          data: { email: user.email }
        });
        alert(response.data.message);
        setUser(null);
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  // Search Handler
  const handleSearch = async () => {
    if (!searchArea) return alert('Please enter an area name!');

    try {
      const res = await axios.get(`http://localhost:5000/api/locations?area=${searchArea}`);
      setPlaces(res.data);

      const flaskRes = await axios.post('http://localhost:5001/api/route-info', { area: searchArea });
      setRouteInfo(flaskRes.data.routeInfo);
    } catch (err) {
      console.error('Error searching places:', err);
    }
  };

  // Payment Handler
  const handleFakePayment = async (e) => {
    e.preventDefault();

    const paymentData = {
      email: user.email,
      password: paymentPassword,
      locationName: selectedPlace.name,
      guideName: selectedPlace.guideName,
      bookingDate,
      slotTiming,
      amountPaid: selectedPlace.entryFee + selectedPlace.guideFee
    };

    try {
      const res = await axios.post('http://localhost:5000/api/pay-and-book', paymentData);
      setBookingStatus(`🎉 ${res.data.message}`);
    } catch (err) {
      setBookingStatus(`❌ ${err.response?.data?.message || 'Payment Declined'}`);
    }
  };

  // Submit Review Handler
  const handleAddReview = async (e, locationId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/locations/${locationId}/review`, {
        userName: user.fullName,
        comment: reviewData.comment,
        rating: reviewData.rating
      });
      alert('Review posted successfully!');
      setReviewData({ locationId: '', comment: '', rating: '5' });
      handleSearch();
    } catch (err) {
      alert('Failed to post review');
    }
  };

  // Update Review Handler
  const handleUpdateReview = async (e, locationId, reviewId) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/locations/${locationId}/review/${reviewId}`, editingReview);
      alert('Review updated successfully!');
      setEditingReview(null);
      handleSearch();
    } catch (err) {
      alert('Failed to update review');
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (locationId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`http://localhost:5000/api/locations/${locationId}/review/${reviewId}`);
        alert('Review deleted!');
        handleSearch();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  // Fetch Logged-in User Bookings
  const fetchMyBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/bookings?email=${user.email}`);
      setMyBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Reschedule / Update Booking Handler
  const handleUpdateBooking = async (e, bookingId) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, editingBooking);
      alert('Booking updated successfully!');
      setEditingBooking(null);
      fetchMyBookings();
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  // Cancel / Delete Booking Handler
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel and delete this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`);
        alert('Booking cancelled!');
        fetchMyBookings();
      } catch (err) {
        alert('Failed to delete booking');
      }
    }
  };

  return (
    <div>
      {/* HERO HEADER */}
      <header className="hero-header">
        <h1>Touristic Mumbai</h1>
        <p>Explore Top Destinations, Historical Insights & Book Verified Local Guides</p>
        <img 
          src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1400&q=80" 
          alt="Taj Mahal Palace & Gateway of India" 
          className="banner-img" 
        />
      </header>

      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
        
        {/* LOGIN / REGISTER FORM */}
        {!user ? (
          <div className="card" style={{ maxWidth: '380px', margin: '30px auto' }}>
            <h3>{authMode === 'register' ? 'Register New Account' : 'User Login'}</h3>
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <input 
                  type="text" placeholder="Full Name" required
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  style={{ width: '100%', marginBottom: '10px', padding: '10px', boxSizing: 'border-box' }}
                />
              )}
              <input 
                type="email" placeholder="Email Address" required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', boxSizing: 'border-box' }}
              />
              <input 
                type="password" placeholder="Password" required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{ width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {authMode === 'register' ? 'Create Account' : 'Login'}
              </button>
            </form>
            <p 
              onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
              style={{ color: 'var(--accent-purple)', cursor: 'pointer', textAlign: 'center', marginTop: '15px' }}
            >
              {authMode === 'register' ? 'Already have an account? Login' : 'Need an account? Register'}
            </p>
          </div>
        ) : (
          <div>
            {/* WELCOME BAR WITH ACCOUNT MANAGEMENT */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Welcome, {user.fullName}! 👋 ({user.email})</h3>
                <div>
                  <button 
                    onClick={() => {
                      setEditMode(!editMode);
                      setUpdateForm({ fullName: user.fullName, password: '' });
                    }}
                    style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}
                  >
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                  
                  <button 
                    onClick={handleDeleteAccount}
                    style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}
                  >
                    Delete Account
                  </button>

                  <button 
                    onClick={() => setUser(null)} 
                    style={{ background: '#6b7280', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* EDIT PROFILE FORM */}
              {editMode && (
                <form onSubmit={handleUpdateProfile} style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                  <h4>Update Profile Details</h4>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required
                    value={updateForm.fullName} 
                    onChange={(e) => setUpdateForm({ ...updateForm, fullName: e.target.value })}
                    style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                  />
                  <input 
                    type="password" 
                    placeholder="New Password (or existing password)" 
                    required
                    value={updateForm.password} 
                    onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
                    style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                    Save Changes
                  </button>
                </form>
              )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="nav-tabs">
              <button 
                className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => setActiveTab('explore')}
              >
                🔍 Explore Places & History
              </button>
              <button 
                className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                onClick={() => setActiveTab('book')}
              >
                👨‍💼 Hire Tour Guides & Book Trips
              </button>
              <button 
                className={`tab-btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('my-bookings'); fetchMyBookings(); }}
              >
                📋 My Bookings
              </button>
            </div>

            {/* SEARCH BAR (For Explore/Book tabs) */}
            {activeTab !== 'my-bookings' && (
              <div className="card" style={{ marginBottom: '25px' }}>
                <h3>Search Mumbai Locations</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Area (e.g. South Mumbai, Bandra, Borivali)" 
                    value={searchArea} 
                    onChange={(e) => setSearchArea(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                  <button onClick={handleSearch} className="btn-primary">Search</button>
                </div>

                {/* FLASK ROUTE ADVISORY */}
                {routeInfo && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#f3e8ff', borderRadius: '8px', borderLeft: '4px solid var(--accent-purple)' }}>
                    <p><strong>💡 Flask Route Advisory:</strong> {routeInfo.travelTip}</p>
                    <p><strong>🚆 Recommended Transport:</strong> {routeInfo.bestTransport}</p>
                    <p><strong>⏰ Best Visit Timing:</strong> {routeInfo.bestTime}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: EXPLORE PLACES, HISTORY & REVIEWS */}
            {activeTab === 'explore' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {places.map((place) => (
                  <div key={place._id} className="card">
                    <img src={place.imageUrl} alt={place.name} className="card-img" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ color: 'var(--primary-emerald)', margin: '0' }}>{place.name}</h3>
                      <span style={{ background: '#fef08a', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>⭐ {place.rating}</span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#059669', margin: '5px 0 10px' }}>🌤️ {place.weatherSummary}</p>
                    <p><strong>Area:</strong> {place.area}</p>
                    <p><strong>Description:</strong> {place.description}</p>
                    <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                      <strong>🏛️ History:</strong> {place.history}
                    </p>
                    <p><strong>🚆 How to reach:</strong> {place.howToReach}</p>

                    {/* REVIEWS LIST WITH EDIT/DELETE CONTROLS */}
                    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                      <h4>Tourist Reviews:</h4>
                      {place.reviews && place.reviews.map((rev) => (
                        <div key={rev._id} style={{ background: '#f9fafb', padding: '8px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>{rev.userName} ({'⭐'.repeat(rev.rating)})</strong>
                            {rev.userName === user.fullName && (
                              <div>
                                <span 
                                  onClick={() => setEditingReview({ id: rev._id, locationId: place._id, comment: rev.comment, rating: rev.rating })} 
                                  style={{ cursor: 'pointer', color: '#7c3aed', marginRight: '8px', fontWeight: 'bold' }}
                                >
                                  Edit
                                </span>
                                <span 
                                  onClick={() => handleDeleteReview(place._id, rev._id)} 
                                  style={{ cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}
                                >
                                  Delete
                                </span>
                              </div>
                            )}
                          </div>
                          <p style={{ margin: '4px 0' }}>{rev.comment}</p>
                        </div>
                      ))}

                      {/* EDIT REVIEW FORM */}
                      {editingReview && editingReview.locationId === place._id ? (
                        <form onSubmit={(e) => handleUpdateReview(e, place._id, editingReview.id)} style={{ marginTop: '10px', padding: '10px', background: '#f3e8ff', borderRadius: '6px' }}>
                          <h5 style={{ margin: '0 0 8px' }}>Edit Review Details</h5>
                          <input 
                            type="text" required
                            value={editingReview.comment} 
                            onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })} 
                            style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box' }} 
                          />
                          <select 
                            value={editingReview.rating} 
                            onChange={(e) => setEditingReview({ ...editingReview, rating: e.target.value })} 
                            style={{ padding: '6px', marginRight: '8px' }}
                          >
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </select>
                          <button type="submit" className="btn-purple" style={{ padding: '6px 10px', fontSize: '12px', marginRight: '5px' }}>Save</button>
                          <button type="button" onClick={() => setEditingReview(null)} style={{ padding: '6px 10px', fontSize: '12px' }}>Cancel</button>
                        </form>
                      ) : (
                        /* ADD REVIEW FORM */
                        <form onSubmit={(e) => handleAddReview(e, place._id)} style={{ marginTop: '10px' }}>
                          <input 
                            type="text" placeholder="Write a review..." required
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            style={{ width: '70%', padding: '6px', marginRight: '5px' }}
                          />
                          <button type="submit" className="btn-purple" style={{ padding: '6px 10px', fontSize: '12px' }}>Post</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: HIRE TOUR GUIDES & BOOK TRIPS */}
            {activeTab === 'book' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {places.map((place) => (
                    <div key={place._id} className="card">
                      <img src={place.imageUrl} alt={place.name} className="card-img" />
                      <h3>{place.name}</h3>
                      <p><strong>Assigned Tour Guide:</strong> {place.guideName}</p>
                      <p><strong>Guide Fee:</strong> ₹{place.guideFee}/day</p>
                      <p><strong>Entry Fee:</strong> ₹{place.entryFee}</p>
                      <button 
                        onClick={() => { setSelectedPlace(place); setBookingStatus(''); }}
                        className="btn-purple"
                        style={{ width: '100%' }}
                      >
                        Book This Tour Guide & Pay
                      </button>
                    </div>
                  ))}
                </div>

                {/* FAKE PAYMENT MODAL */}
                {selectedPlace && (
                  <div className="card" style={{ marginTop: '30px', border: '2px solid var(--accent-purple)' }}>
                    <h3 style={{ color: 'var(--accent-purple)' }}>Demo Payment Gateway - Confirm Booking</h3>
                    <p><strong>Destination:</strong> {selectedPlace.name}</p>
                    <p><strong>Tour Guide:</strong> {selectedPlace.guideName}</p>
                    <p><strong>Total Amount (Entry + Guide Fee):</strong> ₹{selectedPlace.entryFee + selectedPlace.guideFee}</p>

                    <form onSubmit={handleFakePayment}>
                      <label>Visit Date:</label>
                      <input 
                        type="date" required 
                        value={bookingDate} 
                        onChange={(e) => setBookingDate(e.target.value)} 
                        style={{ display: 'block', margin: '8px 0 15px', padding: '10px', width: '100%', boxSizing: 'border-box' }} 
                      />

                      <label>Time Slot:</label>
                      <select 
                        value={slotTiming} 
                        onChange={(e) => setSlotTiming(e.target.value)}
                        style={{ display: 'block', margin: '8px 0 15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                        <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                      </select>

                      <label>Enter Account Password to Confirm Payment:</label>
                      <input 
                        type="password" required placeholder="Account Password" 
                        value={paymentPassword} 
                        onChange={(e) => setPaymentPassword(e.target.value)} 
                        style={{ display: 'block', margin: '8px 0 15px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
                      />

                      <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                        Confirm Payment & Save Booking
                      </button>
                    </form>

                    {bookingStatus && <h4 style={{ marginTop: '15px', color: 'var(--primary-emerald)' }}>{bookingStatus}</h4>}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: USER MY-BOOKINGS MANAGEMENT */}
            {activeTab === 'my-bookings' && (
              <div className="card">
                <h3>My Confirmed Tour Guide Bookings</h3>
                {myBookings.length === 0 ? (
                  <p>No active tour guide bookings found for your account.</p>
                ) : (
                  myBookings.map((b) => (
                    <div key={b._id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: '#f8fafc' }}>
                      <p><strong>Destination:</strong> {b.locationName}</p>
                      <p><strong>Tour Guide:</strong> {b.guideName}</p>
                      <p><strong>Visit Date:</strong> {b.bookingDate}</p>
                      <p><strong>Time Slot:</strong> {b.slotTiming}</p>
                      <p><strong>Amount Paid:</strong> ₹{b.amountPaid}</p>
                      <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{b.paymentStatus}</span></p>

                      <button 
                        onClick={() => setEditingBooking({ id: b._id, bookingDate: b.bookingDate, slotTiming: b.slotTiming })} 
                        style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                      >
                        Reschedule / Update
                      </button>
                      <button 
                        onClick={() => handleDeleteBooking(b._id)} 
                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel Booking
                      </button>

                      {/* EDIT BOOKING / RESCHEDULE FORM */}
                      {editingBooking && editingBooking.id === b._id && (
                        <form onSubmit={(e) => handleUpdateBooking(e, b._id)} style={{ marginTop: '15px', padding: '15px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #2563eb' }}>
                          <h4>Reschedule Visit Slot</h4>
                          <label style={{ display: 'block', margin: '5px 0' }}>New Date:</label>
                          <input 
                            type="date" required 
                            value={editingBooking.bookingDate} 
                            onChange={(e) => setEditingBooking({ ...editingBooking, bookingDate: e.target.value })} 
                            style={{ display: 'block', margin: '5px 0 10px', padding: '6px', width: '100%', boxSizing: 'border-box' }} 
                          />

                          <label style={{ display: 'block', margin: '5px 0' }}>New Time Slot:</label>
                          <select 
                            value={editingBooking.slotTiming} 
                            onChange={(e) => setEditingBooking({ ...editingBooking, slotTiming: e.target.value })} 
                            style={{ display: 'block', margin: '5px 0 10px', padding: '6px', width: '100%', boxSizing: 'border-box' }}
                          >
                            <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                            <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                            <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                          </select>

                          <button type="submit" className="btn-primary" style={{ padding: '6px 12px', marginRight: '5px' }}>Save Changes</button>
                          <button type="button" onClick={() => setEditingBooking(null)} style={{ padding: '6px 12px' }}>Cancel</button>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;