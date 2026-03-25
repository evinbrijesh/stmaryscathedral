// src/pages/memberdetails/ViewMembers.jsx
import React, { useEffect, useState } from "react";
import "../../css/viewmembers.css";
import { getMembers, getFamilies } from "../../api";
import { generateTablePdf, downloadCsv } from "../../utils/pdfExport";

const wardStructure = {
  "Block 1": [
    { number: "1", name: "Morth Smuni" },
    { number: "2", name: "Mar Athanasious" },
    { number: "3", name: "St. Philips" },
  ],
  "Block 2": [
    { number: "1", name: "Mar Basil" },
    { number: "2", name: "Mar Gabriel" },
    { number: "3", name: "St. Joseph" },
    { number: "4", name: "St. Andrews" },
    { number: "5", name: "Mar Gregorious" },
    { number: "6", name: "St. Thomas" },
  ],
  "Block 3": [
    { number: "1", name: "St. Paul" },
    { number: "2", name: "Mar Aprem" },
    { number: "3", name: "St. James" },
  ],
  "Block 4": [
    { number: "1", name: "St. Johns" },
    { number: "2", name: "Mar Micheal" },
    { number: "3", name: "Mar Bahanam" },
  ],
  "Block 5": [
    { number: "1", name: "St. George" },
    { number: "2", name: "Morth Uluthy" },
    { number: "3", name: "Mar Kauma" },
    { number: "4", name: "Mar Alias" },
    { number: "5", name: "Mar Ignatious" },
    { number: "6", name: "St. Peters" },
  ],
  "Block 6": [
    { number: "1", name: "Mar Severios" },
    { number: "2", name: "Mar Yacob Burdhana" },
    { number: "3", name: "Mar Semavoon" },
    { number: "4", name: "Mar Ahathulla" },
    { number: "5", name: "St. Mathews" },
    { number: "6", name: "Mar Julius" },
  ],
};

const ViewMembers = () => {
  const [members, setMembers] = useState([]);
  const [familyMap, setFamilyMap] = useState({});
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    let mounted = true;

    // Fetch members
    getMembers()
      .then((res) => {
        if (!mounted) return;
        setMembers(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setError("Could not load members");
      });

    // Fetch families to get block/unit info
    getFamilies()
      .then((res) => {
        if (!mounted) return;
        const families = res.data || [];
        const map = {};
        families.forEach((fam) => {
          if (fam.family_number) {
            map[fam.family_number] = {
              ward_number: fam.ward_number || "",
              family_unit: fam.family_unit || "",
            };
          }
        });
        setFamilyMap(map);
      })
      .catch((err) => console.error("Error fetching families:", err));

    return () => { mounted = false; };
  }, []);

  // Available units for the selected block
  const availableUnits = filterBlock ? (wardStructure[filterBlock] || []) : [];

  // Reset unit when block changes
  useEffect(() => { setFilterUnit(""); }, [filterBlock]);

  // Filter logic — look up block/unit from the familyMap using member's family_number
  const filteredMembers = members.filter((m) => {
    // Name search
    if (search && !(m.name || "").toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Block / Unit filter — get from the family lookup
    if (filterBlock || filterUnit) {
      const famInfo = familyMap[m.family_number] || {};
      if (filterBlock && famInfo.ward_number !== filterBlock) {
        return false;
      }
      if (filterUnit && famInfo.family_unit !== filterUnit) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ROWS_PER_PAGE));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Reset to page 1 when any filter changes
  useEffect(() => { setCurrentPage(1); }, [search, filterBlock, filterUnit]);

  return (
    <>
      {/* ── Search + Block / Unit filters ── */}
      <div className="container-input2" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ flex: "1 1 200px" }}
        />
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="input"
          style={{ flex: "0 0 150px", padding: "10px" }}
        >
          <option value="">All Blocks</option>
          {Object.keys(wardStructure).map((block) => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="input"
          style={{ flex: "0 0 220px", padding: "10px" }}
          disabled={!filterBlock}
        >
          <option value="">All Units</option>
          {availableUnits.map((unit) => (
            <option key={unit.number} value={unit.number}>
              Unit {unit.number} – {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div className="member-table-container1">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2>Members ({filteredMembers.length})</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                const columns = [
                  { key: "slNo", header: "Sl No" },
                  { key: "name", header: "Name" },
                  { key: "gender", header: "Gender" },
                  { key: "relation", header: "Relation" },
                  { key: "dob", header: "DOB" },
                  { key: "age", header: "Age" },
                  { key: "occupation", header: "Occupation" },
                  { key: "phone", header: "Phone" },
                  { key: "email", header: "Email" },
                  { key: "bloodGroup", header: "Blood Group" },
                  { key: "aadhaar", header: "Aadhaar" },
                  { key: "familyNumber", header: "Family No" },
                  { key: "hof", header: "HoF" },
                  { key: "baptism", header: "Baptism" },
                ];
                const rows = filteredMembers.map((member, index) => ({
                  slNo: index + 1,
                  name: member.name || `${member.firstName || ""} ${member.lastName || ""}`,
                  gender: member.gender || "",
                  relation: member.relation || "",
                  dob: member.dob ? new Date(member.dob).toLocaleDateString() : "",
                  age: member.age || "",
                  occupation: member.occupation || "",
                  phone: member.phone || "",
                  email: member.email || "",
                  bloodGroup: member.blood_group || "",
                  aadhaar: member.aadhaar || "",
                  familyNumber: member.family_number || member.familyNo || "",
                  hof: member.hof || member.isHof ? "Yes" : "No",
                  baptism: member.baptism ? "Yes" : "No",
                }));
                generateTablePdf({ title: "Members List", columns, rows, fileName: "members.pdf" });
              }}
              className="submit-btn"
            >
              Download PDF
            </button>

            <button
              type="button"
              className="submit-btn"
              style={{ background: "#2e7d32" }}
              onClick={() => {
                const columns = [
                  { key: "slNo", header: "Sl No" },
                  { key: "name", header: "Name" },
                  { key: "gender", header: "Gender" },
                  { key: "relation", header: "Relation" },
                  { key: "dob", header: "DOB" },
                  { key: "age", header: "Age" },
                  { key: "occupation", header: "Occupation" },
                  { key: "phone", header: "Phone" },
                  { key: "email", header: "Email" },
                  { key: "bloodGroup", header: "Blood Group" },
                  { key: "aadhaar", header: "Aadhaar" },
                  { key: "familyNumber", header: "Family No" },
                  { key: "hof", header: "HoF" },
                  { key: "baptism", header: "Baptism" },
                ];
                const rows = filteredMembers.map((member, index) => ({
                  slNo: index + 1,
                  name: member.name || `${member.firstName || ""} ${member.lastName || ""}`,
                  gender: member.gender || "",
                  relation: member.relation || "",
                  dob: member.dob ? new Date(member.dob).toLocaleDateString() : "",
                  age: member.age || "",
                  occupation: member.occupation || "",
                  phone: member.phone || "",
                  email: member.email || "",
                  bloodGroup: member.blood_group || "",
                  aadhaar: member.aadhaar || "",
                  familyNumber: member.family_number || member.familyNo || "",
                  hof: member.hof || member.isHof ? "Yes" : "No",
                  baptism: member.baptism ? "Yes" : "No",
                }));
                downloadCsv({ columns, rows, fileName: "members.csv" });
              }}
            >
              Download CSV
            </button>
          </div>
        </div>

        {error && <div style={{ color: "red", padding: "8px" }}>{error}</div>}

        <div className="table-wrapper1">
          <table className="member-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Relation</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Occupation</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Blood Group</th>
                <th>Aadhaar</th>
                <th>Family No</th>
                <th>HoF</th>
                <th>Baptism</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member, idx) => (
                  <tr key={member._id || idx}>
                    <td>{(currentPage - 1) * ROWS_PER_PAGE + idx + 1}</td>
                    <td>{member.name || `${member.firstName || ""} ${member.lastName || ""}`}</td>
                    <td>{member.gender || ""}</td>
                    <td>{member.relation || ""}</td>
                    <td>{member.dob ? new Date(member.dob).toLocaleDateString() : ""}</td>
                    <td>{member.age || ""}</td>
                    <td>{member.occupation || ""}</td>
                    <td>{member.phone || ""}</td>
                    <td>{member.email || ""}</td>
                    <td>{member.blood_group || ""}</td>
                    <td>{member.aadhaar || ""}</td>
                    <td>{member.family_number || member.familyNo || ""}</td>
                    <td>{member.hof || member.isHof ? "Yes" : "No"}</td>
                    <td>{member.baptism ? "Yes" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
          <span className="pagination-info">Page {currentPage} of {totalPages}</span>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
        </div>
      </div>
    </>
  );
};

export default ViewMembers;
