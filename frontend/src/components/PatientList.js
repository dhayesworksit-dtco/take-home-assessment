import React, { useState, useEffect } from "react";
import "./PatientList.css";
import { apiService } from "../services/apiService";

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const PAGE_SIZE = 10;

  // TODO: Implement the fetchPatients function
  // This function should:
  // 1. Call apiService.getPatients with appropriate parameters (page, limit, search)
  // 2. Update the patients state with the response data
  // 3. Update the pagination state
  // 4. Handle loading and error states
  const fetchPatients = async () => {
    // Your implementation here
    setLoading(true);
    setError(null);
    try {
      // TODO: Call API and update state
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

  // TODO: Implement search functionality
  // Add a debounce or handle search input changes
  const handleSearch = (e) => {
    setCurrentPage(1);
    setSearchTerm(e.target.value);
  };
  // Your implementation here
  // };

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
        {/* TODO: Add search input field */}
        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
          // TODO: Add value, onChange handlers
        />
      </div>

      {/* TODO: Implement patient list display */}
      {/* Map through patients and display them */}
      {/* Each patient should be clickable and call onSelectPatient with patient.id */}
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

      {/* TODO: Implement pagination controls */}
      {/* Show pagination buttons if pagination data is available */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          {/* Your pagination implementation here */}
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
