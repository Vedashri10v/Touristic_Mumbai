const mongoose = require('mongoose');
const Location = require('./models/Location');

mongoose.connect('mongodb://127.0.0.1:27017/touristic_mumbai_db')
  .then(() => console.log('Connected to MongoDB for Seeding...'))
  .catch(err => console.error(err));

const sampleLocations = [
  {
    name: 'Gateway of India',
    area: 'South Mumbai',
    description: 'An iconic basalt arch monument overlooking the Arabian Sea, bustling with local life and boat trips.',
    history: 'Erected to commemorate the landing of King George V and Queen Mary at Apollo Bunder during their visit to India in 1911.',
    howToReach: 'Take a local train to Churchgate or CST station, followed by a short taxi ride.',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    weatherSummary: 'Coastal Breeze • 31°C',
    entryFee: 0,
    guideName: 'Ramesh Sharma',
    guideFee: 600,
    reviews: [
      { userName: 'Aarav Mehta', comment: 'Breathtaking monument and great sea breeze in the evening!', rating: 5 }
    ]
  },
  {
    name: 'Marine Drive',
    area: 'South Mumbai',
    description: 'A 3.6 km long promenade along the coast, famous for picturesque evening sunsets and city lights.',
    history: 'Constructed in the 1920s on land reclaimed from the sea, popularly known as the Queen\'s Necklace.',
    howToReach: 'Short walking distance from Marine Lines or Churchgate railway station.',
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    weatherSummary: 'Sunset Hour • 29°C',
    entryFee: 0,
    guideName: 'Priya Verma',
    guideFee: 500,
    reviews: [
      { userName: 'Sneha Rao', comment: 'Best spot in Mumbai to relax after a busy day!', rating: 5 }
    ]
  },
  {
    name: 'Bandra Fort & Bandstand',
    area: 'Bandra',
    description: 'Historic seaside fort offering panoramic views of the Bandra-Worli Sea Link skyline.',
    history: 'Built by the Portuguese in 1640 as a watchtower overlooking Mahim Bay and the southern sea route.',
    howToReach: 'Take a local train to Bandra station (West) and hire an auto-rickshaw.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Bandra%E2%80%93Worli_Sea_Link.jpg',
    rating: 4.6,
    weatherSummary: 'Clear Sky • 30°C',
    entryFee: 0,
    guideName: 'Amit Patel',
    guideFee: 700,
    reviews: [
      { userName: 'Rohan Joshi', comment: 'Stunning architecture and great photos of the Sea Link.', rating: 4 }
    ]
  },
  {
    name: 'Sanjay Gandhi National Park',
    area: 'Borivali',
    description: 'A vast protected tropical forest featuring ancient rock-cut Kanheri Caves and tiger safaris.',
    history: 'Protected area history dates back to the 3rd century BCE when Buddhist monks carved out the Kanheri Caves.',
    howToReach: 'Located right next to Borivali station (East). Easily accessible by bus or auto.',
    imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    weatherSummary: 'Shaded Green Cover • 28°C',
    entryFee: 85,
    guideName: 'Sanjay Kumar',
    guideFee: 800,
    reviews: [
      { userName: 'Pooja Nair', comment: 'Kanheri Caves are peaceful and full of history.', rating: 5 }
    ]
  }
];

const seedData = async () => {
  await Location.deleteMany({});
  await Location.insertMany(sampleLocations);
  console.log('Sample Mumbai places with Ratings & Reviews seeded successfully!');
  mongoose.connection.close();
};

seedData();