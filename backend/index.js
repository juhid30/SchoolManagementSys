const express = require("express");
const { connectToDB, getConnection } = require("./db");
// Connect to DB
connectToDB();
const app = express();

app.use(express.json()); // To take JSON input and parse it

// Defining APIs
app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const db = getConnection();
    const query = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
    const result = await db.execute(query, [
      name,
      address,
      latitude,
      longitude,
    ]);
    console.log("Result:", result);
    return res.status(201).json({
      message: "School added successfully!",
      schoolId: result[0].insertId,
    });
  } catch (error) {
    console.error("Error adding school:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to add school. Please try again later." });
  }
});

app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and Longitude are required" });
  }
  try {
    const db = getConnection();
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
  } catch (error) {
    console.error("Error fetching schools:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch schools. Please try again later." });
  }
});

app.get("/schools", async (req, res) => {
  try {
    const db = getConnection();
    const [schools] = await db.execute("SELECT * FROM schools");
    return res.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch schools. Please try again later." });
  }
});

// API to delete a school by ID
app.delete("/deleteSchool/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "School ID is required" });
  }

  try {
    const db = getConnection();
    const query = `DELETE FROM schools WHERE id = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    return res.status(200).json({ message: "School deleted successfully" });
  } catch (error) {
    console.error("Error deleting school:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to delete school. Please try again later." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
