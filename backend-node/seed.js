const mongoose = require('mongoose');
const Location = require('./models/Location');

// Connect to MongoDB locally
mongoose.connect('mongodb://127.0.0.1:27017/touristic_mumbai_db')
  .then(() => console.log('Connected to MongoDB for Seeding...'))
  .catch(err => console.error(err));

// Sample Mumbai Places
const sampleLocations = [
  {
    name: 'Gateway of India',
    area: 'South Mumbai',
    description: 'Historical monument overlooking the Arabian Sea, built during British rule.',
    howToReach: 'Take a local train to Churchgate or CST station, then take a short taxi ride.',
    entryFee: 0,
    guideName: 'Ramesh Sharma',
    guideFee: 600
  },
  {
    name: 'Marine Drive',
    area: 'South Mumbai',
    description: '3.6 km long promenade along the coast, known as the Queen\'s Necklace.',
    howToReach: 'Walkable distance from Marine Lines or Churchgate railway station.',
    entryFee: 0,
    guideName: 'Priya Verma',
    guideFee: 500
  },
  {
    name: 'Bandra Fort & Bandstand',
    area: 'Bandra',
    description: 'Historic fort offering panoramic views of the Bandra-Worli Sea Link.',
    howToReach: 'Take local train to Bandra station (West) and hire an auto-rickshaw.',
    entryFee: 0,
    guideName: 'Amit Patel',
    guideFee: 700
  },
  {
    name: 'Sanjay Gandhi National Park',
    area: 'Borivali',
    description: 'Sprawling national park featuring Kanheri Caves and safari rides.',
    howToReach: 'Located right next to Borivali station (East). Easily accessible by bus or auto.',
    entryFee: 85,
    guideName: 'Sanjay Kumar',
    guideFee: 800
  }
];

// Seed function
const seedData = async () => {
  await Location.deleteMany({}); // Clear existing records
  await Location.insertMany(sampleLocations); // Insert sample places
  console.log('Sample Mumbai places added successfully!');
  mongoose.connection.close();
};

seedData();