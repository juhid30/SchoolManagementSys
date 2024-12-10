const express = require("express");
const { connectToDB, getConnection } = require("./db");
const db = getConnection();
const app = express();

app.use(express.json()); // To take JSON input and parse it

// Connect to DB
await connectToDB();

// Defining APIs
app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
  const result = await db.execute(query, [name, address, latitude, longitude]);
  console.log("Result:", result);
  return res.status(201).json({
    message: "School added successfully!",
    schoolId: result[0].insertId,
  });
});

app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and Longitude are required" });
  }

  const [schools] = await db.execute(`SELECT * FROM schools`);

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  const sortedSchools = schools
    .map((school) => {
      const distance = Math.sqrt(
        Math.pow(school.latitude - userLat, 2) +
          Math.pow(school.longitude - userLon, 2)
      );
      return { ...school, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  return res.json(sortedSchools);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
