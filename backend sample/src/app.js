const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(recruiterRoutes);
app.use(jobRoutes);

module.exports = app;
