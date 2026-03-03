import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "./AdminLayout";
import useAdminDashboard from "./useAdminDashboard";
import "../../styles/admin-panel.css";

export default function AdminRidPerformance({ setCurrentPage }) {
  const {
    recruiterChartData,
    dashboard,
    isLoadingDashboard,
    errorMessage,
    refreshDashboard,
  } = useAdminDashboard();

  return (
    <AdminLayout
      title="Resumes by recruiter ID"
      subtitle="See which recruiters are submitting the most resumes."
      setCurrentPage={setCurrentPage}
      actions={
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={refreshDashboard}
          disabled={isLoadingDashboard}
        >
          {isLoadingDashboard ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {errorMessage ? (
        <div className="admin-alert admin-alert-error">{errorMessage}</div>
      ) : null}

      <div className="admin-dashboard-card admin-card-large">
        {recruiterChartData.length > 0 ? (
          <div className="admin-chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
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
          <p className="admin-chart-empty">No resume submissions found in resumes_data yet.</p>
        )}

        {dashboard.recruiterPerformance.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>RID</th>
                  <th>Recruiter Name</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recruiterPerformance.map((item) => (
                  <tr key={item.rid || item.recruiterName}>
                    <td>{item.rid || "N/A"}</td>
                    <td>{item.recruiterName || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
