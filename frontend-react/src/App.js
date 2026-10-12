import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // 1. User State (Login / Registration)
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });

  // 2. Search State
  const [searchArea, setSearchArea] = useState('');
  const [places, setPlaces] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // 3. Booking & Payment State
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slotTiming, setSlotTiming] = useState('10:00 AM - 1:00 PM');
  const [paymentPassword, setPaymentPassword] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  // HANDLER 1: Handle User Registration & Login
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

  // HANDLER 2: Search Places in Express API + Call Flask Advisory
  const handleSearch = async () => {
    if (!searchArea) return alert('Please enter an area name!');

    try {
      // Fetch places from Express Backend
      const res = await axios.get(`http://localhost:5000/api/locations?area=${searchArea}`);
      setPlaces(res.data);

      // Fetch Travel Advisory from Flask Microservice
      const flaskRes = await axios.post('http://localhost:5001/api/route-info', { area: searchArea });
      setRouteInfo(flaskRes.data.routeInfo);
    } catch (err) {
      console.error('Error searching places:', err);
    }
  };

  // HANDLER 3: Demo Payment & Guide Booking Confirmation
  const handleFakePayment = async (e) => {
    e.preventDefault();

    const paymentData = {
      email: user.email,
      password: paymentPassword,
      locationName: selectedPlace.name,
      guideName: selectedPlace.guideName,
      bookingDate: bookingDate,
      slotTiming: slotTiming,
      amountPaid: selectedPlace.entryFee + selectedPlace.guideFee
    };

    try {
      const res = await axios.post('http://localhost:5000/api/pay-and-book', paymentData);
      setBookingStatus(`🎉 ${res.data.message}`);
    } catch (err) {
      setBookingStatus(`❌ ${err.response?.data?.message || 'Payment Declined'}`);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      
      {/* HEADER */}
      <header style={{ background: '#1e293b', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h1>Touristic Mumbai 🏙️</h1>
        <p>Explore Places, Hire Local Tour Guides & Book Trips</p>
      </header>

      {/* SECTION 1: LOGIN / REGISTER FORM */}
      {!user ? (
        <div style={{ margin: '30px auto', maxWidth: '380px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>{authMode === 'register' ? 'Register New Account' : 'User Login'}</h3>
          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <input 
                type="text" placeholder="Full Name" required
                value={authForm.fullName}
                onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
              />
            )}
            <input 
              type="email" placeholder="Email Address" required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
            />
            <input 
              type="password" placeholder="Password" required
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              style={{ width: '100%', marginBottom: '15px', padding: '8px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
              {authMode === 'register' ? 'Create Account' : 'Login'}
            </button>
          </form>
          <p 
            onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
            style={{ color: '#2563eb', cursor: 'pointer', textAlign: 'center', marginTop: '15px' }}
          >
            {authMode === 'register' ? 'Already have an account? Login' : 'Need an account? Register'}
          </p>
        </div>
      ) : (
        <div>
          {/* USER WELCOME BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
            <h3>Welcome, {user.fullName}! 👋</h3>
            <button onClick={() => setUser(null)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>Logout</button>
          </div>

          {/* SECTION 2: SEARCH BY AREA */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <h3>Search Mumbai Locations</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter Area (e.g. South Mumbai, Bandra, Borivali)" 
                value={searchArea} 
                onChange={(e) => setSearchArea(e.target.value)}
                style={{ flex: 1, padding: '10px' }}
              />
              <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#059669', color: 'white', border: 'none', cursor: 'pointer' }}>Search</button>
            </div>

            {/* FLASK ROUTE ADVISORY DISPLAY */}
            {routeInfo && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#e0f2fe', borderRadius: '5px' }}>
                <p><strong>💡 Flask Route Advisory:</strong> {routeInfo.travelTip}</p>
                <p><strong>🚆 Recommended Transport:</strong> {routeInfo.bestTransport}</p>
                <p><strong>⏰ Best Visit Timing:</strong> {routeInfo.bestTime}</p>
              </div>
            )}
          </div>

          {/* SECTION 3: PLACES CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {places.map((place) => (
              <div key={place._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: 'white' }}>
                <h4>{place.name}</h4>
                <p><strong>Area:</strong> {place.area}</p>
                <p>{place.description}</p>
                <p><strong>How to reach:</strong> {place.howToReach}</p>
                <p><strong>Assigned Tour Guide:</strong> {place.guideName} (₹{place.guideFee}/day)</p>
                <button 
                  onClick={() => { setSelectedPlace(place); setBookingStatus(''); }}
                  style={{ width: '100%', padding: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Book Tour Guide & Pay
                </button>
              </div>
            ))}
          </div>

          {/* SECTION 4: FAKE PAYMENT MODAL */}
          {selectedPlace && (
            <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #2563eb', borderRadius: '8px', background: '#eff6ff' }}>
              <h3>Demo Payment Gateway - Booking Confirmation</h3>
              <p><strong>Destination:</strong> {selectedPlace.name}</p>
              <p><strong>Tour Guide:</strong> {selectedPlace.guideName}</p>
              <p><strong>Total Amount (Entry + Guide Fee):</strong> ₹{selectedPlace.entryFee + selectedPlace.guideFee}</p>

              <form onSubmit={handleFakePayment}>
                <label>Visit Date:</label>
                <input 
                  type="date" required 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  style={{ display: 'block', margin: '8px 0 15px', padding: '8px' }} 
                />

                <label>Time Slot:</label>
                <select 
                  value={slotTiming} 
                  onChange={(e) => setSlotTiming(e.target.value)}
                  style={{ display: 'block', margin: '8px 0 15px', padding: '8px', width: '100%' }}
                >
                  <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                  <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                  <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                </select>

                <label>Enter Password to Confirm Payment:</label>
                <input 
                  type="password" required placeholder="Account Password" 
                  value={paymentPassword} 
                  onChange={(e) => setPaymentPassword(e.target.value)} 
                  style={{ display: 'block', margin: '8px 0 15px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />

                <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Pay & Confirm Booking
                </button>
              </form>

              {bookingStatus && <h4 style={{ marginTop: '15px' }}>{bookingStatus}</h4>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;