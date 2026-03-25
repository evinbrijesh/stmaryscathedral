import React, { useState, useEffect } from 'react';
import "../../css/viewmarriage.css";
import { generateTablePdf, generateMarriageCertificatePdf, downloadCsv } from "../../utils/pdfExport";

const ViewMarriage = () => {
  const [marriages, setMarriages] = useState([]);
  const [filteredMarriages, setFilteredMarriages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMarriage, setSelectedMarriage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalMarriages: 0, marriagesThisYear: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchMarriages();
    fetchStats();
  }, []);

  const fetchMarriages = async () => {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/marriages`);
      const data = await res.json();
      setMarriages(data);
      setFilteredMarriages(data);
    } catch (err) {
      console.error("Error fetching marriages:", err);
      alert("❌ Error loading marriages");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/marriages/stats/overview`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  /* SEARCH + YEAR FILTER */
  useEffect(() => {
    let filtered = marriages;
    if (searchQuery.trim()) {
      filtered = filtered.filter((m) =>
        (m.spouse1_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.spouse2_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.reg_no || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterYear) {
      filtered = filtered.filter((m) =>
        new Date(m.date).getFullYear().toString() === filterYear
      );
    }
    setFilteredMarriages(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterYear, marriages]);

  const totalPages = Math.max(1, Math.ceil(filteredMarriages.length / ROWS_PER_PAGE));
  const paginatedMarriages = filteredMarriages.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const getYears = () => {
    const years = marriages.map((m) => new Date(m.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  /* VIEW */
  const handleView = (marriage) => {
    setSelectedMarriage(marriage);
    setEditMode(false);
    setShowModal(true);
  };

  /* OPEN EDIT MODAL */
  const handleEdit = (marriage) => {
    setSelectedMarriage(marriage);
    setEditData({
      date: marriage.date ? marriage.date.split("T")[0] : "",
      place: marriage.place || "",
      solemnized_by: marriage.solemnized_by || "",
      spouse1_name: marriage.spouse1_name || "",
      spouse2_name: marriage.spouse2_name || "",
      spouse1_isParishioner: marriage.spouse1_isParishioner !== false,
      spouse2_isParishioner: marriage.spouse2_isParishioner !== false,
      remarks: marriage.remarks || "",
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  /* SAVE */
  const handleSave = async () => {
    setSaving(true);
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/marriages/${selectedMarriage._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      alert("✅ Marriage updated successfully!");
      closeModal();
      fetchMarriages();
    } catch {
      alert("❌ Error updating marriage");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this marriage record?")) return;
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/marriages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      alert("✅ Marriage deleted successfully!");
      fetchMarriages();
      fetchStats();
    } catch {
      alert("❌ Error deleting marriage");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedMarriage(null);
    setEditData({});
  };

  return (
    <div className="view-marriage-container">

      {/* SEARCH */}
      <div className="marriage-search">
        <input
          type="text"
          placeholder="🔍 Search by name or reg no..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
        />
      </div>

      {/* HEADER */}
      <div className="marriage-header">
        <h2>Marriage Records ({filteredMarriages.length})</h2>

        {/* Stats */}
        <div className="marriage-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalMarriages}</div>
            <div className="stat-label">Total Marriages</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.marriagesThisYear}</div>
            <div className="stat-label">This Year</div>
          </div>
        </div>

        {/* Buttons + year filter */}
        <div className="marriage-header-buttons">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="marriage-year-select"
          >
            <option value="">All Years</option>
            {getYears().map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={() => { setSearchQuery(""); setFilterYear(""); }}
            className="submit-btn"
          >
            Clear Filters
          </button>

          <button onClick={fetchMarriages} className="submit-btn">
            🔄 Refresh
          </button>

          <button
            type="button"
            className="submit-btn"
            style={{ background: "#8b5e3c" }}
            onClick={() => {
              const columns = [
                { key: "regNo", header: "Reg.No." },
                { key: "groom", header: "Groom" },
                { key: "groomStatus", header: "Groom Status" },
                { key: "bride", header: "Bride" },
                { key: "brideStatus", header: "Bride Status" },
                { key: "date", header: "Date" },
                { key: "place", header: "Place" },
              ];
              const rows = filteredMarriages.map((m) => ({
                regNo: m.reg_no || "-",
                groom: m.spouse1_name,
                groomStatus: m.spouse1_isParishioner !== false ? "Parishioner" : "Non-Parishioner",
                bride: m.spouse2_name,
                brideStatus: m.spouse2_isParishioner !== false ? "Parishioner" : "Non-Parishioner",
                date: formatDate(m.date),
                place: m.place || "N/A",
              }));
              generateTablePdf({ title: "Marriage Records", columns, rows, fileName: "marriage_records.pdf" });
            }}
          >
            Download PDF
          </button>

          <button
            type="button"
            className="submit-btn"
            style={{ background: "#2e7d32" }}
            onClick={() => {
              const columns = [
                { key: "regNo", header: "Reg.No." },
                { key: "groom", header: "Groom" },
                { key: "groomStatus", header: "Groom Status" },
                { key: "bride", header: "Bride" },
                { key: "brideStatus", header: "Bride Status" },
                { key: "date", header: "Date" },
                { key: "place", header: "Place" },
                { key: "solemnizedBy", header: "Solemnized By" },
              ];
              const rows = filteredMarriages.map((m) => ({
                regNo: m.reg_no || "-",
                groom: m.spouse1_name,
                groomStatus: m.spouse1_isParishioner !== false ? "Parishioner" : "Non-Parishioner",
                bride: m.spouse2_name,
                brideStatus: m.spouse2_isParishioner !== false ? "Parishioner" : "Non-Parishioner",
                date: formatDate(m.date),
                place: m.place || "-",
                solemnizedBy: m.solemnized_by || "-",
              }));
              downloadCsv({ columns, rows, fileName: "marriage_records.csv" });
            }}
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading-box">Loading marriage records...</div>
      ) : (
        <div className="table-wrapper1">
          <table className="view-marriage-table">
            <thead>
              <tr>
                <th>Reg.No.</th>
                <th>Groom</th>
                <th>Bride</th>
                <th>Date</th>
                <th>Place</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMarriages.length > 0 ? (
                paginatedMarriages.map((marriage, index) => (
                  <tr key={marriage._id}>
                    <td>{marriage.reg_no || "-"}</td>
                    <td>
                      {marriage.spouse1_name}
                      <small>{marriage.spouse1_isParishioner !== false ? "Parishioner" : "Non-Parishioner"}</small>
                    </td>
                    <td>
                      {marriage.spouse2_name}
                      <small>{marriage.spouse2_isParishioner !== false ? "Parishioner" : "Non-Parishioner"}</small>
                    </td>
                    <td>{formatDate(marriage.date)}</td>
                    <td>{marriage.place || "N/A"}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleView(marriage)}
                        className="submit-btn"
                        style={{ background: "#4caf50" }}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleEdit(marriage)}
                        className="submit-btn"
                        style={{ background: "#f39c12" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(marriage._id)}
                        className="submit-btn"
                        style={{ background: "#e74c3c" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => generateMarriageCertificatePdf(marriage)}
                        className="submit-btn"
                      >
                        Certificate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {searchQuery || filterYear
                      ? "No marriages found matching your criteria"
                      : "No marriage records available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
      </div>
      {/* MODAL — VIEW / EDIT */}
      {showModal && selectedMarriage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>{editMode ? "✏️ Edit Marriage Record" : "👁️ View Marriage Record"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {editMode ? (
                /* ── EDIT ── */
                <>
                  <div className="modal-section-title">Couple Information</div>
                  <div className="modal-grid">
                    <div className="modal-field">
                      <label>Groom Name</label>
                      <input name="spouse1_name" value={editData.spouse1_name} onChange={handleEditChange} />
                    </div>
                    <div className="modal-field">
                      <label>Groom Status</label>
                      <select
                        name="spouse1_isParishioner"
                        value={editData.spouse1_isParishioner}
                        onChange={(e) => setEditData((p) => ({ ...p, spouse1_isParishioner: e.target.value === "true" }))}
                      >
                        <option value="true">Parishioner</option>
                        <option value="false">Non-Parishioner</option>
                      </select>
                    </div>
                    <div className="modal-field">
                      <label>Bride Name</label>
                      <input name="spouse2_name" value={editData.spouse2_name} onChange={handleEditChange} />
                    </div>
                    <div className="modal-field">
                      <label>Bride Status</label>
                      <select
                        name="spouse2_isParishioner"
                        value={editData.spouse2_isParishioner}
                        onChange={(e) => setEditData((p) => ({ ...p, spouse2_isParishioner: e.target.value === "true" }))}
                      >
                        <option value="true">Parishioner</option>
                        <option value="false">Non-Parishioner</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-section-title">Marriage Details</div>
                  <div className="modal-grid">
                    <div className="modal-field">
                      <label>Date of Marriage</label>
                      <input type="date" name="date" value={editData.date} onChange={handleEditChange} />
                    </div>
                    <div className="modal-field">
                      <label>Place of Marriage</label>
                      <input name="place" value={editData.place} onChange={handleEditChange} />
                    </div>
                    <div className="modal-field">
                      <label>Solemnized By</label>
                      <input name="solemnized_by" value={editData.solemnized_by} onChange={handleEditChange} />
                    </div>
                  </div>

                  <div className="modal-section-title">Other</div>
                  <div className="modal-grid">
                    <div className="modal-field modal-field-full">
                      <label>Remarks</label>
                      <textarea name="remarks" value={editData.remarks} onChange={handleEditChange} rows={3} />
                    </div>
                  </div>
                </>
              ) : (
                /* ── VIEW ── */
                <>
                  <div className="modal-section-title">Marriage Information</div>
                  <div className="modal-info-row"><strong>Reg.No.:</strong> {selectedMarriage.reg_no || "N/A"}</div>
                  <div className="modal-info-row"><strong>Date of Marriage:</strong> {formatDate(selectedMarriage.date)}</div>
                  <div className="modal-info-row"><strong>Place of Marriage:</strong> {selectedMarriage.place || "N/A"}</div>
                  <div className="modal-info-row"><strong>Solemnized By:</strong> {selectedMarriage.solemnized_by || "N/A"}</div>

                  <div className="modal-section-title">Couple Information</div>
                  <div className="modal-couple-grid">
                    <div className="spouse-card">
                      <h4>Groom</h4>
                      <p><strong>Name:</strong> {selectedMarriage.spouse1_name}</p>
                      <p><strong>Status:</strong> {selectedMarriage.spouse1_isParishioner !== false ? "Parishioner" : "Non-Parishioner"}</p>
                      {selectedMarriage.spouse1_id?.phone && <p><strong>Phone:</strong> {selectedMarriage.spouse1_id.phone}</p>}
                      {selectedMarriage.spouse1_id?.family_number && <p><strong>Family:</strong> {selectedMarriage.spouse1_id.family_number}</p>}
                    </div>
                    <div className="spouse-card">
                      <h4>Bride</h4>
                      <p><strong>Name:</strong> {selectedMarriage.spouse2_name}</p>
                      <p><strong>Status:</strong> {selectedMarriage.spouse2_isParishioner !== false ? "Parishioner" : "Non-Parishioner"}</p>
                      {selectedMarriage.spouse2_id?.phone && <p><strong>Phone:</strong> {selectedMarriage.spouse2_id.phone}</p>}
                      {selectedMarriage.spouse2_id?.family_number && <p><strong>Family:</strong> {selectedMarriage.spouse2_id.family_number}</p>}
                    </div>
                  </div>

                  <div className="modal-section-title">Record Info</div>
                  <div className="modal-info-row"><strong>Created:</strong> {formatDate(selectedMarriage.createdAt)}</div>
                  <div className="modal-info-row"><strong>Last Updated:</strong> {formatDate(selectedMarriage.updatedAt)}</div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="submit-btn" style={{ background: "#aaa" }} onClick={closeModal}>
                Cancel
              </button>
              {editMode && (
                <button className="submit-btn" style={{ background: "#4caf50" }} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              )}
              {!editMode && (
                <button className="submit-btn" style={{ background: "#f39c12" }} onClick={() => setEditMode(true)}>
                  ✏️ Edit
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ViewMarriage;