import React, { useState, useEffect } from 'react';
import '../../css/deathadd.css';

const NewBaptism = () => {
  // Form states
  const [familySearch, setFamilySearch] = useState('');
  const [familyResults, setFamilyResults] = useState([]);
  const [selectedFamilyName, setSelectedFamilyName] = useState('');

  const [headsOfFamily, setHeadsOfFamily] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);

  const [unbaptizedMembers, setUnbaptizedMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isParishioner, setIsParishioner] = useState(true);

  // Baptism form data
  const [formData, setFormData] = useState({
    member_name: '',
    member_dob: '',
    gender: '',
    home_parish: '',
    address: '',
    father_name: '',
    mother_name: '',
    date_of_baptism: '',
    place_of_baptism: '',
    church_where_baptised: '',
    bapt_name: '',
    godparent_name: '',
    godparent_house_name: '',
    baptised_by: '',
    certificate_number: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search families as user types
  useEffect(() => {
    if (familySearch.length >= 2 && familySearch !== selectedFamilyName) {
      const delaySearch = setTimeout(() => {
        searchFamilies();
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setFamilyResults([]);
    }
  }, [familySearch, selectedFamilyName]);

  // Fetch heads of family when family name is selected
  useEffect(() => {
    if (selectedFamilyName) {
      fetchHeadsOfFamily();
    }
  }, [selectedFamilyName]);

  // Fetch unbaptized members when family is selected
  useEffect(() => {
    if (selectedFamilyId) {
      const family = headsOfFamily.find(f => f._id === selectedFamilyId);
      setSelectedFamily(family);
      if (family) {
        fetchUnbaptizedMembers(family.family_number);
      }
    }
  }, [selectedFamilyId]);

  // Auto-fill member details when member is selected
  useEffect(() => {
    if (selectedMemberId && unbaptizedMembers.length > 0) {
      const member = unbaptizedMembers.find(m => m._id === selectedMemberId);
      setSelectedMember(member);

      if (member) {
        // Auto-fill form data
        setFormData(prev => ({
          ...prev,
          bapt_name: member.name || '',
          place_of_baptism: selectedFamily?.location || '',
          church_where_baptised: selectedFamily?.location || ''
        }));
      }
    }
  }, [selectedMemberId, unbaptizedMembers, selectedFamily]);

  const searchFamilies = async () => {
    try {
      setSearchLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms/search-families/${familySearch}`);

      if (!res.ok) {
        console.error("Search failed:", res.status);
        return;
      }

      const data = await res.json();
      // Get unique family names
      const uniqueFamilies = [...new Set(data.map(f => f.name))];
      setFamilyResults(uniqueFamilies);
    } catch (err) {
      console.error('Error searching families:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchHeadsOfFamily = async () => {
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms/heads-of-family/${selectedFamilyName}`);
      const data = await res.json();
      setHeadsOfFamily(data);

      // Reset subsequent selections
      setSelectedFamilyId('');
      setSelectedFamily(null);
      setUnbaptizedMembers([]);
      setSelectedMemberId('');
      setSelectedMember(null);
    } catch (err) {
      console.error('Error fetching heads of family:', err);
    }
  };

  const fetchUnbaptizedMembers = async (familyNumber) => {
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms/unbaptized-members/${familyNumber}`);

      if (!res.ok) {
        console.error("Failed to fetch members:", res.status);
        return;
      }

      const data = await res.json();
      setUnbaptizedMembers(data);

      // Reset member selection
      setSelectedMemberId('');
      setSelectedMember(null);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const handleFamilyNameSelect = (familyName) => {
    setSelectedFamilyName(familyName);
    setFamilySearch(familyName);
    setFamilyResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParishionerToggle = (value) => {
    setIsParishioner(value);

    // Reset dependent state safely
    setFamilySearch('');
    setSelectedFamilyName('');
    setHeadsOfFamily([]);
    setSelectedFamilyId('');
    setSelectedFamily(null);
    setUnbaptizedMembers([]);
    setSelectedMemberId('');
    setSelectedMember(null);

    setFormData(prev => ({
      ...prev,
      member_name: '',
      member_dob: '',
      gender: '',
      home_parish: '',
      bapt_name: '',
      place_of_baptism: '',
      church_where_baptised: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isParishioner && !selectedMember) {
      alert('⚠️ Please select a member to baptize');
      return;
    }

    if (!isParishioner) {
      if (!formData.member_name?.trim() || !formData.member_dob || !formData.gender) {
        alert('⚠️ Please complete all person details (Name, DOB, Gender)');
        return;
      }
    }

    if (!formData.date_of_baptism) {
      alert('⚠️ Please select a baptism date');
      return;
    }

    if (!formData.bapt_name?.trim()) {
      alert('⚠️ Please enter the baptism name');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        isParishioner,
        ...formData
      };

      if (isParishioner) {
        payload.member_id = selectedMember._id;
      }

      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/baptisms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add baptism record');
      }

      alert('✅ Baptism record added successfully!');

      // Reset form
      resetForm();
    } catch (err) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFamilySearch('');
    setFamilyResults([]);
    setSelectedFamilyName('');
    setHeadsOfFamily([]);
    setSelectedFamilyId('');
    setSelectedFamily(null);
    setUnbaptizedMembers([]);
    setSelectedMemberId('');
    setSelectedMember(null);
    setIsParishioner(true);
    setFormData({
      member_name: '',
      member_dob: '',
      gender: '',
      home_parish: '',
      address: '',
      father_name: '',
      mother_name: '',
      date_of_baptism: '',
      place_of_baptism: '',
      church_where_baptised: '',
      bapt_name: '',
      godparent_name: '',
      godparent_house_name: '',
      baptised_by: '',
      certificate_number: '',
      remarks: ''
    });
  };

  return (
    <div className="container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Add New Baptism Record</h2>

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

        {/* ================= PARISHIONER FLOW ================= */}
        {isParishioner && (
          <>
            <div className="input-group">
              <input
                type="text"
                value={familySearch}
                onChange={(e) => setFamilySearch(e.target.value)}
                placeholder="Type family name to search..."
              />
              <label>Search Family Name *</label>
              {searchLoading && (
                <div className="search-loading">Searching...</div>
              )}
              {!searchLoading && familyResults.length > 0 && (
                <ul className="suggestions">
                  {familyResults.map((familyName, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleFamilyNameSelect(familyName)}
                    >
                      {familyName}
                    </li>
                  ))}
                </ul>
              )}
              {!searchLoading && familySearch.length >= 2 && familyResults.length === 0 && familySearch !== selectedFamilyName && (
                <div className="no-results-message">
                  No families found with name "{familySearch}"
                </div>
              )}
            </div>

            {selectedFamilyName && headsOfFamily.length > 0 && (
              <div className="input-group">
                <select
                  value={selectedFamilyId}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                  required
                >
                  <option value="">-- Select HOF --</option>
                  {headsOfFamily.map((family) => (
                    <option key={family._id} value={family._id}>
                      {family.hof} - {family.family_number} {family.location ? `(${family.location})` : ''}
                    </option>
                  ))}
                </select>
                <label>Head of Family (HOF) *</label>
              </div>
            )}

            {selectedFamily && unbaptizedMembers.length > 0 && (
              <div className="input-group">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                >
                  <option value="">-- Select Member --</option>
                  {unbaptizedMembers.map((member) => {
                    const dobStr = member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A';
                    return (
                      <option key={member._id} value={member._id}>
                        {member.name} - {member.gender} - {dobStr}
                        {member.relation ? ` - ${member.relation}` : ''}
                      </option>
                    );
                  })}
                </select>
                <label>Member to Baptize *</label>
              </div>
            )}

            {selectedFamily && unbaptizedMembers.length === 0 && (
              <div className="no-members-message" style={{ color: 'red', marginTop: '10px', marginBottom: '15px', fontSize: '14px' }}>
                ⚠️ No unbaptized members found in this family. All members are either already baptized or marked as deceased.
              </div>
            )}
          </>
        )}

        {/* ================= COMMON BAPTISM DETAILS ================= */}
        {(isParishioner ? selectedMember : true) && (
          <>
            <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              Baptism Details
            </h3>

            <div className="input-group">
              <input
                type="text"
                name="bapt_name"
                value={formData.bapt_name}
                onChange={handleChange}
                required
              />
              <label>Baptism Name of Child *</label>
            </div>

            {!isParishioner && (
              <div className="input-group">
                <input
                  type="text"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleChange}
                  required
                />
                <label>Name of Child (Official Name) *</label>
              </div>
            )}

            <div className="input-group">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <label>Address</label>
            </div>

            {!isParishioner && (
              <>
                <div className="input-group">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <label>Gender *</label>
                </div>
              </>
            )}

            <div className="input-group">
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
              />
              <label>Father's Name</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
              />
              <label>Mother's Name</label>
            </div>

            {!isParishioner && (
              <div className="input-group">
                <input
                  type="date"
                  name="member_dob"
                  value={formData.member_dob}
                  onChange={handleChange}
                  required
                />
                <label>Date of Birth *</label>
              </div>
            )}

            <div className="input-group">
              <input
                type="date"
                name="date_of_baptism"
                value={formData.date_of_baptism}
                onChange={handleChange}
                required
              />
              <label>Date of Baptism *</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="godparent_name"
                value={formData.godparent_name}
                onChange={handleChange}
              />
              <label>Name of Godfather/Godmother</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="godparent_house_name"
                value={formData.godparent_house_name}
                onChange={handleChange}
              />
              <label>Address of Godfather/Godmother</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="church_where_baptised"
                value={formData.church_where_baptised}
                onChange={handleChange}
              />
              <label>Name & Address of Church where Baptized</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="baptised_by"
                value={formData.baptised_by}
                onChange={handleChange}
              />
              <label>Baptised By</label>
            </div>

            {!isParishioner && (
              <div className="input-group">
                <input
                  type="text"
                  name="home_parish"
                  value={formData.home_parish}
                  onChange={handleChange}
                />
                <label>Home Parish</label>
              </div>
            )}

            <div className="input-group">
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
              />
              <label>Remarks</label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={resetForm} className="fetch-btn" style={{ flex: 1, backgroundColor: '#6c757d' }}>
                🔄 Reset
              </button>
              <button type="submit" disabled={loading} className="submit-btn" style={{ flex: 2 }}>
                {loading ? '⏳ Saving...' : 'Add Baptism Record'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default NewBaptism;
