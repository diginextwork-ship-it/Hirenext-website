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

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [addjob, setAddjob] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dashboard, setDashboard] = useState({
    recruiterPerformance: [],
    candidatePerformance: [],
  });

  const fetchAdminDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`);
      const data = await response.json();
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
      });
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Failed to fetch admin dashboard.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
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
        body: JSON.stringify({ name, email, password, addjob }),
      });

      const rawBody = await response.text();
      let data = null;

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          throw new Error(
            `Server returned non-JSON response (${response.status}). Check API base URL: ${API_BASE_URL}`
          );
        }
      }

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
      setAddjob(false);
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
        name: item.recruiterName,
        clicks: Number(item.clicks) || 0,
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

            <label htmlFor="recruiterAddJob" className="admin-checkbox-label">
              <input
                id="recruiterAddJob"
                type="checkbox"
                checked={addjob}
                onChange={(e) => setAddjob(e.target.checked)}
              />
              Allow recruiter to add jobs
            </label>

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
            <h2>Recruiters click dashboard</h2>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={fetchAdminDashboard}
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
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" name="Completed Candidates" fill="#c62828" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="admin-chart-empty">
              No recruiter click data yet. Recruiters need to use Click Here.
            </p>
          )}
        </div>

        <div className="admin-dashboard-card">
          <h2>Candidate performance pie chart</h2>
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
              No candidate names recorded yet. Candidate pie chart will appear after recruiter clicks.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
