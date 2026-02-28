const express = require("express");
const pool = require("../config/db");

const router = express.Router();

const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?
       LIMIT 1`,
      [tableName]
    );
    if (rows.length > 0) return true;
  } catch {}

  try {
    await pool.query(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
    return true;
  } catch {
    return false;
  }
};

const columnExists = async (tableName, columnName) => {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
};

router.get("/api/admin/dashboard", async (_req, res) => {
  try {
    let recruiterPerformance = [];
    let candidatePerformance = [];
    let totalResumeCount = 0;
    let recruiterResumeUploads = [];

    if (await tableExists("resumes_data")) {
      const [recruiterRows] = await pool.query(
        `SELECT
          rd.rid AS rid,
          COALESCE(r.name, rd.rid) AS recruiterName,
          COUNT(*) AS resumeCount
         FROM resumes_data rd
         LEFT JOIN recruiter r ON r.rid = rd.rid
         GROUP BY rd.rid, recruiterName
         ORDER BY resumeCount DESC, rd.rid ASC`
      );

      recruiterPerformance = recruiterRows.map((row) => ({
        rid: row.rid,
        recruiterName: row.recruiterName,
        resumeCount: Number(row.resumeCount) || 0,
      }));
    }

    if (await tableExists("applications")) {
      const hasResumeFilenameColumn = await columnExists("applications", "resume_filename");
      const resumeFilter = hasResumeFilenameColumn
        ? "AND resume_filename IS NOT NULL AND TRIM(resume_filename) <> ''"
        : "";

      const [rows] = await pool.query(
        `SELECT candidate_name AS candidateName, COUNT(*) AS clicks
         FROM applications
         WHERE candidate_name IS NOT NULL
           AND TRIM(candidate_name) <> ''
           ${resumeFilter}
         GROUP BY candidate_name
         ORDER BY clicks DESC, candidateName ASC
         LIMIT 12`
      );
      candidatePerformance = rows.map((row) => ({
        candidateName: row.candidateName,
        clicks: Number(row.clicks) || 0,
      }));
    } else if (await tableExists("recruiter_candidate_clicks")) {
      const [rows] = await pool.query(
        `SELECT candidate_name AS candidateName, COUNT(*) AS clicks
         FROM recruiter_candidate_clicks
         WHERE candidate_name IS NOT NULL AND candidate_name <> ''
         GROUP BY candidate_name
         ORDER BY clicks DESC, candidateName ASC
         LIMIT 12`
      );
      candidatePerformance = rows.map((row) => ({
        candidateName: row.candidateName,
        clicks: Number(row.clicks) || 0,
      }));
    }

    if (await tableExists("resumes_data")) {
      const hasJobJidColumn = await columnExists("resumes_data", "job_jid");
      const jobJidSelect = hasJobJidColumn ? "rd.job_jid AS jobJid," : "NULL AS jobJid,";

      const [countRows] = await pool.query("SELECT COUNT(*) AS totalResumeCount FROM resumes_data");
      totalResumeCount = Number(countRows?.[0]?.totalResumeCount) || 0;

      const [rows] = await pool.query(
        `SELECT
          rd.res_id AS resId,
          rd.rid AS rid,
          r.name AS recruiterName,
          r.email AS recruiterEmail,
          ${jobJidSelect}
          rd.resume_filename AS resumeFilename,
          rd.resume_type AS resumeType,
          rd.uploaded_at AS uploadedAt
        FROM resumes_data rd
        INNER JOIN recruiter r ON r.rid = rd.rid
        ORDER BY rd.uploaded_at DESC`
      );

      recruiterResumeUploads = rows;
    }

    return res.status(200).json({
      recruiterPerformance,
      candidatePerformance,
      totalResumeCount,
      recruiterResumeUploads,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch admin dashboard.",
      error: error.message,
    });
  }
});

module.exports = router;
