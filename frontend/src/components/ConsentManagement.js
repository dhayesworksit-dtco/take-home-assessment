import React, { useState, useEffect } from "react";
import "./ConsentManagement.css";
import { apiService } from "../services/apiService";
import { useWeb3 } from "../hooks/useWeb3";

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    purpose: "",
  });

  // TODO: Implement fetchConsents function
  const fetchConsents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch consents from the backend using the currently selected
      // status filter. When `filterStatus` is "all" we pass `null`
      // so the service returns all consents regardless of status.
      const status = filterStatus === "all" ? null : filterStatus;
      const data = await apiService.getConsents(null, status);

      // Ensure we only set an array of consents. Some API responses may
      // return null or an object without a `consents` array — guard against
      // that by falling back to an empty array to avoid runtime/render errors.
      setConsents(Array.isArray(data?.consents) ? data.consents : []);
    } catch (err) {
      setError(err.message || "Failed to fetch consents");
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchConsents();
  }, [filterStatus]);

  // Create a new consent by signing a readable consent message with
  // the user's wallet, verifying the signature server-side, submitting
  // the consent payload to the API, and refreshing the list on success.
  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Build and sign a human-readable consent message, verify the
      // signature via the API, then create the consent and refresh UI.
      const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;
      const signature = await signMessage(message);

      const consentPayload = {
        patientId: formData.patientId,
        purpose: formData.purpose,
        walletAddress: account,
        signature,
      };

      const verification = await apiService.verifySignature(
        message,
        signature,
        account
      );

      if (!verification.valid) {
        alert("Signature verification failed. Cannot create consent.");
        return;
      }
      await apiService.createConsent(consentPayload);
      setFormData({ patientId: "", purpose: "" });
      setShowCreateForm(false);
      fetchConsents();
    } catch (err) {
      alert("Failed to create consent: " + err.message);
    }
  };

  // Update a consent's status (for example: pending -> active).
  // Calls the API to update the record and refreshes the local list
  // so the UI reflects the latest status.
  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      // Update status via API and refresh the consents list.
      await apiService.updateConsent(consentId, { status: newStatus });

      fetchConsents();
    } catch (err) {
      alert("Failed to update consent: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? "Cancel" : "Create New Consent"}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">
                  Research Study Participation
                </option>
                <option value="Data Sharing with Research Institution">
                  Data Sharing with Research Institution
                </option>
                <option value="Third-Party Analytics Access">
                  Third-Party Analytics Access
                </option>
                <option value="Insurance Provider Access">
                  Insurance Provider Access
                </option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === "all" ? "active" : ""}
          onClick={() => setFilterStatus("all")}
        >
          All
        </button>
        <button
          className={filterStatus === "active" ? "active" : ""}
          onClick={() => setFilterStatus("active")}
        >
          Active
        </button>
        <button
          className={filterStatus === "pending" ? "active" : ""}
          onClick={() => setFilterStatus("pending")}
        >
          Pending
        </button>
      </div>

      {/* Render list of consents as cards. Each card shows patient ID,
          purpose, status, creation time, optional blockchain tx hash,
          and provides actions (e.g., activate) when applicable. */}
      <div className="consents-list">
        {consents.length === 0 ? (
          <div className="placeholder">No consents found</div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-header-info">
                <div className="consent-purpose">{consent.purpose}</div>
                <span className={`consent-status ${consent.status}`}>
                  {consent.status}
                </span>
              </div>

              <div className="consent-details">
                <div className="consent-detail-item">
                  <strong>Patient ID:</strong> {consent.patientId}
                </div>

                <div className="consent-detail-item">
                  <strong>Wallet:</strong>
                  <span className="consent-wallet">
                    {consent.walletAddress}
                  </span>
                </div>

                <div className="consent-detail-item">
                  <strong>Created:</strong>{" "}
                  {new Date(consent.createdAt).toLocaleString()}
                </div>

                {consent.blockchainTxHash && (
                  <div className="consent-detail-item">
                    <strong>Tx Hash:</strong>
                    <span className="consent-tx-hash">
                      {consent.blockchainTxHash}
                    </span>
                  </div>
                )}
              </div>

              {consent.status === "pending" && (
                <div className="consent-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleUpdateStatus(consent.id, "active")}
                  >
                    Activate Consent
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
