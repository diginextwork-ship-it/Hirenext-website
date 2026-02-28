const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { atsExtractor, calculateAtsScore } = require("./resumeparser");

const UPLOAD_PATH = "__DATA__";
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

const app = express();

// Create upload directory if it doesn't exist
(async () => {
  try {
    await fs.access(UPLOAD_PATH);
  } catch {
    await fs.mkdir(UPLOAD_PATH, { recursive: true });
  }
})();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Resume parser API is running.",
  });
});

// Process resume endpoint
app.post(
  ["/api/process", "/process"],
  upload.single("resume"),
  async (req, res) => {
    let filePath = null;

    try {
      // Get the uploaded file
      const doc = getResumeFileFromRequest(req);

      if (!doc) {
        return res.status(400).json({
          error:
            "Resume file is required. Use one of: pdf_doc, resume, resume_file, resumeFile, file.",
        });
      }

      // Check file extension
      const extension = path.extname(doc.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return res.status(400).json({
          error: "Only PDF and DOCX resumes are supported.",
        });
      }

      // Get job description
      const jobDescription = getJobDescriptionFromRequest(req);

      // Process the resume
      filePath = doc.path;
      const result = await processResume(filePath, jobDescription);

      res.json(result);
    } catch (error) {
      console.error("Error processing resume:", error);
      res.status(500).json({
        error: `Error processing resume: ${error.message}`,
      });
    } finally {
      // Clean up uploaded file
      if (filePath) {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }
  },
);

// Helper function to get resume file from request
function getResumeFileFromRequest(req) {
  // Check if file was uploaded with multer
  if (req.file) {
    return req.file;
  }

  // Check various field names
  const fileKeys = ["pdf_doc", "resume", "resume_file", "resumeFile", "file"];

  for (const key of fileKeys) {
    if (req.files && req.files[key]) {
      return req.files[key];
    }
  }

  return null;
}

// Helper function to get job description from request
function getJobDescriptionFromRequest(req) {
  const formKeys = ["job_description", "jobDescription", "jd"];

  // Check form data
  for (const key of formKeys) {
    if (req.body && req.body[key]) {
      const value = req.body[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return "";
}

// Process resume file
async function processResume(filePath, jobDescription) {
  try {
    // Read file content
    const resumeText = await readFileFromPath(filePath);

    // Extract resume data
    const extractedRaw = await atsExtractor(resumeText);
    const parsedData = safeJson(extractedRaw, "resume data");

    // Calculate ATS score if job description provided
    let atsScoreData = null;
    if (jobDescription) {
      const atsRaw = await calculateAtsScore(resumeText, jobDescription);
      atsScoreData = safeJson(atsRaw, "ATS score");
    }

    return {
      data: parsedData,
      ats_score: atsScoreData,
      has_job_description: Boolean(jobDescription),
    };
  } catch (error) {
    throw error;
  }
}

// Read file content based on extension
async function readFileFromPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".pdf") {
    return await readPdf(filePath);
  } else if (extension === ".docx") {
    return await readDocx(filePath);
  } else {
    throw new Error(`Unsupported resume format: ${extension}`);
  }
}

// Read PDF file
async function readPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw new Error("Failed to read PDF file");
  }
}

// Read DOCX file
async function readDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  } catch (error) {
    console.error("Error reading DOCX:", error);
    throw new Error("Failed to read DOCX file");
  }
}

// Safe JSON parsing
function safeJson(rawValue, fallbackKey) {
  if (!rawValue) {
    return { error: `Empty ${fallbackKey} response` };
  }

  if (typeof rawValue === "object") {
    return rawValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return {
      error: `Could not parse ${fallbackKey}`,
      raw: rawValue,
    };
  }
}

// Start server
const PORT = process.env.RESUME_API_PORT || 8000;
const HOST = process.env.RESUME_API_HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Resume parser API running on http://${HOST}:${PORT}`);
});

module.exports = app;
