import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/addfamily.css";

const AddFamily = () => {

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


  // ✅ Full form state restored
  const [form, setForm] = useState({

    ward_number: "",
    family_unit: "",
    family_number: "",
    name: "",
    hof: "",
    count: "",
    location: "",
    village: "",
    contact_number: ""

  });


  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ward_number") {
      setForm({
        ...form,
        ward_number: value,
        family_unit: "",
        family_number: "" // Reset family number when block changes
      });
    } else if (name === "family_unit") {
      // Auto-generate family number prefix
      const blockNum = form.ward_number ? form.ward_number.replace("Block ", "") : "";
      const unitNum = value ? value.padStart(2, "0") : "";

      setForm({
        ...form,
        family_unit: value,
        family_number: blockNum && unitNum ? `${blockNum}${unitNum}` : ""
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };


  // ✅ Submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const API = import.meta.env.VITE_API_URL;
      await axios.post(
        `${API}/api/families`,
        form
      );

      alert("Family added successfully");

      navigate("/ExistingFamilymem", {
        state: {
          family_number: form.family_number
        }
      });

    } catch (err) {

      alert(
        err.response?.data?.error ||
        err.message
      );

    }

  };


  // Units based on selected block
  const availableUnits =
    wardStructure[form.ward_number] || [];


  return (

    <div className="container">

      <form
        className="register-form"
        onSubmit={handleSubmit}
      >


        {/* BLOCK */}
        <div className="input-group">

          <select
            name="ward_number"
            value={form.ward_number}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Block
            </option>

            {Object.keys(wardStructure).map(block => (

              <option key={block} value={block}>
                {block}
              </option>

            ))}

          </select>

          <label>Block Number</label>

        </div>



        {/* UNIT */}
        <div className="input-group">

          <select
            name="family_unit"
            value={form.family_unit}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Unit
            </option>

            {availableUnits.map(unit => (

              <option
                key={unit.number}
                value={unit.number}
              >
                Unit {unit.number} — {unit.name}
              </option>

            ))}

          </select>

          <label>Unit Number</label>

        </div>



        {/* FAMILY NUMBER */}
        <div className="input-group">
          <input
            type="text"
            name="family_number"
            value={form.family_number}
            onChange={handleChange}
            required
          />
          <label>Family Number</label>
        </div>



        {/* FAMILY NAME */}
        <div className="input-group">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label>Family Name</label>
        </div>



        {/* HEAD OF FAMILY */}
        <div className="input-group">
          <input
            type="text"
            name="hof"
            value={form.hof}
            onChange={handleChange}
            required
          />
          <label>Head of Family</label>
        </div>



        {/* MEMBER COUNT */}
        <div className="input-group">
          <input
            type="number"
            name="count"
            value={form.count}
            onChange={handleChange}
          />
          <label>Member Count</label>
        </div>



        {/* LOCATION */}
        <div className="input-group">
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
          <label>Location</label>
        </div>



        {/* VILLAGE */}
        <div className="input-group">
          <input
            type="text"
            name="village"
            value={form.village}
            onChange={handleChange}
          />
          <label>Village</label>
        </div>



        {/* CONTACT NUMBER */}
        <div className="input-group">
          <input
            type="text"
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
          />
          <label>Contact Number</label>
        </div>



        <button
          type="submit"
          className="submit-btn"
        >
          Submit
        </button>


      </form>

    </div>

  );

};

export default AddFamily;
