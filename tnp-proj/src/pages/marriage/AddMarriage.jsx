import React, { useState, useEffect } from 'react';
import "../../css/addmarriage.css";

const AddMarriage = () => {
  const [groomSearch, setGroomSearch] = useState("");
  const [brideSearch, setBrideSearch] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [filteredGrooms, setFilteredGrooms] = useState([]);
  const [filteredBrides, setFilteredBrides] = useState([]);
  const [selectedGroom, setSelectedGroom] = useState(null);
  const [selectedBride, setSelectedBride] = useState(null);
  const [isGroomParishioner, setIsGroomParishioner] = useState(true);
  const [isBrideParishioner, setIsBrideParishioner] = useState(true);

  const [manualGroomName, setManualGroomName] = useState("");
  const [manualBrideName, setManualBrideName] = useState("");
  const [manualGroomHomeParish, setManualGroomHomeParish] = useState("");
  const [manualBrideHomeParish, setManualBrideHomeParish] = useState("");
  const [manualGroomAddress, setManualGroomAddress] = useState("");
  const [manualBrideAddress, setManualBrideAddress] = useState("");
  const [manualGroomCityDistrict, setManualGroomCityDistrict] = useState("");
  const [manualBrideCityDistrict, setManualBrideCityDistrict] = useState("");
  const [manualGroomStateCountry, setManualGroomStateCountry] = useState("");
  const [manualBrideStateCountry, setManualBrideStateCountry] = useState("");
  const [manualGroomFatherName, setManualGroomFatherName] = useState("");
  const [manualBrideFatherName, setManualBrideFatherName] = useState("");
  const [manualGroomMotherName, setManualGroomMotherName] = useState("");
  const [manualBrideMotherName, setManualBrideMotherName] = useState("");


  const [marriageData, setMarriageData] = useState({
    date: "",
    place: "",
    solemnized_by: "",
    officiant_number: ""
  });

  // Fetch all members on component mount
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/members`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out deceased members
        const activeMembers = data.filter(member => !member.deceased);
        setAllMembers(activeMembers);
      })
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  // Filter grooms (male members)
  useEffect(() => {
    if (groomSearch.trim() === "") {
      setFilteredGrooms([]);
    } else {
      const males = allMembers.filter(
        (m) =>
          m.gender?.toLowerCase() === "male" &&
          m.name.toLowerCase().includes(groomSearch.toLowerCase())
      );
      setFilteredGrooms(males.slice(0, 10)); // Limit to 10 results
    }
  }, [groomSearch, allMembers]);

  // Filter brides (female members)
  useEffect(() => {
    if (brideSearch.trim() === "") {
      setFilteredBrides([]);
    } else {
      const females = allMembers.filter(
        (m) =>
          m.gender?.toLowerCase() === "female" &&
          m.name.toLowerCase().includes(brideSearch.toLowerCase())
      );
      setFilteredBrides(females.slice(0, 10)); // Limit to 10 results
    }
  }, [brideSearch, allMembers]);

  // Handle marriage form input
  const handleMarriageDataChange = (e) => {
    setMarriageData({
      ...marriageData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== Groom validation =====
    if (isGroomParishioner) {
      if (!selectedGroom) {
        alert("⚠️ Please select a groom");
        return;
      }
    } else {
      if (!manualGroomName.trim()) {
        alert("⚠️ Please enter groom name");
        return;
      }
    }

    // ===== Bride validation =====
    if (isBrideParishioner) {
      if (!selectedBride) {
        alert("⚠️ Please select a bride");
        return;
      }
    } else {
      if (!manualBrideName.trim()) {
        alert("⚠️ Please enter bride name");
        return;
      }
    }

    if (!marriageData.date) {
      alert("⚠️ Please select a marriage date");
      return;
    }





    // Prevent same person (only if both parishioners)
    if (
      isGroomParishioner &&
      isBrideParishioner &&
      selectedGroom._id === selectedBride._id
    ) {
      alert("⚠️ Groom and Bride cannot be the same person");
      return;
    }

    const payload = {

      spouse1_id: isGroomParishioner ? selectedGroom?._id : null,
      spouse1_name: isGroomParishioner ? selectedGroom?.name : manualGroomName,
      spouse1_isParishioner: isGroomParishioner,
      spouse1_address: isGroomParishioner ? null : manualGroomAddress,
      spouse1_city_district: isGroomParishioner ? null : manualGroomCityDistrict,
      spouse1_state_country: isGroomParishioner ? null : manualGroomStateCountry,
      spouse1_father_name: isGroomParishioner ? null : manualGroomFatherName,
      spouse1_mother_name: isGroomParishioner ? null : manualGroomMotherName,
      spouse1_home_parish: isGroomParishioner ? null : manualGroomHomeParish,

      spouse2_id: isBrideParishioner ? selectedBride?._id : null,
      spouse2_name: isBrideParishioner ? selectedBride?.name : manualBrideName,
      spouse2_isParishioner: isBrideParishioner,
      spouse2_address: isBrideParishioner ? null : manualBrideAddress,
      spouse2_city_district: isBrideParishioner ? null : manualBrideCityDistrict,
      spouse2_state_country: isBrideParishioner ? null : manualBrideStateCountry,
      spouse2_father_name: isBrideParishioner ? null : manualBrideFatherName,
      spouse2_mother_name: isBrideParishioner ? null : manualBrideMotherName,
      spouse2_home_parish: isBrideParishioner ? null : manualBrideHomeParish,

      date: marriageData.date,
      place: marriageData.place,
      solemnized_by: marriageData.solemnized_by,
      officiant_number: marriageData.officiant_number
    };


    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(
        `${API}/api/marriages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add marriage record");
      }

      alert("✅ Marriage record added successfully!");

      // Reset
      setGroomSearch("");
      setBrideSearch("");
      setSelectedGroom(null);
      setSelectedBride(null);
      setManualGroomName("");
      setManualBrideName("");
      setManualGroomHomeParish("");
      setManualBrideHomeParish("");
      setManualGroomAddress("");
      setManualBrideAddress("");
      setManualGroomCityDistrict("");
      setManualBrideCityDistrict("");
      setManualGroomStateCountry("");
      setManualBrideStateCountry("");
      setManualGroomFatherName("");
      setManualBrideFatherName("");
      setManualGroomMotherName("");
      setManualBrideMotherName("");
      setFilteredGrooms([]);
      setFilteredBrides([]);
      setMarriageData({
        date: "",
        place: "",
        solemnized_by: "",
        officiant_number: "",
      });
    } catch (err) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <>
      <div className="marriage-flex-container">

        {/* ================= GROOM SECTION ================= */}
        <div className="marriage-card">
          <h2 className="marriage-title">Search Groom</h2>

          <div className="parishioner-toggle-group">
            <label>
              <input
                type="radio"
                name="groomParishioner"
                checked={isGroomParishioner}
                onChange={() => {
                  setIsGroomParishioner(true);
                  setSelectedGroom(null);
                  setGroomSearch("");
                  setManualGroomName("");
                }}
              /> Parishioner
            </label>
            <label>
              <input
                type="radio"
                name="groomParishioner"
                checked={!isGroomParishioner}
                onChange={() => {
                  setIsGroomParishioner(false);
                  setSelectedGroom(null);
                  setGroomSearch("");
                  setManualGroomName("");
                }}
              /> Non-Parishioner
            </label>
          </div>

          {isGroomParishioner ? (
            <>
              <div className="marriage-input-wrapper">
                <input
                  type="text"
                  placeholder="SEARCH GROOM"
                  value={groomSearch}
                  onChange={(e) => setGroomSearch(e.target.value)}
                  className="marriage-input"
                />
              </div>

              {selectedGroom && (
                <div className="marriage-selected-info">
                  <strong>Selected: {selectedGroom.name}</strong>
                  <button
                    type="button"
                    onClick={() => setSelectedGroom(null)}
                    className="marriage-clear-btn"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="marriage-table-container">
                <table className="marriage-table">
                  <thead>
                    <tr>
                      <th>SL NO</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Relation</th>
                      <th>DOB</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrooms.length > 0 ? (
                      filteredGrooms.map((member, index) => (
                        <tr key={member._id}>
                          <td>{index + 1}</td>
                          <td>{member.name}</td>
                          <td>{calculateAge(member.dob)}</td>
                          <td>{member.relation || "N/A"}</td>
                          <td>{formatDate(member.dob)}</td>
                          <td>{member.phone || "N/A"}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGroom(member);
                                setGroomSearch("");
                                setFilteredGrooms([]);
                              }}
                              className="marriage-select-btn"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="marriage-no-data">
                          {groomSearch ? "No male members found" : "Search for groom"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="marriage-input-group-manual">
              <input
                type="text"
                placeholder="GROOM NAME *"
                value={manualGroomName}
                onChange={(e) => setManualGroomName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="ADDRESS"
                value={manualGroomAddress}
                onChange={(e) => setManualGroomAddress(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="CITY & DISTRICT"
                value={manualGroomCityDistrict}
                onChange={(e) => setManualGroomCityDistrict(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="STATE & COUNTRY"
                value={manualGroomStateCountry}
                onChange={(e) => setManualGroomStateCountry(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="FATHER'S NAME"
                value={manualGroomFatherName}
                onChange={(e) => setManualGroomFatherName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="MOTHER'S NAME"
                value={manualGroomMotherName}
                onChange={(e) => setManualGroomMotherName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="NAME OF PARISH"
                value={manualGroomHomeParish}
                onChange={(e) => setManualGroomHomeParish(e.target.value)}
                className="marriage-input-field"
              />
            </div>
          )}
        </div>

        {/* ================= BRIDE SECTION ================= */}
        <div className="marriage-card">
          <h2 className="marriage-title">Search Bride</h2>

          <div className="parishioner-toggle-group">
            <label>
              <input
                type="radio"
                name="brideParishioner"
                checked={isBrideParishioner}
                onChange={() => {
                  setIsBrideParishioner(true);
                  setSelectedBride(null);
                  setBrideSearch("");
                  setManualBrideName("");
                }}
              /> Parishioner
            </label>
            <label>
              <input
                type="radio"
                name="brideParishioner"
                checked={!isBrideParishioner}
                onChange={() => {
                  setIsBrideParishioner(false);
                  setSelectedBride(null);
                  setBrideSearch("");
                  setManualBrideName("");
                }}
              /> Non-Parishioner
            </label>
          </div>

          {isBrideParishioner ? (
            <>
              <div className="marriage-input-wrapper">
                <input
                  type="text"
                  placeholder="SEARCH BRIDE"
                  value={brideSearch}
                  onChange={(e) => setBrideSearch(e.target.value)}
                  className="marriage-input"
                />
              </div>

              {selectedBride && (
                <div className="marriage-selected-info">
                  <strong>Selected: {selectedBride.name}</strong>
                  <button
                    type="button"
                    onClick={() => setSelectedBride(null)}
                    className="marriage-clear-btn"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="marriage-table-container">
                <table className="marriage-table">
                  <thead>
                    <tr>
                      <th>SL NO</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Relation</th>
                      <th>DOB</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrides.length > 0 ? (
                      filteredBrides.map((member, index) => (
                        <tr key={member._id}>
                          <td>{index + 1}</td>
                          <td>{member.name}</td>
                          <td>{calculateAge(member.dob)}</td>
                          <td>{member.relation || "N/A"}</td>
                          <td>{formatDate(member.dob)}</td>
                          <td>{member.phone || "N/A"}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBride(member);
                                setBrideSearch("");
                                setFilteredBrides([]);
                              }}
                              className="marriage-select-btn"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="marriage-no-data">
                          {brideSearch ? "No female members found" : "Search for bride"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="marriage-input-group-manual">
              <input
                type="text"
                placeholder="BRIDE NAME *"
                value={manualBrideName}
                onChange={(e) => setManualBrideName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="ADDRESS"
                value={manualBrideAddress}
                onChange={(e) => setManualBrideAddress(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="CITY & DISTRICT"
                value={manualBrideCityDistrict}
                onChange={(e) => setManualBrideCityDistrict(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="STATE & COUNTRY"
                value={manualBrideStateCountry}
                onChange={(e) => setManualBrideStateCountry(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="FATHER'S NAME"
                value={manualBrideFatherName}
                onChange={(e) => setManualBrideFatherName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="MOTHER'S NAME"
                value={manualBrideMotherName}
                onChange={(e) => setManualBrideMotherName(e.target.value)}
                className="marriage-input-field"
              />
              <input
                type="text"
                placeholder="NAME OF PARISH"
                value={manualBrideHomeParish}
                onChange={(e) => setManualBrideHomeParish(e.target.value)}
                className="marriage-input-field"
              />
            </div>
          )}
        </div>

      </div>


      {/* Marriage Details Form */}
      <div className="marriage-form-container">
        <form onSubmit={handleSubmit} className="marriage-form">
          <h2 className="marriage-form-title">Marriage Details</h2>

          <div className="marriage-form-grid">


            <div className="marriage-input-group">
              <label>Marriage Date *</label>
              <input
                type="date"
                name="date"
                value={marriageData.date}
                onChange={handleMarriageDataChange}
                required
              />
            </div>

            <div className="marriage-input-group">
              <label>Place of Marriage</label>
              <input
                type="text"
                name="place"
                value={marriageData.place}
                onChange={handleMarriageDataChange}
                placeholder="Church/Location"
              />
            </div>

            <div className="marriage-input-group">
              <label>Solemnized By</label>
              <input
                type="text"
                name="solemnized_by"
                value={marriageData.solemnized_by}
                onChange={handleMarriageDataChange}
                placeholder="Name of priest"
              />
            </div>
          </div>
          <div className="marriage-summary">
            <h3>Selected Couple:</h3>
            <div className="marriage-couple-info">
              <div>
                <strong>Groom:</strong>{" "}
                {isGroomParishioner
                  ? selectedGroom?.name || "Not selected"
                  : manualGroomName || "Not selected"}
              </div>
              <div>
                <strong>Bride:</strong>{" "}
                {isBrideParishioner
                  ? selectedBride?.name || "Not selected"
                  : manualBrideName || "Not selected"}
              </div>
            </div>
          </div>


          <button type="submit" className="marriage-submit-btn">
            Register Marriage
          </button>
        </form>
      </div>
    </>
  );
};

export default AddMarriage;