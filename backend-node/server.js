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
