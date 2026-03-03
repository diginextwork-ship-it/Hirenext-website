import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL, getAdminHeaders, readJsonResponse } from "./adminApi";
import "../../styles/admin-panel.css";

const toCurrency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const formatTrendDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
};

export default function AdminRevenue({ setCurrentPage }) {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totalIntake: 0, totalExpense: 0, netProfit: 0 });
  const [dailyTrend, setDailyTrend] = useState([]);
  const [formData, setFormData] = useState({
    entryType: "expense",
    amount: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadRevenue = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/revenue`, {
        headers: getAdminHeaders(),
      });
      const data = await readJsonResponse(
        response,
        "Check VITE_API_BASE_URL and ensure backend admin revenue routes are running."
      );
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch revenue dashboard.");
      }

      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setSummary({
        totalIntake: Number(data?.summary?.totalIntake) || 0,
        totalExpense: Number(data?.summary?.totalExpense) || 0,
        netProfit: Number(data?.summary?.netProfit) || 0,
      });
      setDailyTrend(Array.isArray(data.dailyTrend) ? data.dailyTrend : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to fetch revenue dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  const chartData = useMemo(
    () =>
      dailyTrend.map((item) => ({
        date: formatTrendDate(item.date),
        intake: Number(item.intake) || 0,
        expense: Number(item.expense) || 0,
        net: Number(item.net) || 0,
      })),
    [dailyTrend]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/revenue/entries`, {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          entryType: formData.entryType,
          amount: Number(formData.amount),
          reason: formData.reason,
        }),
      });
      const data = await readJsonResponse(
        response,
        "Failed to parse add revenue entry response."
      );
      if (!response.ok) {
        throw new Error(data?.message || "Failed to add revenue entry.");
      }

      setStatusMessage("Revenue entry added.");
      setFormData((prev) => ({
        ...prev,
        amount: "",
        reason: "",
      }));
      await loadRevenue();
    } catch (error) {
      setErrorMessage(error.message || "Failed to add revenue entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmed = window.confirm(`Remove revenue entry #${entryId}?`);
    if (!confirmed) return;

    setIsDeletingId(entryId);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/revenue/entries/${entryId}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      const data = await readJsonResponse(
        response,
        "Failed to parse delete revenue entry response."
      );
      if (!response.ok) {
        throw new Error(data?.message || "Failed to remove revenue entry.");
      }

      setStatusMessage(`Revenue entry #${entryId} removed.`);
      await loadRevenue();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove revenue entry.");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="Revenue dashboard"
      subtitle="Track money intake and expenses including salaries, electricity bills, and client payments."
      setCurrentPage={setCurrentPage}
      actions={
        <button type="button" className="admin-refresh-btn" onClick={loadRevenue} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {errorMessage ? <div className="admin-alert admin-alert-error">{errorMessage}</div> : null}
      {statusMessage ? <div className="admin-alert">{statusMessage}</div> : null}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="admin-dashboard-card">
          <div className="admin-muted">Total Intake</div>
          <h3 style={{ margin: "8px 0 0", color: "#166534" }}>{toCurrency(summary.totalIntake)}</h3>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-muted">Total Expense</div>
          <h3 style={{ margin: "8px 0 0", color: "#b91c1c" }}>{toCurrency(summary.totalExpense)}</h3>
        </div>
        <div className="admin-dashboard-card">
          <div className="admin-muted">Net Profit</div>
          <h3 style={{ margin: "8px 0 0", color: summary.netProfit >= 0 ? "#1d4ed8" : "#b91c1c" }}>
            {toCurrency(summary.netProfit)}
          </h3>
        </div>
      </div>

      <div className="admin-dashboard-card admin-card-large">
        <form onSubmit={handleAddEntry} className="admin-form">
          <h2 style={{ marginTop: 0 }}>Add revenue entry</h2>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div>
              <label htmlFor="entryType">Entry Type</label>
              <select
                id="entryType"
                name="entryType"
                value={formData.entryType}
                onChange={handleInputChange}
                required
              >
                <option value="expense">Expense (money going out)</option>
                <option value="intake">Intake (money coming in)</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="reason">
                {formData.entryType === "expense" ? "Reason (required)" : "Reason / Description"}
              </label>
              <input
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required={formData.entryType === "expense"}
                placeholder={
                  formData.entryType === "expense"
                    ? "e.g. Electricity bill, salary, internet"
                    : "e.g. Client payment from ABC Corp"
                }
              />
            </div>
          </div>
          <button type="submit" className="admin-create-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Entry"}
          </button>
        </form>
      </div>

      <div className="admin-dashboard-card admin-card-large">
        <h2 style={{ marginTop: 0 }}>Revenue trend</h2>
        {chartData.length === 0 ? (
          <p className="admin-chart-empty">No revenue entries yet.</p>
        ) : (
          <div className="admin-chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="intake" stroke="#15803d" strokeWidth={2.5} />
                <Line type="monotone" dataKey="expense" stroke="#b91c1c" strokeWidth={2.5} />
                <Line type="monotone" dataKey="net" stroke="#1d4ed8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="admin-dashboard-card admin-card-large">
        <h2 style={{ marginTop: 0 }}>Revenue entries</h2>
        {entries.length === 0 ? (
          <p className="admin-chart-empty">No entries recorded yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Intake</th>
                  <th>Expense</th>
                  <th>Profit (running)</th>
                  <th>Reason</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.entryType}</td>
                    <td>{toCurrency(item.companyRev)}</td>
                    <td>{toCurrency(item.expense)}</td>
                    <td>{toCurrency(item.profit)}</td>
                    <td>{item.reason || "N/A"}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-back-btn"
                        onClick={() => handleDeleteEntry(item.id)}
                        disabled={isDeletingId === item.id}
                      >
                        {isDeletingId === item.id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
