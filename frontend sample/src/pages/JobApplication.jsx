import { useMemo, useState } from "react";
import "../styles/job-application.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const RESUME_PARSER_BASE_URL =
  import.meta.env.VITE_RESUME_PARSER_BASE_URL || "http://localhost:8000";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  latestEducationLevel: "",
  boardUniversity: "",
  institutionName: "",
  gradingSystem: "",
  score: "",
  age: "",
};

const normalizeEducationLevel = (value) => {
  const text = (value || "").toString().trim().toLowerCase();
  if (!text) return "";
  if (text.includes("10")) return "10th";
  if (text.includes("12")) return "12th";
  if (text.includes("bachelor")) return "bachelors";
  if (text.includes("master")) return "masters";
  return "";
};

const normalizeGradingSystem = (value) => {
  const text = (value || "").toString().trim().toLowerCase();
  if (!text) return "";
  if (text.includes("gpa") || text.includes("cgpa")) return "gpa";
  if (text.includes("percent")) return "percentage";
  return "";
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(", ").trim();
      if (joined) return joined;
      continue;
    }

    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

const mapResumeDataToForm = (resumeData) => {
  if (!resumeData || typeof resumeData !== "object") {
    return initialFormData;
  }

  const educationEntry = Array.isArray(resumeData.education)
    ? resumeData.education[0] || {}
    : resumeData.education || {};

  const phoneDigits = firstNonEmpty(
    resumeData.phone,
    resumeData.mobile,
    resumeData.contact_number,
    resumeData.contact
  ).replace(/\D/g, "");

  return {
    name: firstNonEmpty(resumeData.full_name, resumeData.name),
    phone: phoneDigits.slice(0, 10),
    email: firstNonEmpty(resumeData.email, resumeData.email_id),
    latestEducationLevel: normalizeEducationLevel(
      firstNonEmpty(
        educationEntry.latest_education_level,
        educationEntry.degree,
        resumeData.latest_education_level
      )
    ),
    boardUniversity: firstNonEmpty(
      educationEntry.board_university,
      educationEntry.university,
      resumeData.board_university
    ),
    institutionName: firstNonEmpty(
      educationEntry.institution_name,
      educationEntry.college,
      educationEntry.school,
      resumeData.institution_name
    ),
    gradingSystem: normalizeGradingSystem(
      firstNonEmpty(
        educationEntry.grading_system,
        resumeData.grading_system
      )
    ),
    score: firstNonEmpty(educationEntry.score, resumeData.score),
    age: firstNonEmpty(resumeData.age),
  };
};

export default function JobApplication({ setCurrentPage }) {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedResume, setSelectedResume] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [atsScoreData, setAtsScoreData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [parseMessage, setParseMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const selectedJob = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedJob");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setPhoneError("");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setParseMessage("Please upload a PDF resume.");
      setSelectedResume(null);
      return;
    }

    setSelectedResume(file);
    setParseMessage("");
    await parseResume(file);
  };

  const parseResume = async (file) => {
    setIsParsingResume(true);
    setParseMessage("");

    try {
      const payload = new FormData();
      payload.append("pdf_doc", file);
      payload.append("job_description", selectedJob?.description || "");

      const response = await fetch(`${RESUME_PARSER_BASE_URL}/api/process`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to parse resume.");
      }

      const extracted = result?.data || {};
      const mapped = mapResumeDataToForm(extracted);

      setParsedResumeData(extracted);
      setAtsScoreData(result?.ats_score || null);
      setFormData((prev) => ({ ...prev, ...mapped }));
      setParseMessage("Resume parsed. You can edit any field before submitting.");
    } catch (error) {
      if (error instanceof TypeError) {
        setParseMessage(
          "Cannot connect to resume parser backend. Ensure Flask app runs on port 8000."
        );
      } else {
        setParseMessage(error.message || "Resume parsing failed.");
      }
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(false);
    setSubmitMessage("");

    if (!selectedJob?.id) {
      setSubmitMessage("No job selected. Please go back and choose a job first.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);
    setPhoneError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jid: selectedJob.id,
          ...formData,
          resume_filename: selectedResume?.name || null,
          resume_parsed_data: parsedResumeData,
          ats_score: atsScoreData?.ats_score ?? null,
          ats_match_percentage: atsScoreData?.match_percentage ?? null,
          ats_raw_json: atsScoreData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit application.");
      }

      setSubmitted(true);
      setSubmitMessage("Application submitted successfully.");
      setFormData(initialFormData);
      setSelectedResume(null);
      setParsedResumeData(null);
      setAtsScoreData(null);
    } catch (error) {
      if (error instanceof TypeError) {
        setSubmitMessage("Cannot connect to backend. Ensure API is running on port 5000.");
      } else {
        setSubmitMessage(error.message || "Application submission failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="job-application-page">
      <section className="job-application-shell">
        <div className="job-application-card">
          <h1>Job application form</h1>
          <p>Upload resume PDF for autofill, or complete fields manually.</p>

          {selectedJob ? (
            <p>
              Applying for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>
            </p>
          ) : (
            <p className="application-error-message">
              No job selected. Use Back to jobs and click Apply now on a job.
            </p>
          )}

          <form className="job-application-form" onSubmit={handleSubmit}>
            <div className="application-field">
              <label htmlFor="resumePdf">Resume PDF (optional but recommended)</label>
              <input
                id="resumePdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeSelect}
              />
              {isParsingResume ? <p>Parsing resume...</p> : null}
              {parseMessage ? <p className="application-success-message">{parseMessage}</p> : null}
              {atsScoreData?.ats_score !== undefined && atsScoreData?.ats_score !== null ? (
                <p>ATS score for this role: {atsScoreData.ats_score}%</p>
              ) : null}
            </div>

            <div className="application-field">
              <label htmlFor="applicantName">Name *</label>
              <input
                id="applicantName"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="application-field">
              <label htmlFor="applicantPhone">Phone *</label>
              <input
                id="applicantPhone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                title="Phone number must be exactly 10 digits"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                required
              />
              {phoneError ? <p className="application-error-message">{phoneError}</p> : null}
            </div>

            <div className="application-field">
              <label htmlFor="applicantEmail">Email *</label>
              <input
                id="applicantEmail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="application-field">
              <label htmlFor="latestEducationLevel">Add your latest education *</label>
              <select
                id="latestEducationLevel"
                name="latestEducationLevel"
                value={formData.latestEducationLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select highest level of completed education</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="bachelors">Bachelors</option>
                <option value="masters">Masters</option>
              </select>
            </div>

            <div className="application-field">
              <label htmlFor="boardUniversity">Enter your board/university *</label>
              <input
                id="boardUniversity"
                name="boardUniversity"
                type="text"
                value={formData.boardUniversity}
                onChange={handleChange}
                placeholder="Board or university name"
                required
              />
            </div>

            <div className="application-field">
              <label htmlFor="institutionName">Enter school/college name *</label>
              <input
                id="institutionName"
                name="institutionName"
                type="text"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="School or college name"
                required
              />
            </div>

            <div className="application-field">
              <label htmlFor="gradingSystem">Grading system *</label>
              <select
                id="gradingSystem"
                name="gradingSystem"
                value={formData.gradingSystem}
                onChange={handleChange}
                required
              >
                <option value="">Select grading system</option>
                <option value="percentage">Percentage (out of 100)</option>
                <option value="gpa">GPA (out of 10)</option>
              </select>
            </div>

            <div className="application-field">
              <label htmlFor="score">Enter your score *</label>
              <input
                id="score"
                name="score"
                type="text"
                value={formData.score}
                onChange={handleChange}
                placeholder={
                  formData.gradingSystem === "gpa"
                    ? "Enter GPA out of 10"
                    : "Enter percentage out of 100"
                }
                required
              />
            </div>

            <div className="application-field">
              <label htmlFor="applicantAge">Age *</label>
              <input
                id="applicantAge"
                name="age"
                type="number"
                min="16"
                max="100"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="application-actions">
              <button type="submit" className="apply-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="button"
                className="application-back-btn"
                onClick={() => setCurrentPage("jobs")}
              >
                Back to jobs
              </button>
            </div>
          </form>

          {submitted ? <p className="application-success-message">Application submitted successfully.</p> : null}
          {submitMessage && !submitted ? <p className="application-error-message">{submitMessage}</p> : null}
        </div>
      </section>
    </main>
  );
}
