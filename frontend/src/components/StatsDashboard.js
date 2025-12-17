import React, { useState, useEffect } from "react";
import "./StatsDashboard.css";
import { apiService } from "../services/apiService";

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load platform statistics on mount. Uses `apiService.getStats()`
  // and keeps `loading`/`error` states in sync.
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Request statistics from the backend and update local state
        const response = await apiService.getStats();
        setStats(response);
      } catch (err) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">
          Error loading statistics: {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>

        {/* Statistics grid: shows totals for patients, records, consents,
          active/pending consents and blockchain transactions. */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-description">
            Registered patients on the platform
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{stats.totalRecords}</div>
          <div className="stat-description">
            Medical records stored securely
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Consents</div>
          <div className="stat-value">{stats.totalConsents}</div>
          <div className="stat-description">All consent agreements created</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Consents</div>
          <div className="stat-value">{stats.activeConsents}</div>
          <div className="stat-description">Currently valid consents</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Consents</div>
          <div className="stat-value">{stats.pendingConsents}</div>
          <div className="stat-description">
            Awaiting blockchain confirmation
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats.totalTransactions}</div>
          <div className="stat-description">
            Blockchain transactions recorded
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
