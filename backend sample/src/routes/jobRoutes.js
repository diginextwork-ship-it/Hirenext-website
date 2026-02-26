const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/api/jobs", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        jid,
        city,
        state,
        pincode,
        company_name,
        role_name,
        skills,
        job_description,
        experience,
        salary,
        qualification,
        benefits
      FROM jobs
      ORDER BY jid DESC`
    );

    return res.status(200).json({ jobs: rows });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch jobs.",
      error: error.message,
    });
  }
});

router.post("/api/jobs", async (req, res) => {
  const {
    recruiter_rid,
    city,
    state,
    pincode,
    company_name,
    role_name,
    skills,
    job_description,
    experience,
    salary,
    qualification,
    benefits,
  } = req.body || {};

  if (!recruiter_rid || !city || !state || !pincode || !company_name || !role_name) {
    return res.status(400).json({
      message:
        "recruiter_rid, city, state, pincode, company_name, and role_name are required.",
    });
  }

  try {
    const [recruiters] = await pool.query(
      "SELECT addjob FROM recruiter WHERE rid = ? LIMIT 1",
      [recruiter_rid]
    );

    if (recruiters.length === 0) {
      return res.status(403).json({ message: "Recruiter is not authorized." });
    }

    if (!Boolean(recruiters[0].addjob)) {
      return res.status(403).json({ message: "You are recruiter but cannot add jobs." });
    }

    const [result] = await pool.query(
      `INSERT INTO jobs
        (city, state, pincode, company_name, role_name, skills, job_description, experience, salary, qualification, benefits)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        city.trim(),
        state.trim(),
        pincode.trim(),
        company_name.trim(),
        role_name.trim(),
        skills?.trim() || null,
        job_description?.trim() || null,
        experience?.trim() || null,
        salary?.trim() || null,
        qualification?.trim() || null,
        benefits?.trim() || null,
      ]
    ); 

    return res.status(201).json({
      message: "Job created successfully.",
      job: {
        jid: result.insertId,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        company_name: company_name.trim(),
        role_name: role_name.trim(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create job.",
      error: error.message,
    });
  }
});

module.exports = router;
