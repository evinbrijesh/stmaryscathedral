import React, { useState, useEffect } from "react";
import "../../css/deathadd.css";

const AddDeathRecord = () => {
  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedHof, setSelectedHof] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [isHof, setIsHof] = useState(false);
  const [nextHof, setNextHof] = useState("");
  const [isParishioner, setIsParishioner] = useState(true);


  const blockUnits = {
    1: [
      { number: 1, name: "Morth Smuni" },
      { number: 2, name: "Mar Athanasious" },
      { number: 3, name: "St. Philips" }
    ],
    2: [
      { number: 1, name: "Mar Basil" },
      { number: 2, name: "Mar Gabriel" },
      { number: 3, name: "St. Joseph" },
      { number: 4, name: "St. Andrews" },
      { number: 5, name: "Mar Gregorious" },
      { number: 6, name: "St. Thomas" }
    ],
    3: [
      { number: 1, name: "St. Paul" },
      { number: 2, name: "Mar Aprem" },
      { number: 3, name: "St. James" }
    ],
    4: [
      { number: 1, name: "St. Johns" },
      { number: 2, name: "Mar Micheal" },
      { number: 3, name: "Mar Bahanam" }
    ],
    5: [
      { number: 1, name: "St. George" },
      { number: 2, name: "Morth Uluthy" },
      { number: 3, name: "Mar Kauma" },
      { number: 4, name: "Mar Alias" },
      { number: 5, name: "Mar Ignatious" },
      { number: 6, name: "St. Peters" }
    ],
    6: [
      { number: 1, name: "Mar Severios" },
      { number: 2, name: "Mar Yacob Burdhana" },
      { number: 3, name: "Mar Semavoon" },
      { number: 4, name: "Mar Ahathulla" },
      { number: 5, name: "St. Mathews" },
      { number: 6, name: "Mar Julius" }
    ]
  };

  const [formData, setFormData] = useState({
    name: "",
    house_name: "",
    address_place: "",
    block: "",
    unit: "",
    father_husband_name: "",
    mother_wife_name: "",
    death_date: "",
    burial_date: "",
    age: "",
    conducted_by: "", // ✅ Changed from 'church' to match schema
    cause_of_death: "",
    cell_no: "",
    remarks: "",
  });

  // Fetch families on mount
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/families`)
      .then((res) => res.json())
      .then((data) => setFamilies(data))
      .catch((err) => console.error("Error fetching families:", err));
  }, []);

  // Filter families by name
  useEffect(() => {
    if (searchQuery.trim() === "" || (selectedFamily && searchQuery === selectedFamily.name)) {
      setFilteredFamilies([]);
    } else {
      setFilteredFamilies(
        families.filter((fam) =>
          fam.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, families, selectedFamily]);

  // Fetch members when family selected
  useEffect(() => {
    if (selectedHof && selectedFamily) {
      const API = import.meta.env.VITE_API_URL;
      fetch(
        `${API}/api/members?family_number=${selectedFamily.family_number}`
      )
        .then((res) => res.json())
        .then((data) => setMembers(data))
        .catch((err) => console.error("Error fetching members:", err));
    }
  }, [selectedHof, selectedFamily]);


  // Autofill when member selected
  useEffect(() => {
    if (selectedMember) {
      const memberObj = members.find((m) => m._id === selectedMember);
      if (memberObj) {
        setFormData((prev) => ({
          ...prev,
          name: memberObj.name || "",
          house_name: memberObj.house_name || "",
          address_place: memberObj.address || "",
          father_husband_name:
            memberObj.father_name || memberObj.husband_name || "",
          mother_wife_name: memberObj.mother_name || memberObj.wife_name || "",
          age: memberObj.age || "",
          cell_no: memberObj.phone || "",
        }));

        if (memberObj.hof) {
          setIsHof(true);
        } else {
          setIsHof(false);
          setNextHof("");
        }
      }
    }
  }, [selectedMember, members]);

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleParishionerToggle = (value) => {
    setIsParishioner(value);

    // 🔥 reset dependent state safely
    setSelectedFamily(null);
    setSelectedHof("");
    setMembers([]);
    setSelectedMember("");
    setIsHof(false);
    setNextHof("");

    setFormData((prev) => ({
      ...prev,
      name: "",
      house_name: "",
      address_place: "",
      block: "",
      unit: "",
    }));
  };


  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isParishioner && (!selectedFamily || !selectedHof || !selectedMember)) {
      alert("⚠️ Please complete family, HOF, and member selection.");
      return;
    }

    if (isHof && !nextHof) {
      alert("⚠️ Please select the next HOF.");
      return;
    }
    if (!isParishioner && !formData.name.trim()) {
      alert("⚠️ Name is required for non-parishioner.");
      return;
    }


    const payload = {
      memberId: isParishioner ? selectedMember : null,
      nextHofId: isParishioner && isHof ? nextHof : null,
      family_no: isParishioner ? selectedFamily.family_number : null,

      name: formData.name,
      house_name: formData.house_name,
      address_place: formData.address_place,
      block: formData.block,
      unit: formData.unit,
      father_husband_name: formData.father_husband_name,
      mother_wife_name: formData.mother_wife_name,

      death_date: formData.death_date,
      burial_date: formData.burial_date,
      age: formData.age ? parseInt(formData.age) : null,

      conducted_by: formData.conducted_by,
      cause_of_death: formData.cause_of_death,
      cell_no: formData.cell_no,
      remarks: formData.remarks,

      isParishioner: Boolean(isParishioner),
    };

    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/deaths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); // ✅ Get response data for better error handling

      if (!res.ok) {
        throw new Error(data.error || "Failed to add death record");
      }

      alert("✅ Death record added successfully!");

      // Reset form
      setSearchQuery("");
      setFilteredFamilies([]);
      setSelectedFamily(null);
      setSelectedHof("");
      setMembers([]);
      setSelectedMember("");
      setIsHof(false);
      setNextHof("");
      setFormData({
        name: "",
        house_name: "",
        address_place: "",
        block: "",
        unit: "",
        father_husband_name: "",
        mother_wife_name: "",
        death_date: "",
        burial_date: "",
        age: "",
        conducted_by: "", // ✅ Changed from 'church'
        cause_of_death: "",
        cell_no: "",
        remarks: "",
      });
    } catch (err) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <form className="register-form" onSubmit={handleSubmit}>



        <h2>Add Death Record</h2>

        {/* Parishioner Toggle */}
        <div className="toggle-row">
          <span className="toggle-label">
            {isParishioner ? "Parishioner" : "Non-Parishioner"}
          </span>

          <label className="switch">
            <input
              type="checkbox"
              checked={isParishioner}
              onChange={(e) => handleParishionerToggle(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {isParishioner && (
          <>
            <div className="input-group">
              <label>Block</label>
              <select
                name="block"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value, unit: "" })}
              >
                <option value="">Select Block</option>
                {Object.keys(blockUnits).map((blockKey) => (
                  <option key={blockKey} value={blockKey}>
                    Block {blockKey}
                  </option>
                ))}
              </select>
            </div>

            {formData.block && (
              <div className="input-group">
                <label>Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="">Select Unit</option>
                  {blockUnits[formData.block].map((unitObj) => (
                    <option key={unitObj.number} value={`${unitObj.number} - ${unitObj.name}`}>
                      Unit {unitObj.number} - {unitObj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* ================= PARISHIONER FLOW ================= */}
        {isParishioner && (
          <>
            {/* Search Family */}
            <div className="input-group">
              <label>Search Family</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type family name..."
              />
              {filteredFamilies.length > 0 && (
                <ul className="suggestions">
                  {filteredFamilies.map((fam) => (
                    <li
                      key={fam._id}
                      onClick={() => {
                        setSelectedFamily(fam);
                        setSearchQuery(fam.name);
                        setFilteredFamilies([]);
                        const sameNameFamilies = families.filter(
                          (f) => f.name === fam.name
                        );
                        if (sameNameFamilies.length === 1) {
                          setSelectedHof(fam.hof);
                        } else {
                          setSelectedHof("");
                        }
                      }}
                    >
                      {fam.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* HOF dropdown */}
            {selectedFamily &&
              families.filter((f) => f.name === selectedFamily.name).length > 1 && (
                <div className="input-group">
                  <label>Select HOF</label>
                  <select
                    value={selectedHof}
                    onChange={(e) => setSelectedHof(e.target.value)}
                    required
                  >
                    <option value="">Select HOF</option>
                    {families
                      .filter((f) => f.name === selectedFamily.name)
                      .map((f) => (
                        <option key={f._id} value={f.hof}>
                          {f.hof}
                        </option>
                      ))}
                  </select>
                </div>
              )}

            {/* Member dropdown */}
            {selectedHof && members.length > 0 && (
              <div className="input-group">
                <label>Select Member (Deceased)</label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Next HOF */}
            {isHof && (
              <div className="input-group">
                <label>Select Next HOF</label>
                <select
                  value={nextHof}
                  onChange={(e) => setNextHof(e.target.value)}
                  required
                >
                  <option value="">Select Next HOF</option>
                  {members
                    .filter((m) => m._id !== selectedMember)
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* ================= NON-PARISHIONER FLOW ================= */}
        {!isParishioner && (
          <>
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label>Name *</label>
            </div>
          </>
        )}

        {/* ================= CERTIFICATE FIELDS (in certificate order) ================= */}

        <div className="input-group">
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
          <label>Age</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="house_name"
            value={formData.house_name}
            onChange={handleChange}
          />
          <label>House Name</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="address_place"
            value={formData.address_place}
            onChange={handleChange}
          />
          <label>Address</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="father_husband_name"
            value={formData.father_husband_name}
            onChange={handleChange}
          />
          <label>Husband's / Father's Name</label>
        </div>

        <div className="input-group">
          <input
            type="date"
            name="death_date"
            value={formData.death_date}
            onChange={handleChange}
            required
          />
          <label>Date of Demise *</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="cause_of_death"
            value={formData.cause_of_death}
            onChange={handleChange}
          />
          <label>Cause of Death</label>
        </div>

        <div className="input-group">
          <input
            type="date"
            name="burial_date"
            value={formData.burial_date}
            onChange={handleChange}
          />
          <label>Date of Funeral</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="conducted_by"
            value={formData.conducted_by}
            onChange={handleChange}
          />
          <label>Funeral Conducted by</label>
        </div>

        {/* ================= ADDITIONAL INFO (not on certificate) ================= */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
          Additional Information
        </h3>

        <div className="input-group">
          <input
            type="text"
            name="mother_wife_name"
            value={formData.mother_wife_name}
            onChange={handleChange}
          />
          <label>Mother/Wife Name</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="cell_no"
            value={formData.cell_no}
            onChange={handleChange}
          />
          <label>Cell No.</label>
        </div>

        <div className="input-group">
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
          ></textarea>
          <label>Remarks</label>
        </div>

        <button type="submit" className="submit-btn">
          Add Death Record
        </button>
      </form>
    </div>
  );
};

export default AddDeathRecord;