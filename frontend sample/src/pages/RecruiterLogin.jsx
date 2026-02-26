import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../styles/recruiter-login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatTrendDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleString();
};

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingCounter, setIsUpdatingCounter] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [recruiter, setRecruiter] = useState(null);
  const [dashboard, setDashboard] = useState({
    summary: { success: 0, thisMonth: 0 },
    monthlyTrend: [],
  });
  const [applications, setApplications] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [dashboardMessageType, setDashboardMessageType] = useState("");
  const [jobData, setJobData] = useState({
    city: "",
    state: "",
    pincode: "",
    company_name: "",
    role_name: "",
    skills: "",
    job_description: "",
    experience: "",
    salary: "",
    qualification: "",
    benefits: "",
  });
  const [jobMessage, setJobMessage] = useState("");
  const [jobMessageType, setJobMessageType] = useState("");

  const fetchRecruiterDashboard = async (rid) => {
    const response = await fetch(`${API_BASE_URL}/api/recruiters/${rid}/dashboard`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch recruiter dashboard.");
    }
    setDashboard({
      summary: data.summary || { success: 0, thisMonth: 0 },
      monthlyTrend: Array.isArray(data.monthlyTrend) ? data.monthlyTrend : [],
    });
  };

  const fetchApplications = async (rid) => {
    setIsLoadingApplications(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters/${rid}/applications`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch recruiter applications.");
      }
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDashboardMessage("");
    setDashboardMessageType("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.message || "Invalid credentials");
        return;
      }

      setRecruiter(data.recruiter);
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error instanceof TypeError) {
        alert("Cannot connect to backend. Ensure API is running on port 5000.");
        return;
      }
      alert("Unable to login right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!recruiter?.rid) return;

    const loadDashboard = async () => {
      try {
        await Promise.all([
          fetchRecruiterDashboard(recruiter.rid),
          fetchApplications(recruiter.rid),
        ]);
      } catch (error) {
        setDashboardMessageType("error");
        setDashboardMessage(error.message || "Failed to load recruiter dashboard.");
      }
    };

    loadDashboard();
  }, [recruiter?.rid]);

  const handleCompleteCandidate = async () => {
    if (!recruiter?.rid) return;
    setIsUpdatingCounter(true);
    setDashboardMessage("");
    setDashboardMessageType("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/recruiters/${recruiter.rid}/candidate-click`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ candidateName }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update completion count.");
      }

      setDashboard((prev) => ({
        ...prev,
        summary: data.summary || prev.summary,
      }));
      setRecruiter((prev) =>
        prev ? { ...prev, success: data.summary?.success ?? prev.success } : prev
      );
      setCandidateName("");
      await fetchRecruiterDashboard(recruiter.rid);
      setDashboardMessageType("success");
      setDashboardMessage("Candidate completion updated.");
    } catch (error) {
      if (error instanceof TypeError) {
        setDashboardMessageType("error");
        setDashboardMessage("Cannot connect to backend. Ensure API is running on port 5000.");
        return;
      }
      setDashboardMessageType("error");
      setDashboardMessage(error.message || "Failed to update completion count.");
    } finally {
      setIsUpdatingCounter(false);
    }
  };

  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setJobMessage("");
    setJobMessageType("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...jobData, recruiter_rid: recruiter.rid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create job.");
      }

      setJobMessageType("success");
      setJobMessage(`Job created successfully. Generated JID: ${data.job.jid}`);
      setJobData({
        city: "",
        state: "",
        pincode: "",
        company_name: "",
        role_name: "",
        skills: "",
        job_description: "",
        experience: "",
        salary: "",
        qualification: "",
        benefits: "",
      });
    } catch (error) {
      if (error instanceof TypeError) {
        setJobMessageType("error");
        setJobMessage("Cannot connect to backend. Ensure API is running on port 5000.");
        return;
      }
      setJobMessageType("error");
      setJobMessage(error.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recruiterTrendData = useMemo(
    () =>
      dashboard.monthlyTrend.map((entry) => ({
        date: formatTrendDate(entry.date),
        clicks: Number(entry.clicks) || 0,
      })),
    [dashboard.monthlyTrend]
  );

  if (recruiter) {
    return (
      <main className="recruiter-login-page">
        <section className="recruiter-login-shell recruiter-job-shell">
          <div className="recruiter-login-card recruiter-job-card">
            <h1>recruiter dashboard</h1>
            <p>
              Logged in as <strong>{recruiter.name}</strong>.
            </p>

            <div className="recruiter-dashboard-grid">
              <div className="recruiter-stat-card">
                <h2>Monthly completion</h2>
                <p className="recruiter-stat-value">{dashboard.summary.thisMonth}</p>
                <p className="recruiter-stat-caption">
                  Number of candidates you completed this month.
                </p>
              </div>

              <div className="recruiter-stat-card">
                <h2>Total success</h2>
                <p className="recruiter-stat-value">{dashboard.summary.success}</p>
                <p className="recruiter-stat-caption">Stored in recruiter.success.</p>
              </div>
            </div>

            <div className="candidate-click-panel">
              <label htmlFor="candidateName">Candidate Name (optional)</label>
              <input
                id="candidateName"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Candidate name for performance chart"
              />
              <button
                type="button"
                className="click-here-btn"
                onClick={handleCompleteCandidate}
                disabled={isUpdatingCounter}
              >
                {isUpdatingCounter ? "Updating..." : "Click Here"}
              </button>
              {dashboardMessage ? (
                <p
                  className={`job-message ${
                    dashboardMessageType === "success"
                      ? "job-message-success"
                      : "job-message-error"
                  }`}
                >
                  {dashboardMessage}
                </p>
              ) : null}
            </div>

            <div className="chart-card">
              <h2>Your candidate completions this month</h2>
              {recruiterTrendData.length > 0 ? (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={recruiterTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#c62828"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="chart-empty">No candidate completions recorded this month yet.</p>
              )}
            </div>

            <div className="chart-card" style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <h2>Applicants and ATS score</h2>
                <button
                  type="button"
                  className="click-here-btn"
                  onClick={() => fetchApplications(recruiter.rid)}
                  disabled={isLoadingApplications}
                >
                  {isLoadingApplications ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {applications.length === 0 ? (
                <p className="chart-empty">
                  {isLoadingApplications
                    ? "Loading applications..."
                    : "No applications found yet for your jobs."}
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px" }}>Candidate</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Job</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>ATS Score</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Applied At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: "8px" }}>{item.candidateName}</td>
                          <td style={{ padding: "8px" }}>{item.email}</td>
                          <td style={{ padding: "8px" }}>
                            {item.job?.roleName} ({item.job?.companyName})
                          </td>
                          <td style={{ padding: "8px" }}>
                            {item.atsScore === null ? "N/A" : `${item.atsScore}%`}
                          </td>
                          <td style={{ padding: "8px" }}>{formatDateTime(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!recruiter.addjob ? (
              <p className="job-message job-message-error">
                You are recruiter but cannot add jobs.
              </p>
            ) : (
              <form onSubmit={handleJobSubmit} className="job-form">
                <h2 className="add-job-title">add job</h2>
                <div className="job-form-grid">
                  <div className="job-field">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      name="city"
                      value={jobData.city}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      name="state"
                      value={jobData.state}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      id="pincode"
                      name="pincode"
                      value={jobData.pincode}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="company_name">Company Name *</label>
                    <input
                      id="company_name"
                      name="company_name"
                      value={jobData.company_name}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="role_name">Role Name *</label>
                    <input
                      id="role_name"
                      name="role_name"
                      value={jobData.role_name}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="experience">Experience (optional)</label>
                    <input
                      id="experience"
                      name="experience"
                      value={jobData.experience}
                      onChange={handleJobInputChange}
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="salary">Salary (optional)</label>
                    <input
                      id="salary"
                      name="salary"
                      value={jobData.salary}
                      onChange={handleJobInputChange}
                    />
                  </div>

                  <div className="job-field">
                    <label htmlFor="qualification">Qualification (optional)</label>
                    <input
                      id="qualification"
                      name="qualification"
                      value={jobData.qualification}
                      onChange={handleJobInputChange}
                    />
                  </div>
                </div>

                <div className="job-field">
                  <label htmlFor="skills">Skills (optional)</label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={jobData.skills}
                    onChange={handleJobInputChange}
                    rows={3}
                  />
                </div>

                <div className="job-field">
                  <label htmlFor="job_description">Job Description (optional)</label>
                  <textarea
                    id="job_description"
                    name="job_description"
                    value={jobData.job_description}
                    onChange={handleJobInputChange}
                    rows={4}
                  />
                </div>

                <div className="job-field">
                  <label htmlFor="benefits">Benefits (optional)</label>
                  <textarea
                    id="benefits"
                    name="benefits"
                    value={jobData.benefits}
                    onChange={handleJobInputChange}
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="recruiter-login-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Job"}
                </button>

                {jobMessage ? (
                  <p
                    className={`job-message ${
                      jobMessageType === "success"
                        ? "job-message-success"
                        : "job-message-error"
                    }`}
                  >
                    {jobMessage}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="recruiter-login-page">
      <section className="recruiter-login-shell">
        <div className="recruiter-login-card">
          <h1>recruiter login</h1>
          <p>Sign in to manage openings and candidate pipelines.</p>

          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="recruiterEmail">Email</label>
            <input
              id="recruiterEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />

            <label htmlFor="recruiterPassword">Password</label>
            <div className="password-input-wrap">
              <input
                id="recruiterPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M3 3l18 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58a2 2 0 1 0 2.83 2.83"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.88 5.08A10.9 10.9 0 0 1 12 4.9c5.25 0 8.85 3.97 10 7.1a12.64 12.64 0 0 1-3.12 4.49M6.6 6.6A13.4 13.4 0 0 0 2 12c1.15 3.13 4.75 7.1 10 7.1 1.87 0 3.5-.5 4.94-1.27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M2 12s3.6-7.1 10-7.1S22 12 22 12s-3.6 7.1-10 7.1S2 12 2 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="recruiter-login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
