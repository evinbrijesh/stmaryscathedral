import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/viewmembers.css";
import { generateTablePdf, downloadCsv } from "../../utils/pdfExport";

const SearchedFam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { family_number } = location.state || {}; // get family_number from SearchFamily
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!family_number) return;

    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/members?family_number=${family_number}`)
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => {
        console.error("Error fetching members:", err);
        setError("Could not load members");
      });
  }, [family_number]);

  const handleAddMember = () => {
    // navigate to ExistingFamilymem.jsx and pass family_number
    navigate("/ExistingFamilymem", { state: { family_number } });
  };

  return (
    <div className="member-table-container1">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h2>Family Members ({family_number})</h2>
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
                { key: "hof", header: "HoF" },
                { key: "baptism", header: "Baptism" },
              ];
              const rows = members.map((member, index) => ({
                slNo: index + 1,
                name: member.name,
                gender: member.gender,
                relation: member.relation || "",
                dob: member.dob ? new Date(member.dob).toLocaleDateString() : "",
                age: member.age || "",
                occupation: member.occupation || "",
                phone: member.phone || "",
                email: member.email || "",
                bloodGroup: member.blood_group || "",
                aadhaar: member.aadhaar || "",
                hof: member.hof ? "Yes" : "No",
                baptism: member.baptism ? "Yes" : "No",
              }));
              generateTablePdf({
                title: `Family Members - ${family_number}`,
                columns,
                rows,
                fileName: `family_${family_number}_members.pdf`,
              });
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
                { key: "hof", header: "HoF" },
                { key: "baptism", header: "Baptism" },
              ];
              const rows = members.map((member, index) => ({
                slNo: index + 1,
                name: member.name,
                gender: member.gender,
                relation: member.relation || "",
                dob: member.dob ? new Date(member.dob).toLocaleDateString() : "",
                age: member.age || "",
                occupation: member.occupation || "",
                phone: member.phone || "",
                email: member.email || "",
                bloodGroup: member.blood_group || "",
                aadhaar: member.aadhaar || "",
                hof: member.hof ? "Yes" : "No",
                baptism: member.baptism ? "Yes" : "No",
              }));
              downloadCsv({
                columns,
                rows,
                fileName: `family_${family_number}_members.csv`,
              });
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
              <th>HoF</th>
              <th>Baptism</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member, idx) => (
                <tr key={member._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{member.name}</td>
                  <td>{member.gender}</td>
                  <td>{member.relation || ""}</td>
                  <td>{member.dob ? new Date(member.dob).toLocaleDateString() : ""}</td>
                  <td>{member.age || ""}</td>
                  <td>{member.occupation || ""}</td>
                  <td>{member.phone || ""}</td>
                  <td>{member.email || ""}</td>
                  <td>{member.blood_group || ""}</td>
                  <td>{member.aadhaar || ""}</td>
                  <td>{member.hof ? "Yes" : "No"}</td>
                  <td>{member.baptism ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Add button under table */}
      {family_number && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleAddMember}
            className="submit-btn"
          >
            ➕ Add New Member
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchedFam;
