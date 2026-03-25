import React, { useEffect, useState } from "react";
import "../../css/viewbaptism.css";
import { generateTablePdf, generateBaptismCertificatePdf, downloadCsv } from "../../utils/pdfExport";

const SearchBap = () => {
  const [baptisms, setBaptisms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBaptisms();
  }, []);

  const fetchBaptisms = async () => {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms`);
      if (!res.ok) throw new Error("Failed to fetch baptism records");
      const data = await res.json();
      setBaptisms(data);
    } catch (err) {
      console.error("Error fetching baptisms:", err);
      alert("❌ Error loading baptism records");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      alert("Deleted successfully");
      fetchBaptisms();
    } catch {
      alert("Delete failed");
    }
  };

  /* OPEN EDIT MODAL — pre-fill all fields */
  const handleEdit = (bap) => {
    setEditData({
      _id: bap._id,
      family_number: bap.family_number || "",
      family_name: bap.family_name || "",
      hof: bap.hof || "",
      member_name: bap.member_name || "",
      isParishioner: bap.isParishioner !== false,
      gender: bap.gender || "",
      member_dob: bap.member_dob ? bap.member_dob.split("T")[0] : "",
      bapt_name: bap.bapt_name || "",
      date_of_baptism: bap.date_of_baptism ? bap.date_of_baptism.split("T")[0] : "",
      place_of_baptism: bap.place_of_baptism || "",
      church_where_baptised: bap.church_where_baptised || "",
      godparent_name: bap.godparent_name || "",
      godparent_house_name: bap.godparent_house_name || "",
      certificate_number: bap.certificate_number || "",
      home_parish: bap.home_parish || "",
      remarks: bap.remarks || "",
    });
    setEditModal(true);
  };

  /* HANDLE INPUT CHANGE IN MODAL */
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* SAVE EDIT — PUT request */
  const handleSave = async () => {
    setSaving(true);
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      alert("✅ Record updated successfully");
      setEditModal(false);
      fetchBaptisms();
    } catch {
      alert("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* SEARCH */
  const filteredBaptisms = baptisms.filter((b) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (b.member_name || "").toLowerCase().includes(s) ||
      (b.bapt_name || "").toLowerCase().includes(s) ||
      (b.family_name || "").toLowerCase().includes(s) ||
      (b.family_number || "").toLowerCase().includes(s) ||
      (b.hof || "").toLowerCase().includes(s) ||
      (b.godparent_name || "").toLowerCase().includes(s) ||
      (b.place_of_baptism || "").toLowerCase().includes(s) ||
      (b.church_where_baptised || "").toLowerCase().includes(s) ||
      (b.certificate_number || "").toLowerCase().includes(s) ||
      (b.home_parish || "").toLowerCase().includes(s) ||
      (b.isParishioner === false && "non parishioner".includes(s))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredBaptisms.length / ROWS_PER_PAGE));
  const paginatedBaptisms = filteredBaptisms.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="member-table-container1">

      {/* SEARCH */}
      <div className="container-input2">
        <input
          type="text"
          placeholder="🔍 Search by name, family, baptism name, certificate number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {/* HEADER */}
      <div className="baptism-header">
        <h2>Baptism Records ({filteredBaptisms.length})</h2>
        <div className="baptism-header-buttons">
          <button onClick={fetchBaptisms} className="submit-btn">
            🔄 Refresh
          </button>
          <button
            type="button"
            className="submit-btn"
            style={{ background: "#8b5e3c" }}
            onClick={() => {
              const columns = [
                { key: "regNo", header: "Reg.No." },
                { key: "familyNumber", header: "Family Number" },
                { key: "familyName", header: "Family Name" },
                { key: "hof", header: "Head of Family" },
                { key: "memberName", header: "Member Name" },
                { key: "status", header: "Status" },
                { key: "gender", header: "Gender" },
                { key: "dob", header: "Date of Birth" },
                { key: "age", header: "Age" },
                { key: "baptName", header: "Baptism Name" },
                { key: "baptDate", header: "Date of Baptism" },
                { key: "placeOfBaptism", header: "Place of Baptism" },
                { key: "churchWhereBaptised", header: "Church Where Baptised" },
                { key: "godparentName", header: "Godparent Name" },
                { key: "godparentHouse", header: "Godparent House" },
                { key: "certificateNumber", header: "Certificate No." },
                { key: "remarks", header: "Remarks" },
              ];
              const rows = filteredBaptisms.map((bap, index) => ({
                regNo: bap.reg_no || "-",
                familyNumber: bap.family_number,
                familyName: bap.family_name,
                hof: bap.hof,
                memberName: bap.member_name,
                status: bap.isParishioner === false ? "Non-Parishioner" : "Parishioner",
                gender: bap.gender,
                dob: formatDate(bap.member_dob),
                age: `${calculateAge(bap.member_dob)} years`,
                baptName: bap.bapt_name,
                baptDate: formatDate(bap.date_of_baptism),
                placeOfBaptism: bap.place_of_baptism || "N/A",
                churchWhereBaptised: bap.church_where_baptised || "N/A",
                godparentName: bap.godparent_name || "N/A",
                godparentHouse: bap.godparent_house_name || "N/A",
                certificateNumber: bap.certificate_number || "N/A",
                remarks: bap.remarks || "-",
              }));
              generateTablePdf({ title: "Baptism Records", columns, rows, fileName: "baptism_records.pdf" });
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
                { key: "familyNumber", header: "Family Number" },
                { key: "familyName", header: "Family Name" },
                { key: "hof", header: "Head of Family" },
                { key: "memberName", header: "Member Name" },
                { key: "status", header: "Status" },
                { key: "gender", header: "Gender" },
                { key: "dob", header: "Date of Birth" },
                { key: "age", header: "Age" },
                { key: "baptName", header: "Baptism Name" },
                { key: "baptDate", header: "Date of Baptism" },
                { key: "placeOfBaptism", header: "Place of Baptism" },
                { key: "churchWhereBaptised", header: "Church Where Baptised" },
                { key: "godparentName", header: "Godparent Name" },
                { key: "godparentHouse", header: "Godparent House" },
                { key: "certificateNumber", header: "Certificate No." },
                { key: "remarks", header: "Remarks" },
              ];
              const rows = filteredBaptisms.map((bap) => ({
                regNo: bap.reg_no || "-",
                familyNumber: bap.family_number || "-",
                familyName: bap.family_name || "-",
                hof: bap.hof || "-",
                memberName: bap.member_name,
                status: bap.isParishioner === false ? "Non-Parishioner" : "Parishioner",
                gender: bap.gender,
                dob: formatDate(bap.member_dob),
                age: `${calculateAge(bap.member_dob)} years`,
                baptName: bap.bapt_name,
                baptDate: formatDate(bap.date_of_baptism),
                placeOfBaptism: bap.place_of_baptism || "-",
                churchWhereBaptised: bap.church_where_baptised || "-",
                godparentName: bap.godparent_name || "-",
                godparentHouse: bap.godparent_house_name || "-",
                certificateNumber: bap.certificate_number || "-",
                remarks: bap.remarks || "-",
              }));
              downloadCsv({ columns, rows, fileName: "baptism_records.csv" });
            }}
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading-box">Loading baptism records...</div>
      ) : (
        <div className="table-wrapper1">
          <table className="member-table">
            <thead>
              <tr>
                <th>Reg.No.</th>
                <th>Family Number</th>
                <th>Family Name</th>
                <th>Member Name</th>
                <th>Status</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Age</th>
                <th>Baptism Name</th>
                <th>Date of Baptism</th>
                <th>Place of Baptism</th>
                <th>Certificate No.</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBaptisms.map((bap, index) => (
                <tr key={bap._id}>
                  <td>{bap.reg_no || "-"}</td>
                  <td>{bap.family_number}</td>
                  <td>{bap.family_name}</td>
                  <td>{bap.member_name}</td>
                  <td>{bap.isParishioner === false ? "Non-Parishioner" : "Parishioner"}</td>
                  <td>{bap.gender}</td>
                  <td>{formatDate(bap.member_dob)}</td>
                  <td>{calculateAge(bap.member_dob)} years</td>
                  <td>{bap.bapt_name}</td>
                  <td>{formatDate(bap.date_of_baptism)}</td>
                  <td>{bap.place_of_baptism || "N/A"}</td>
                  <td>{bap.certificate_number || "N/A"}</td>
                  <td>{bap.remarks || "-"}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(bap)} className="submit-btn" style={{ background: "#f39c12" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(bap._id)} className="submit-btn" style={{ background: "#e74c3c" }}>
                      Delete
                    </button>
                    <button onClick={() => generateBaptismCertificatePdf(bap)} className="submit-btn">
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
              <h3>✏️ Edit Baptism Record</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>

            <div className="modal-body">

              <div className="modal-section-title">Family Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Family Number</label>
                  <input name="family_number" value={editData.family_number} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Family Name</label>
                  <input name="family_name" value={editData.family_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Head of Family</label>
                  <input name="hof" value={editData.hof} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Status</label>
                  <select name="isParishioner" value={editData.isParishioner} onChange={(e) => setEditData((p) => ({ ...p, isParishioner: e.target.value === "true" }))}>
                    <option value="true">Parishioner</option>
                    <option value="false">Non-Parishioner</option>
                  </select>
                </div>
              </div>

              <div className="modal-section-title">Member Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Member Name</label>
                  <input name="member_name" value={editData.member_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Gender</label>
                  <select name="gender" value={editData.gender} onChange={handleEditChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Date of Birth</label>
                  <input type="date" name="member_dob" value={editData.member_dob} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Baptism Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Baptism Name</label>
                  <input name="bapt_name" value={editData.bapt_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Date of Baptism</label>
                  <input type="date" name="date_of_baptism" value={editData.date_of_baptism} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Place of Baptism</label>
                  <input name="place_of_baptism" value={editData.place_of_baptism} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Church Where Baptised</label>
                  <input name="church_where_baptised" value={editData.church_where_baptised} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Certificate Number</label>
                  <input name="certificate_number" value={editData.certificate_number} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Home Parish</label>
                  <input name="home_parish" value={editData.home_parish} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Godparent Info</div>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Godparent Name</label>
                  <input name="godparent_name" value={editData.godparent_name} onChange={handleEditChange} />
                </div>
                <div className="modal-field">
                  <label>Godparent House Name</label>
                  <input name="godparent_house_name" value={editData.godparent_house_name} onChange={handleEditChange} />
                </div>
              </div>

              <div className="modal-section-title">Other</div>
              <div className="modal-grid">
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

export default SearchBap;