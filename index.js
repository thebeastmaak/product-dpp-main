const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Sample cache for known athlete codes (can be expanded or fetched from DB)
let athleteCache = [];

// API endpoint to get athlete data by code
app.get("/api/athlete/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const url = `https://crs-test-rr2025.microplustimingservices.com:8080/api/v2/athletes?competitionCode=WUG2025&code=${code}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data[0]) return res.status(404).json({ error: "Athlete not found" });

    const athlete = data[0];
    res.json({
      code: athlete.Code,
      givenName: athlete.GivenName,
      familyName: athlete.FamilyName,
      nationality: athlete.NF || "N/A",
      dateOfBirth: athlete.DateOfBirth,
      discipline: athlete.Discipline,
      photo: athlete.Photo || null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch athlete data." });
  }
});

// Show list of known athletes
app.get("/athletes", async (req, res) => {
  try {
    // Optional: Fetch all athletes from the API
    const url = `https://crs-test-rr2025.microplustimingservices.com:8080/api/v2/athletes?competitionCode=WUG2025&code=*`;
    const response = await fetch(url);
    const data = await response.json();

    athleteCache = data.map(a => ({
      name: `${a.GivenName} ${a.FamilyName}`,
      code: a.Code
    }));

    let html = `<h2>Athlete Directory</h2><ul>`;
    for (const a of athleteCache) {
      html += `<li><a href="/?code=${a.code}" target="_blank">${a.name}</a> (${a.code})</li>`;
    }
    html += "</ul>";
    res.send(html);
  } catch (err) {
    res.status(500).send("Failed to load athlete list.");
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
