import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../css/existingfamadd.css";

const ExistingFamilymem = () => {
  const location = useLocation();
  const [familyInfo, setFamilyInfo] = useState({
    name: "",
    hof: "",
  });

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    relation: "",
    dob: "",
    age: "",
    occupation: "",
    phone: "",
    email: "",
    blood_group: "",
    aadhaar: "",
    family_number: "",
    hof: "No",
    baptismStatus: "No",
  });

  // Auto-fill family_number if passed from navigation
  useEffect(() => {
    if (location.state?.family_number) {
      setFormData((prev) => ({
        ...prev,
        family_number: location.state.family_number,
      }));
      fetchFamilyDetails(location.state.family_number);
    }
  }, [location.state]);

  // Fetch family details from backend
  const fetchFamilyDetails = async (familyNumber) => {
    try {
      if (!familyNumber) return;
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(
        `${API}/api/families/number/${familyNumber}`
      );
      if (!res.ok) throw new Error("Family not found");
      const data = await res.json();
      setFamilyInfo({
        name: data.name || "",
        hof: data.hof || "",
      });
    } catch (err) {
      console.error("Error fetching family details:", err.message);
      setFamilyInfo({ name: "", hof: "" });
    }
  };

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "family_number") {
      fetchFamilyDetails(value.trim());
    }
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        sl_no: Date.now(),
        name: formData.firstname + " " + formData.lastname,
        gender: formData.gender,
        relation: formData.relation,
        dob: formData.dob,
        age: formData.age ? Number(formData.age) : undefined,
        occupation: formData.occupation,
        phone: formData.phone,
        email: formData.email,
        blood_group: formData.blood_group,
        aadhaar: formData.aadhaar,
        family_number: formData.family_number,
        hof: formData.hof === "Yes",
        baptism: formData.baptismStatus === "Yes",
      };

      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add member");
      }

      alert("✅ Member added successfully!");
      setFormData({
        firstname: "",
        lastname: "",
        gender: "",
        relation: "",
        dob: "",
        age: "",
        occupation: "",
        phone: "",
        email: "",
        blood_group: "",
        aadhaar: "",
        family_number: formData.family_number, // keep same family
        hof: "No",
        baptismStatus: "No",
      });
    } catch (err) {
      alert(`❌ Error adding member: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Family Number (First Field) */}
        <div className="input-group">
          <input
            type="text"
            name="family_number"
            value={formData.family_number}
            onChange={handleChange}
            required
          />
          <label>Family Number</label>
        </div>

        {/* Autofilled Family Name & HOF */}
        <div className="name-row">
          <div className="input-group">
            <input type="text" value={familyInfo.name} readOnly />
            <label>Family Name</label>
          </div>
          <div className="input-group">
            <input type="text" value={familyInfo.hof} readOnly />
            <label>Head of Family</label>
          </div>
        </div>

        {/* --- Keep all your original fields below --- */}

        {/* Name */}
        <div className="name-row">
          <div className="input-group">
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <label>First Name</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            <label>Last Name</label>
          </div>
        </div>

        {/* Gender & Relation */}
        <div className="name-row">
          <div className="input-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value=""></option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label>Gender</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="relation"
              value={formData.relation}
              onChange={handleChange}
            />
            <label>Relation</label>
          </div>
        </div>

        {/* DOB & Age */}
        <div className="name-row">
          <div className="input-group">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
            <label>Date of Birth</label>
          </div>
          <div className="input-group">
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
            <label>Age</label>
          </div>
        </div>

        {/* Occupation & Phone */}
        <div className="name-row">
          <div className="input-group">
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
            <label>Occupation</label>
          </div>
          <div className="input-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <label>Phone</label>
          </div>
        </div>

        {/* Email & Blog Group */}
        <div className="name-row">
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
            />
            <label>Blood Group </label>
          </div>
        </div>

        {/* Aadhaar */}
        <div className="input-group">
          <input
            type="text"
            name="aadhaar"
            value={formData.aadhaar}
            onChange={handleChange}
          />
          <label>Aadhaar</label>
        </div>

        {/* Hof & Baptism */}
        <div className="name-row">
          <div className="input-group">
            <select
              name="hof"
              value={formData.hof}
              onChange={handleChange}
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            <label>Head of Family</label>
          </div>
          <div className="input-group">
            <select
              name="baptismStatus"
              value={formData.baptismStatus}
              onChange={handleChange}
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            <label>Baptism</label>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Add Member
        </button>
      </form>
    </div>
  );
};

export default ExistingFamilymem;
