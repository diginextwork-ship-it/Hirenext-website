const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const jobRoutes = require("./routes/jobRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.use(healthRoutes);
app.use(recruiterRoutes);
app.use(jobRoutes);
app.use(adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

module.exports = app;
