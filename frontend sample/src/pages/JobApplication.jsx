import { useState } from "react";
import "../styles/job-application.css";

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

export default function JobApplication({ setCurrentPage }) {
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^\d{10}$/.test(formData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    setSubmitted(true);
    setPhoneError("");
    setFormData(initialFormData);
  };

  return (
    <main className="job-application-page">
      <section className="job-application-shell">
        <div className="job-application-card">
          <h1>Job application form</h1>
          <p>Fill in your details to apply for this role.</p>

          <form className="job-application-form" onSubmit={handleSubmit}>
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
              <button type="submit" className="apply-submit-btn">
                Submit Application
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

          {submitted ? (
            <p className="application-success-message">
              Application submitted successfully.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
