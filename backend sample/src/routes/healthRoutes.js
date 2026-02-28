const express = require("express");
const pool = require("../config/db");
const { getGeminiStatus } = require("../resumeparser/resumeparser");

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      ok: true,
      gemini: getGeminiStatus(),
    });
  } catch (_error) {
    res.status(500).json({ ok: false, message: "Database connection failed." });
  }
});

module.exports = router;
