import React, { useState, useEffect } from "react";
import "./TransactionHistory.css";
import { apiService } from "../services/apiService";

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load recent blockchain transactions (optionally filtered by wallet)
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Request recent transactions from the backend; pass the
        // connected `account` (if present) and limit (20) to scope
        // results. The response is normalized below into `txs`.
        const response = await apiService.getTransactions(account, 20);

        let txs = response.transactions || [];

        if (account) {
          txs = txs.filter(
            (tx) =>
              tx.from?.toLowerCase() === account.toLowerCase() ||
              tx.to?.toLowerCase() === account.toLowerCase()
          );
        }

        txs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setTransactions(txs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Format a timestamp to a human-readable date/time string.
  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleString() : "—";
  };

  const formatGasPrice = (wei) => (wei ? `${Number(wei) / 1e9} Gwei` : "—");

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter">
            Filtering for: {formatAddress(account)}
          </div>
        )}
      </div>

        {/* Transactions list: each card shows type, from/to addresses,
          amount/currency, status, timestamp, block & tx hash. */}
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="placeholder">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-header-info">
                <span className={`transaction-type ${tx.type}`}>
                  {tx.type.replace("_", " ")}
                </span>

                <span className={`transaction-status ${tx.status}`}>
                  {tx.status}
                </span>
              </div>

              <div className="transaction-details">
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">From</span>
                  <span className="transaction-detail-value address">
                    {formatAddress(tx.from)}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">To</span>
                  <span className="transaction-detail-value address">
                    {formatAddress(tx.to)}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Amount</span>
                  <span className="transaction-amount">
                    {tx.amount} {tx.currency}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Block</span>
                  <span className="transaction-detail-value">
                    {tx.blockNumber}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Gas Used</span>
                  <span className="transaction-detail-value">{tx.gasUsed}</span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Gas Price</span>
                  <span className="transaction-detail-value">
                    {formatGasPrice(tx.gasPrice)}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Date</span>
                  <span className="transaction-timestamp">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>

                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Tx Hash</span>
                  <span className="transaction-detail-value hash">
                    {tx.blockchainTxHash}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
