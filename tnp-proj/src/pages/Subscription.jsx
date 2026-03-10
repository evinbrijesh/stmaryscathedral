import React, { useState, useEffect } from 'react';
import "../css/subscription.css";

const Subscription = () => {
  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [newAmount, setNewAmount] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [dues, setDues] = useState(0);

  // Fetch all families
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/families`)
      .then((res) => res.json())
      .then((data) => setFamilies(data))
      .catch((err) => console.error("Error fetching families:", err));
  }, []);

  // Filter families by search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFamilies([]);
    } else {
      setFilteredFamilies(
        families.filter((fam) =>
          fam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fam.family_number.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, families]);

  // Fetch subscription history when family is selected
  useEffect(() => {
    if (selectedFamily) {
      fetchSubscriptionHistory(selectedFamily.family_number);
    }
  }, [selectedFamily]);

  const fetchSubscriptionHistory = async (familyNumber) => {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(
        `${API}/api/subscriptions/family/${familyNumber}`
      );
      const data = await res.json();
      setSubscriptionHistory(data);
      calculateDues(data);
    } catch (err) {
      console.error("Error fetching subscription history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dues (unpaid amount from previous years)
  const calculateDues = (history) => {
    const currentYear = new Date().getFullYear();
    let totalDues = 0;

    // Get last subscription amount as reference
    const paidHistory = history.filter(sub => sub.paid);
    const lastSubscription = paidHistory.length > 0 ? paidHistory[0] : null;
    const lastAmount = lastSubscription ? lastSubscription.amount : 0;

    // Get unpaid subscriptions
    const unpaidSubscriptions = history.filter(sub => !sub.paid);
    unpaidSubscriptions.forEach(sub => {
      totalDues += sub.amount;
    });

    // Check for missing years
    const allYears = history.map(sub => sub.year);
    if (lastSubscription) {
      const startYear = Math.min(...allYears);
      for (let yr = startYear; yr < currentYear; yr++) {
        if (!allYears.includes(yr)) {
          totalDues += lastAmount;
        }
      }
    }

    setDues(totalDues);
  };

  // Get last subscription amount
  const getLastAmount = () => {
    if (subscriptionHistory.length === 0) return 0;
    const paidSubs = subscriptionHistory.filter(sub => sub.paid);
    if (paidSubs.length === 0) return subscriptionHistory[0].amount;
    return paidSubs[0].amount;
  };

  // Handle family selection
  const handleFamilySelect = (family) => {
    setSelectedFamily(family);
    setSearchQuery(family.name);
    setFilteredFamilies([]);
    setNewAmount("");
    setYear(new Date().getFullYear());
  };

  // Handle subscription submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(newAmount);
    const lastAmount = getLastAmount();

    // Validation: Cannot decrease amount
    if (lastAmount > 0 && amount < lastAmount) {
      alert(`⚠️ Amount cannot be decreased! Minimum amount: ₹${lastAmount}`);
      return;
    }

    // Check if subscription already exists for this year
    const existingYear = subscriptionHistory.find(sub => sub.year === year);
    if (existingYear) {
      alert(`⚠️ Subscription for year ${year} already exists!`);
      return;
    }

    const payload = {
      family_number: selectedFamily.family_number,
      family_name: selectedFamily.name,
      hof: selectedFamily.hof,
      year: year,
      amount: amount,
      paid: true, // Default to paid when adding
      paid_date: new Date().toISOString()
    };

    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add subscription");
      }

      alert("✅ Subscription added successfully!");
      fetchSubscriptionHistory(selectedFamily.family_number);
      setNewAmount("");
      setYear(new Date().getFullYear());
    } catch (err) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Toggle paid status
  const handleTogglePaid = async (subscription) => {
    const newPaidStatus = !subscription.paid;
    const action = newPaidStatus ? "mark as paid" : "mark as unpaid";

    if (!window.confirm(`⚠️ Are you sure you want to ${action} this subscription?`)) {
      return;
    }

    try {
      const payload = {
        ...subscription,
        paid: newPaidStatus,
        paid_date: newPaidStatus ? new Date().toISOString() : subscription.paid_date
      };

      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/subscriptions/${subscription._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update subscription");

      alert(`✅ Subscription ${action} successfully!`);
      fetchSubscriptionHistory(selectedFamily.family_number);
    } catch (err) {
      console.error(err);
      alert("❌ Error updating subscription");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Generate year options (last 10 years and next 2 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years.reverse();
  };

  return (
    <div className="subscription-container">
      <h1 className="subscription-main-title">Annual Church Subscription</h1>

      {/* Search Family */}
      <div className="subscription-search-section">
        <div className="subscription-search-wrapper">
          <input
            type="text"
            placeholder="Search family by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="subscription-search-input"
          />
          <svg fill="#000000" width="20px" height="20px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
            <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fillRule="evenodd"></path>
          </svg>
        </div>

        {filteredFamilies.length > 0 && (
          <ul className="subscription-suggestions">
            {filteredFamilies.map((fam) => (
              <li
                key={fam._id}
                onClick={() => handleFamilySelect(fam)}
                className="subscription-suggestion-item"
              >
                <strong>{fam.name}</strong>
                <span>({fam.family_number})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Family Info */}
      {selectedFamily && (
        <div className="subscription-family-info">
          <h2>Family Details</h2>
          <div className="family-info-grid">
            <div className="info-item">
              <strong>Family Name:</strong> {selectedFamily.name}
            </div>
            <div className="info-item">
              <strong>Family Number:</strong> {selectedFamily.family_number}
            </div>
            <div className="info-item">
              <strong>Head of Family:</strong> {selectedFamily.hof}
            </div>
            {dues > 0 && (
              <div className="info-item dues-highlight">
                <strong>Outstanding Dues:</strong> {formatCurrency(dues)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Subscription Form */}
      {selectedFamily && (
        <div className="subscription-form-section">
          <h2>Add New Subscription</h2>
          <form onSubmit={handleSubmit} className="subscription-form">
            <div className="form-row">
              <div className="form-group">
                <label>Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  required
                  className="form-select"
                >
                  {getYearOptions().map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Amount (₹) *
                  {getLastAmount() > 0 && (
                    <span className="min-amount-hint">
                      Min: ₹{getLastAmount()}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={getLastAmount() || 0}
                  step="1"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="submit-btn">
                Add Subscription
              </button>
            </div>

            {getLastAmount() > 0 && (
              <div className="amount-info">
                ℹ️ Last subscription amount: {formatCurrency(getLastAmount())}
                <br />
                <small>Amount cannot be decreased from previous year</small>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Subscription History */}
      {selectedFamily && (
        <div className="subscription-history-section">
          <h2>Subscription History</h2>
          {loading ? (
            <div className="loading">Loading history...</div>
          ) : subscriptionHistory.length > 0 ? (
            <div className="history-table-wrapper">
              <table className="subscription-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Receipt No.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map((sub) => (
                    <tr key={sub._id} className={!sub.paid ? 'unpaid-row' : ''}>
                      <td>{sub.year}</td>
                      <td className="amount-cell">{formatCurrency(sub.amount)}</td>
                      <td>
                        <span className={`status-badge ${sub.paid ? 'status-paid' : 'status-unpaid'}`}>
                          {sub.paid ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                      </td>
                      <td>{sub.paid ? formatDate(sub.paid_date) : 'N/A'}</td>
                      <td>{sub.receipt_number || "N/A"}</td>
                      <td>
                        <button
                          onClick={() => handleTogglePaid(sub)}
                          className={sub.paid ? "unpaid-btn" : "paid-btn"}
                          title={sub.paid ? "Mark as Unpaid" : "Mark as Paid"}
                        >
                          {sub.paid ? '❌' : '✓'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td><strong>Total Paid:</strong></td>
                    <td className="amount-cell">
                      <strong>
                        {formatCurrency(
                          subscriptionHistory
                            .filter(sub => sub.paid)
                            .reduce((sum, sub) => sum + sub.amount, 0)
                        )}
                      </strong>
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  {subscriptionHistory.filter(sub => !sub.paid).length > 0 && (
                    <tr className="unpaid-total-row">
                      <td><strong>Total Unpaid:</strong></td>
                      <td className="amount-cell unpaid-amount">
                        <strong>
                          {formatCurrency(
                            subscriptionHistory
                              .filter(sub => !sub.paid)
                              .reduce((sum, sub) => sum + sub.amount, 0)
                          )}
                        </strong>
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="no-history">
              No subscription history found for this family.
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedFamily && (
        <div className="subscription-instructions">
          <h3>📋 Instructions</h3>
          <ul>
            <li>Search and select a family to manage their annual subscription</li>
            <li>Annual subscription is a yearly donation to the church</li>
            <li>The amount cannot be decreased from the previous year</li>
            <li>Mark subscriptions as paid or unpaid using the status toggle</li>
            <li>Outstanding dues will be displayed if there are any unpaid years</li>
            <li>All payment history is maintained for reference</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Subscription;