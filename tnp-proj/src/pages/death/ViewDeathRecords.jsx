import React, { useEffect, useState } from "react";
import "../../css/viewdeath.css";
import { generateTablePdf, generateDeathCertificatePdf, downloadCsv } from "../../utils/pdfExport";

const ViewDeathRecords = () => {

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/deaths`);
      if (!res.ok) throw new Error("Failed to fetch death records");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/deaths/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      alert("Deleted successfully");
      fetchRecords();
    } catch {
      alert("Delete failed");
    }
  };

  /* OPEN EDIT MODAL — pre-fill all fields */
  const handleEdit = (rec) => {
    setEditData({
      _id: rec._id,
      isParishioner: rec.isParishioner !== false,
      family_no: rec.family_no || "",
      block: rec.block || "",
      unit: rec.unit || "",
      name: rec.name || "",
      house_name: rec.house_name || "",
      address_place: rec.address_place || "",
      father_husband_name: rec.father_husband_name || "",
      mother_wife_name: rec.mother_wife_name || "",
      death_date: rec.death_date ? rec.death_date.split("T")[0] : "",
      burial_date: rec.burial_date ? rec.burial_date.split("T")[0] : "",
      age: rec.age || "",
      conducted_by: rec.conducted_by || "",
      cause_of_death: rec.cause_of_death || "",
      cell_no: rec.cell_no || "",
      remarks: rec.remarks || "",
    });
    setEditModal(true);
  };

  /* HANDLE INPUT CHANGE IN MODAL */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  /* SAVE — PUT request */
  const handleSave = async () => {
    setSaving(true);
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/deaths/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      alert("✅ Record updated successfully");
      setEditModal(false);
      fetchRecords();
    } catch {
      alert("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* SEARCH */
  const filteredRecords = records.filter((rec, index) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const statusText = rec.isParishioner === false ? "non-parishioner" : "parishioner";
    const slNoText = (index + 1).toString();

    return (
      rec.name?.toLowerCase().includes(s) ||
      rec.house_name?.toLowerCase().includes(s) ||
      rec.family_no?.toString().includes(s) ||
      rec.address_place?.toLowerCase().includes(s) ||
      rec.father_husband_name?.toLowerCase().includes(s) ||
      rec.mother_wife_name?.toLowerCase().includes(s) ||
      rec.cause_of_death?.toLowerCase().includes(s) ||
      rec.conducted_by?.toLowerCase().includes(s) ||
      statusText.includes(s) ||
      slNoText.includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ROWS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="death-container">

      {/* SEARCH */}
      <div className="container-input2">
        <input
          type="text"
          placeholder="🔍 Search by name, family no, parishioner, cause..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {/* HEADER */}
      <div className="death-header">
        <h2>Death Records ({filteredRecords.length})</h2>
        <div className="death-header-buttons">
          <button
            onClick={fetchRecords}
            className="submit-btn"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ee0979)" }}
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            className="submit-btn"
            style={{ background: "#8b5e3c" }}
            onClick={() => {
              const columns = [
                { key: "regNo", header: "Reg.No." },
                { key: "status", header: "Status" },
                { key: "familyNo", header: "Family No" },
                { key: "block", header: "Block" },
                { key: "unit", header: "Unit" },
                { key: "name", header: "Name" },
                { key: "houseName", header: "House Name" },
                { key: "addressPlace", header: "Address/Place" },
                { key: "fatherHusbandName", header: "Father/Husband Name" },
                { key: "motherWifeName", header: "Mother/Wife Name" },
                { key: "deathDate", header: "Death Date" },
                { key: "burialDate", header: "Burial Date" },
                { key: "age", header: "Age" },
                { key: "conductedBy", header: "Conducted by" },
                { key: "causeOfDeath", header: "Cause of Death" },
                { key: "cellNo", header: "Cell No" },
                { key: "remarks", header: "Remarks" },
              ];
              const rows = filteredRecords.map((rec, index) => ({
                regNo: rec.reg_no || "-",
                status: rec.isParishioner === false ? "Non-Parishioner" : "Parishioner",
                familyNo: rec.family_no || "-",
                block: rec.block || "-",
                unit: rec.unit || "-",
                name: rec.name,
                houseName: rec.house_name || "-",
                addressPlace: rec.address_place || "-",
                fatherHusbandName: rec.father_husband_name || "-",
                motherWifeName: rec.mother_wife_name || "-",
                deathDate: rec.death_date ? new Date(rec.death_date).toLocaleDateString("en-IN") : "-",
                burialDate: rec.burial_date ? new Date(rec.burial_date).toLocaleDateString("en-IN") : "-",
                age: rec.age || "-",
                conductedBy: rec.conducted_by || "-",
                causeOfDeath: rec.cause_of_death || "-",
                cellNo: rec.cell_no || "-",
                remarks: rec.remarks || "-",
              }));
              generateTablePdf({ title: "Death Records", columns, rows, fileName: "death_records.pdf" });
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
                { key: "status", header: "Status" },
                { key: "familyNo", header: "Family No" },
                { key: "block", header: "Block" },
                { key: "unit", header: "Unit" },
                { key: "name", header: "Name" },
                { key: "houseName", header: "House Name" },
                { key: "addressPlace", header: "Address/Place" },
                { key: "fatherHusbandName", header: "Father/Husband Name" },
                { key: "motherWifeName", header: "Mother/Wife Name" },
                { key: "deathDate", header: "Death Date" },
                { key: "burialDate", header: "Burial Date" },
                { key: "age", header: "Age" },
                { key: "conductedBy", header: "Conducted by" },
                { key: "causeOfDeath", header: "Cause of Death" },
                { key: "cellNo", header: "Cell No" },
                { key: "remarks", header: "Remarks" },
              ];
              const rows = filteredRecords.map((rec) => ({
                regNo: rec.reg_no || "-",
                status: rec.isParishioner === false ? "Non-Parishioner" : "Parishioner",
                familyNo: rec.family_no || "-",
                block: rec.block || "-",
                unit: rec.unit || "-",
                name: rec.name,
                houseName: rec.house_name || "-",
                addressPlace: rec.address_place || "-",
                fatherHusbandName: rec.father_husband_name || "-",
                motherWifeName: rec.mother_wife_name || "-",
                deathDate: rec.death_date ? new Date(rec.death_date).toLocaleDateString("en-IN") : "-",
                burialDate: rec.burial_date ? new Date(rec.burial_date).toLocaleDateString("en-IN") : "-",
                age: rec.age || "-",
                conductedBy: rec.conducted_by || "-",
                causeOfDeath: rec.cause_of_death || "-",
                cellNo: rec.cell_no || "-",
                remarks: rec.remarks || "-",
              }));
              downloadCsv({ columns, rows, fileName: "death_records.csv" });
            }}
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading-box">Loading death records...</div>
      ) : (
        <div className="table-wrapper1">
          <table className="death-table">
            <thead>
              <tr>
                <th>Reg.No.</th>
                <th>Status</th>
                <th>Family No</th>
                <th>Block</th>
                <th>Unit</th>
                <th>Name</th>
                <th>House Name</th>
                <th>Address/Place</th>
                <th>Father/Husband</th>
                <th>Mother/Wife</th>
                <th>Death Date</th>
                <th>Burial Date</th>
                <th>Age</th>
                <th>Conducted by</th>
                <th>Cause</th>
                <th>Cell No</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((rec, index) => (
                <tr key={rec._id}>
                  <td>{rec.reg_no || "-"}</td>
                  <td>
                    <span className={`status-badge ${rec.isParishioner === false ? 'non-parishioner' : 'parishioner'}`}>
                      {rec.isParishioner === false ? "Non-Parishioner" : "Parishioner"}
                    </span>
                  </td>
                  <td>{rec.family_no}</td>
                  <td>{rec.block}</td>
                  <td>{rec.unit}</td>
                  <td>{rec.name}</td>
                  <td>{rec.house_name}</td>
                  <td>{rec.address_place}</td>
                  <td>{rec.father_husband_name}</td>
                  <td>{rec.mother_wife_name}</td>
                  <td>{rec.death_date ? new Date(rec.death_date).toLocaleDateString("en-IN") : "-"}</td>
                  <td>{rec.burial_date ? new Date(rec.burial_date).toLocaleDateString("en-IN") : "-"}</td>
                  <td>{rec.age}</td>
                  <td>{rec.conducted_by}</td>
                  <td>{rec.cause_of_death}</td>
                  <td>{rec.cell_no}</td>
                  <td>{rec.remarks}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(rec)} className="submit-btn" style={{ background: "#f39c12" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(rec._id)} className="submit-btn" style={{ background: "#e74c3c" }}>
                      Delete
                    </button>
                    <button onClick={() => generateDeathCertificatePdf(rec)} className="submit-btn">
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* EDIT MODAL */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>✏️ Edit Death Record</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>

            <div className="modal-body">

              <div className="modal-section-title">General Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Status</label>
                  <select
                    name="isParishioner"
                    value={editData.isParishioner}
                    onChange={(e) => setEditData((p) => ({ ...p, isParishioner: e.target.value === "true" }))}
                  >
                    <option value="true">Parishioner</option>
                    <option value="false">Non-Parishioner</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Family No</label>
                  <input name="family_no" value={editData.family_no} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Block</label>
                  <input name="block" value={editData.block} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Unit</label>
                  <input name="unit" value={editData.unit} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Name</label>
                  <input name="name" value={editData.name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>House Name</label>
                  <input name="house_name" value={editData.house_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Address / Place</label>
                  <input name="address_place" value={editData.address_place} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Family Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Father / Husband Name</label>
                  <input name="father_husband_name" value={editData.father_husband_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Mother / Wife Name</label>
                  <input name="mother_wife_name" value={editData.mother_wife_name} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Death & Burial</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Death Date</label>
                  <input type="date" name="death_date" value={editData.death_date} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Burial Date</label>
                  <input type="date" name="burial_date" value={editData.burial_date} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Age</label>
                  <input name="age" value={editData.age} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Conducted By</label>
                  <input name="conducted_by" value={editData.conducted_by} onChange={handleEditChange} />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Cause of Death</label>
                  <input name="cause_of_death" value={editData.cause_of_death} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Other</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Cell No</label>
                  <input name="cell_no" value={editData.cell_no} onChange={handleEditChange} />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Remarks</label>
                  <textarea name="remarks" value={editData.remarks} onChange={handleEditChange} rows={3} />
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="submit-btn" style={{ background: "#aaa" }} onClick={() => setEditModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" style={{ background: "#4caf50" }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ViewDeathRecords;