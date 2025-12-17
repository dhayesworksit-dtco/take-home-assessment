import React, { useState, useEffect } from "react";
import "./PatientList.css";
import { apiService } from "../services/apiService";

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Local input value to avoid focus loss during rapid re-renders.
  // We apply a debounce and only update `searchTerm` used for API calls.
  const [inputValue, setInputValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const PAGE_SIZE = 10;

  // Fetch patients from the API with pagination and optional search.
  // Calls `apiService.getPatients(page, limit, search)` and updates
  // `patients`, `pagination`, and local loading/error state.
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPatients(
        currentPage,
        PAGE_SIZE,
        searchTerm
      );
      setPatients(response.patients || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  // Update the visible input immediately and reset to first page.
  // The actual `searchTerm` used for fetching will be updated
  // after a short debounce to avoid excessive API calls and
  // potential focus/re-render issues.
  const handleSearch = (e) => {
    setCurrentPage(1);
    setInputValue(e.target.value);
  };

  // Debounce inputValue -> searchTerm (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  if (loading) {
    return (
      <div className="patient-list-container">
        <div className="loading">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patients</h2>
        {/* Search input for filtering patients by name, id, or other fields */}
        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={inputValue}
          onChange={handleSearch}
        />
      </div>

      {/* Patient cards: clickable entries that open patient details via `onSelectPatient`. */}
      <div className="patient-list">
        {/* Your implementation here */}
        {patients.length === 0 ? (
          <div className="placeholder">
            <p>No patients found</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => onSelectPatient(patient.id)}
            >
              <div className="patient-card-header">
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-id">ID: {patient.patientId}</div>
                </div>
              </div>

              <div className="patient-info">
                <div className="patient-info-item">
                  📧 {patient.email || "No email provided"}
                </div>
                <div className="patient-info-item">
                  📞 {patient.phone || "No phone provided"}
                </div>
                <div className="patient-info-item">
                  🎂{" "}
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : "No DOB provided"}
                </div>
                <div className="patient-info-item">
                  📍 {patient.address || "No address provided"}
                </div>
                <div className="patient-info-item">
                   ⚥  {patient.gender || "Not specified"}
                </div>
              </div>

              {patient.walletAddress && (
                <div className="patient-wallet">
                  Wallet: {patient.walletAddress.slice(0, 6)}...
                  {patient.walletAddress.slice(-4)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination controls shown when multiple pages exist. */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientList;
