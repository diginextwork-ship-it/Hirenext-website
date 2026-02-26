const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/api/recruiters", async (req, res) => {
  const { name, email, password, addjob } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "name, email, and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const gmailMatch = normalizedEmail.match(/^([a-z0-9._%+-]+)@gmail\.com$/i);
  if (!gmailMatch) {
    return res.status(400).json({
      message: "Email must be a valid @gmail.com address.",
    });
  }
  const gmailLocalPart = gmailMatch[1].toLowerCase();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT rid
       FROM recruiter
       WHERE LOWER(SUBSTRING_INDEX(email, '@', 1)) = ?
         AND LOWER(SUBSTRING_INDEX(email, '@', -1)) = 'gmail.com'
       LIMIT 1`,
      [gmailLocalPart]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: "Recruiter identity already exists before @gmail.com.",
      });
    }

    const [rows] = await connection.query(
      "SELECT rid FROM recruiter WHERE rid LIKE 'hnr-%' ORDER BY CAST(SUBSTRING(rid, 5) AS UNSIGNED) DESC LIMIT 1 FOR UPDATE"
    );

    const lastRid = rows.length > 0 ? rows[0].rid : null;
    const nextNumber = lastRid ? Number.parseInt(lastRid.replace("hnr-", ""), 10) + 1 : 1;
    const rid = `hnr-${nextNumber}`;

    const canAddJob = Boolean(addjob);

    await connection.query(
      "INSERT INTO recruiter (rid, name, email, password, addjob) VALUES (?, ?, ?, ?, ?)",
      [rid, name.trim(), normalizedEmail, password, canAddJob]
    );

    await connection.commit();
    return res.status(201).json({
      message: "Recruiter created successfully.",
      recruiter: {
        rid,
        name: name.trim(),
        email: normalizedEmail,
        addjob: canAddJob,
      },
    });
  } catch (error) {
    await connection.rollback();
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate recruiter entry." });
    }

    return res.status(500).json({
      message: "Failed to create recruiter.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

router.post("/api/recruiters/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT rid, name, email, addjob FROM recruiter WHERE email = ? AND password = ? LIMIT 1",
      [email.trim().toLowerCase(), password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const recruiter = rows[0];

    return res.status(200).json({
      message: "Login successful.",
      recruiter: {
        rid: recruiter.rid,
        name: recruiter.name,
        email: recruiter.email,
        addjob: Boolean(recruiter.addjob),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
});

module.exports = router;
