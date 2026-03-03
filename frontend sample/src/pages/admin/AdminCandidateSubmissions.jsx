import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import AdminLayout from "./AdminLayout";
import useAdminDashboard from "./useAdminDashboard";
import "../../styles/admin-panel.css";

const PIE_COLORS = ["#c62828", "#ef5350", "#f57c00", "#ffb300", "#2e7d32", "#0277bd", "#5e35b1"];

export default function AdminCandidateSubmissions({ setCurrentPage }) {
  const {
    candidatePieData,
    isLoadingDashboard,
    errorMessage,
    refreshDashboard,
  } = useAdminDashboard();

  return (
    <AdminLayout
      title="Candidate submissions"
      subtitle="Track candidate resume submission activity."
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
        {candidatePieData.length > 0 ? (
          <div className="admin-chart-wrap">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={candidatePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {candidatePieData.map((entry, index) => (
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
          <p className="admin-chart-empty">No candidate resume submissions recorded yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
