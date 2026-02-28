import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../styles/admin-panel.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PIE_COLORS = ["#c62828", "#ef5350", "#f57c00", "#ffb300", "#2e7d32", "#0277bd", "#5e35b1"];

const readJsonResponse = async (response, fallbackMessage) => {
  const rawBody = await response.text();
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Server returned non-JSON response (${response.status}) for ${response.url}. ${fallbackMessage}`
    );
  }
};

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dashboard, setDashboard] = useState({
    recruiterPerformance: [],
    candidatePerformance: [],
    totalResumeCount: 0,
    recruiterResumeUploads: [],
  });

  const fetchAdminDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`);
      const data = await readJsonResponse(
        response,
        "Check VITE_API_BASE_URL and backend route setup."
      );
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch admin dashboard.");
      }

      setDashboard({
        recruiterPerformance: Array.isArray(data.recruiterPerformance)
          ? data.recruiterPerformance
          : [],
        candidatePerformance: Array.isArray(data.candidatePerformance)
          ? data.candidatePerformance
          : [],
        totalResumeCount: Number(data.totalResumeCount) || 0,
        recruiterResumeUploads: Array.isArray(data.recruiterResumeUploads)
          ? data.recruiterResumeUploads
          : [],
      });
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Failed to fetch admin dashboard.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAdminDashboard();
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await readJsonResponse(response, `Check API base URL: ${API_BASE_URL}`);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create recruiter.");
      }

      setMessageType("success");
      setMessage(
        `Recruiter created successfully. Generated RID: ${data.recruiter.rid}`
      );
      setName("");
      setEmail("");
      setPassword("");
      setRole("recruiter");
      await fetchAdminDashboard();
    } catch (error) {
      if (error instanceof TypeError) {
        setMessageType("error");
        setMessage("Cannot connect to backend. Ensure API is running on port 5000.");
        return;
      }
      setMessageType("error");
      setMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recruiterChartData = useMemo(
    () =>
      dashboard.recruiterPerformance.map((item) => ({
        rid: item.rid || item.recruiterName,
        resumeCount: Number(item.resumeCount ?? item.clicks) || 0,
      })),
    [dashboard.recruiterPerformance]
  );

  const pieData = useMemo(
    () =>
      dashboard.candidatePerformance.map((item) => ({
        name: item.candidateName,
        value: Number(item.clicks) || 0,
      })),
    [dashboard.candidatePerformance]
  );

  return (
    <main className="admin-panel-page">
      <section className="admin-panel-shell">
        <div className="admin-panel-card">
          <h1>admin panel</h1>
          <p>Create a new recruiter account.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="newRecruiterName">Recruiter Name</label>
            <input
              id="newRecruiterName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recruiter full name"
              required
            />

            <label htmlFor="newRecruiterEmail">Recruiter Email</label>
            <input
              id="newRecruiterEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@company.com"
              required
            />

            <label htmlFor="newRecruiterPassword">Temporary Password</label>
            <div className="admin-password-input-wrap">
              <input
                id="newRecruiterPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set temporary password"
                required
              />
              <button
                type="button"
                className="admin-password-toggle-btn"
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

            <label htmlFor="recruiterRole">Role</label>
            <select
              id="recruiterRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="job creator">Job Creator</option>
              <option value="recruiter">Recruiter</option>
            </select>

            <button type="submit" className="admin-create-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Recruiter"}
            </button>

            {message ? (
              <p
                style={{
                  marginTop: "10px",
                  color: messageType === "success" ? "#1a7f37" : "#c62828",
                  fontSize: "0.9rem",
                }}
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="admin-dashboard-shell">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-head">
            <h2>Resumes submitted by RID</h2>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={async () => {
                await fetchAdminDashboard();
              }}
              disabled={isLoadingDashboard}
            >
              {isLoadingDashboard ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {recruiterChartData.length > 0 ? (
            <div className="admin-chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recruiterChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rid" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resumeCount" name="Resumes Submitted" fill="#c62828" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="admin-chart-empty">
              No resume submissions found in resumes_data yet.
            </p>
          )}

          {dashboard.recruiterPerformance.length > 0 ? (
            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>RID</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Recruiter Name</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recruiterPerformance.map((item) => (
                    <tr key={item.rid || item.recruiterName}>
                      <td style={{ padding: "8px" }}>{item.rid || "N/A"}</td>
                      <td style={{ padding: "8px" }}>{item.recruiterName || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="admin-dashboard-card">
          <h2>Candidate resume submissions</h2>
          {pieData.length > 0 ? (
            <div className="admin-chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="admin-chart-empty">
              No candidate resume submissions recorded yet.
            </p>
          )}
        </div>

        <div className="admin-dashboard-card">
          <h2>Recruiter resume uploads ({dashboard.totalResumeCount})</h2>
          {dashboard.recruiterResumeUploads.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>Resume ID</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Recruiter</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>RID</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Job ID</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Filename</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recruiterResumeUploads.map((item) => (
                    <tr key={item.resId}>
                      <td style={{ padding: "8px" }}>{item.resId}</td>
                      <td style={{ padding: "8px" }}>{item.recruiterName}</td>
                      <td style={{ padding: "8px" }}>{item.recruiterEmail}</td>
                      <td style={{ padding: "8px" }}>{item.rid}</td>
                      <td style={{ padding: "8px" }}>{item.jobJid ?? "N/A"}</td>
                      <td style={{ padding: "8px" }}>{item.resumeFilename}</td>
                      <td style={{ padding: "8px" }}>{String(item.resumeType || "").toUpperCase()}</td>
                      <td style={{ padding: "8px" }}>
                        {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-chart-empty">No resumes uploaded yet.</p>
          )}
        </div>

      </section>
    </main>
  );
}



