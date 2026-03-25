import React, { useEffect, useState } from "react";
import "../../css/searchfamily.css";
import { useNavigate } from "react-router-dom";
import { generateTablePdf, downloadCsv } from "../../utils/pdfExport";

const SearchFamily = () => {
  const [families, setFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;
  const navigate = useNavigate();

  // ✅ Ward → Unit structure
  const wardStructure = {
    "Block 1": [
      { number: "1", name: "Morth Smuni" },
      { number: "2", name: "Mar Athanasious" },
      { number: "3", name: "St. Philips" }
    ],
    "Block 2": [
      { number: "1", name: "Mar Basil" },
      { number: "2", name: "Mar Gabriel" },
      { number: "3", name: "St. Joseph" },
      { number: "4", name: "St. Andrews" },
      { number: "5", name: "Mar Gregorious" },
      { number: "6", name: "St. Thomas" }
    ],
    "Block 3": [
      { number: "1", name: "St. Paul" },
      { number: "2", name: "Mar Aprem" },
      { number: "3", name: "St. James" }
    ],
    "Block 4": [
      { number: "1", name: "St. Johns" },
      { number: "2", name: "Mar Micheal" },
      { number: "3", name: "Mar Bahanam" }
    ],
    "Block 5": [
      { number: "1", name: "St. George" },
      { number: "2", name: "Morth Uluthy" },
      { number: "3", name: "Mar Kauma" },
      { number: "4", name: "Mar Alias" },
      { number: "5", name: "Mar Ignatious" },
      { number: "6", name: "St. Peters" }
    ],
    "Block 6": [
      { number: "1", name: "Mar Severios" },
      { number: "2", name: "Mar Yacob Burdhana" },
      { number: "3", name: "Mar Semavoon" },
      { number: "4", name: "Mar Ahathulla" },
      { number: "5", name: "St. Mathews" },
      { number: "6", name: "Mar Julius" }
    ]
  };

  const getUnitName = (block, unitNo) => {
    if (!block || !unitNo) return "";
    const units = wardStructure[block];
    if (units) {
      const unit = units.find(u => u.number === unitNo);
      return unit ? `Unit ${unit.number} - ${unit.name}` : unitNo;
    }
    return unitNo;
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/families`)
      .then((res) => res.json())
      .then((data) => setFamilies(data))
      .catch((err) =>
        console.error("Error fetching families:", err)
      );
  }, []);

  /* ================= FILTER ================= */
  const filteredFamilies = families.filter((fam) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase().trim();

    // 1️⃣ Family name
    const familyMatch =
      fam.name?.toLowerCase().includes(term);

    // 2️⃣ Head of family
    const hofMatch =
      fam.hof?.toLowerCase().includes(term);

    // 3️⃣ Ward / unit name
    const unitMatch =
      fam.family_unit?.toLowerCase().includes(term);

    // 4️⃣ Ward number (CORE REQUIREMENT)
    const wardNumberMatch =
      fam.ward_number?.toLowerCase() === term ||
      `ward ${fam.ward_number}` === term ||
      `block ${fam.ward_number}` === term;

    return (
      familyMatch ||
      hofMatch ||
      unitMatch ||
      wardNumberMatch
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / ROWS_PER_PAGE));
  const paginatedFamilies = filteredFamilies.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <>
      {/* ================= SEARCH INPUT ================= */}
      <div className="container-input4">
        <input
          type="text"
          placeholder="SEARCH BY FAMILY / BLOCK NUMBER / UNIT NAME"
          className="input"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="member-table-container1">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2>FAMILIES ({filteredFamilies.length})</h2>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="submit-btn"
              onClick={() => {
                const columns = [
                  { key: "slNo", header: "Sl No" },
                  { key: "familyNumber", header: "Family No" },
                  { key: "familyName", header: "Family Name" },
                  { key: "hof", header: "HoF" },
                  { key: "wardNo", header: "Block No" },
                  { key: "ward", header: "Unit Name" },
                ];
                const rows = filteredFamilies.map((fam, index) => ({
                  slNo: index + 1,
                  familyNumber: fam.family_number,
                  familyName: fam.name,
                  hof: fam.hof,
                  wardNo: fam.ward_number ? fam.ward_number.replace('Block ', '') : '',
                  ward: getUnitName(fam.ward_number, fam.family_unit),
                }));
                generateTablePdf({ title: "Family List", columns, rows, fileName: "families.pdf" });
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
                  { key: "slNo", header: "Sl No" },
                  { key: "familyNumber", header: "Family No" },
                  { key: "familyName", header: "Family Name" },
                  { key: "hof", header: "HoF" },
                  { key: "wardNo", header: "Block No" },
                  { key: "ward", header: "Unit Name" },
                ];
                const rows = filteredFamilies.map((fam, index) => ({
                  slNo: index + 1,
                  familyNumber: fam.family_number,
                  familyName: fam.name,
                  hof: fam.hof,
                  wardNo: fam.ward_number ? fam.ward_number.replace('Block ', '') : '',
                  ward: getUnitName(fam.ward_number, fam.family_unit),
                }));
                downloadCsv({ columns, rows, fileName: "families.csv" });
              }}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div className="table-wrapper1">
          <table className="member-table">
            <thead>
              <tr>
                <th>FAMILY NO</th>
                <th>FAMILY NAME</th>
                <th>HoF</th>
                <th>BLOCK NO</th>
                <th>UNIT NAME</th>
              </tr>
            </thead>

            <tbody>
              {paginatedFamilies.length > 0 ? (
                paginatedFamilies.map((fam) => (
                  <tr
                    key={fam._id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate("/SearchedFam", {
                        state: fam,
                      })
                    }
                  >
                    <td>{fam.family_number}</td>
                    <td>{fam.name}</td>
                    <td>{fam.hof}</td>
                    <td>{fam.ward_number ? fam.ward_number.replace('Block ', '') : ''}</td>
                    <td>{getUnitName(fam.ward_number, fam.family_unit)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                    }}
                  >
                    No families found
                  </td>
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

export default SearchFamily;
