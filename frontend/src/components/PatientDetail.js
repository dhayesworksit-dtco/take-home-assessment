import React, { useState, useEffect } from "react";
import "./PatientDetail.css";
import { apiService } from "../services/apiService";

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: format date
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  // Fetch patient details and associated medical records whenever
  // `patientId` changes. Uses `apiService.getPatient` and
  // `apiService.getPatientRecords` and updates local `patient` and
  // `records` state while managing loading and error states.
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch patient details and records in parallel and update state.
        // Note: `getPatientRecords` may return an array or an object
        // with a `records` property — normalization is handled below.
        const [patientRes, recordsRes] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId),
        ]);

        setPatient(patientRes);
        setRecords(
          Array.isArray(recordsRes) ? recordsRes : recordsRes?.records || []
        );
      } catch (err) {
        setError(err.message || "Failed to fetch patient data");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">
          Error loading patient: {error || "Patient not found"}
        </div>
        <button onClick={onBack} className="back-btn">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to List
        </button>
      </div>

      <div className="patient-detail-content">
        {/* Patient information section: shows name, contact info, DOB,
            gender, address and connected wallet. Values fall back to
            a readable placeholder when missing. */}
        <div className="patient-info-section">
          <h2>Patient Information</h2>
          {/* Rendered below: label/value grid with safe fallbacks */}
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{patient.name}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{patient.email || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {formatDate(patient.dateOfBirth)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{patient.gender || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{patient.phone || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{patient.address || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Wallet Address</span>
              <span className="info-value wallet">
                {patient.walletAddress || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Medical records section: lists the patient's records with
            type, title, date, provider, hospital and verification status. */}
        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>
          {/* Records are rendered as cards; if none exist a placeholder is shown. */}
          {records.length === 0 ? (
            <div className="placeholder">No medical records found</div>
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div>
                      <div className="record-title">{record.title}</div>
                      <span className={`record-type ${record.type}`}>
                        {record.type}
                      </span>
                    </div>

                    <span
                      className={`record-status ${
                        record.status === "verified" ? "verified" : "pending"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="record-description">{record.description}</div>

                  <div className="record-meta">
                    <div className="record-meta-item">
                      🗓 {formatDate(record.date)}
                    </div>
                    <div className="record-meta-item">👨‍⚕️ {record.doctor}</div>
                    <div className="record-meta-item">🏥 {record.hospital}</div>
                    <div className="record-meta-item">
                      🔗 {record.blockchainHash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
