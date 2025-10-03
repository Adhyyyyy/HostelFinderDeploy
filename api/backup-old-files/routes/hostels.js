router.get("/", async (req, res) => {
  try {
    const hostels = await Hostel.find({}); // Or your query logic
    res.status(200).json({ success: true, data: hostels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}); 