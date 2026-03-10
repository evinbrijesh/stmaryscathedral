import React from 'react'
import pic1 from "./assets/images/pic1.jpg";
import './css/about.css'; // Importing the external CSS

const About = () => {
  const wardData = [
    { number: 1, name: 'Morth Smuni' },
    { number: 2, name: 'Mar Athanasious' },
    { number: 3, name: 'St. Philips' },
  ];

  const ward2 = [
    { number: 1, name: 'Mar Basil' },
    { number: 2, name: 'Mar Gabriel' },
    { number: 3, name: 'St. Joseph' },
    { number: 4, name: 'St. Andrews' },
    { number: 5, name: 'Mar Gregorious' },
    { number: 6, name: 'St. Thomas' },
  ];

  const ward3 = [
    { number: 1, name: 'St. Paul' },
    { number: 2, name: 'Mar Aprem' },
    { number: 3, name: 'St. James' },
  ];

  const ward4 = [
    { number: 1, name: 'St. Johns' },
    { number: 2, name: 'Mar Micheal' },
    { number: 3, name: 'Mar Bahanam' },
  ];

  const ward5 = [
    { number: 1, name: 'St. George' },
    { number: 2, name: 'Morth Uluthy' },
    { number: 3, name: 'Mar Kauma' },
    { number: 4, name: 'Mar Alias' },
    { number: 5, name: 'Mar Ignatious' },
    { number: 6, name: 'St. Peters' },
  ];

  const ward6 = [
    { number: 1, name: 'Mar Severios' },
    { number: 2, name: 'Mar Yacob Burdhana' },
    { number: 3, name: 'Mar Semavoon' },
    { number: 4, name: 'Mar Ahathulla' },
    { number: 5, name: 'St. Mathews' },
    { number: 6, name: 'Mar Julius' },
  ];

  const allWards = [
    { title: "Block 1", data: wardData },
    { title: "Block 2", data: ward2 },
    { title: "Block 3", data: ward3 },
    { title: "Block 4", data: ward4 },
    { title: "Block 5", data: ward5 },
    { title: "Block 6", data: ward6 },
  ];

  return (
    <div className="about-page-wrapper">

      {/* 1. HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="about-hero-text">
            <h2>Welcome to Our Church</h2>
            <div className="hero-divider"></div>
            <p>
              St. Mary's Jacobite Syrian Cathedral, Pallikara, is a spiritual home for all who seek peace and connection with God.
              Founded with a strong tradition and deep faith, our church has grown into a vibrant and welcoming community.
            </p>
            <p>
              We offer regular services, community outreach programs, and a place of comfort for everyone.
              Our mission is to serve with love, worship with passion, and grow together in Christ.
            </p>
            <p className="hero-highlight">
              Whether you're new in town or exploring your faith, you're always welcome at our church.
            </p>
          </div>

          <div className="about-hero-image">
            <img src={pic1} alt="St. Mary's Jacobite Syrian Cathedral" />
            <div className="image-accent-border"></div>
          </div>
        </div>
      </section>

      {/* 2. WARDS SECTION */}
      <section className="about-wards-section">
        <div className="wards-container">
          <div className="wards-header">
            <h2>Our Wards</h2>
            <p>Explore the connected communities and blocks that make up our parish.</p>
          </div>

          <div className="wards-grid">
            {allWards.map((wardBlock, index) => (
              <div key={index} className="ward-card">
                <div className="ward-card-header">
                  <h3>{wardBlock.title}</h3>
                  <span className="ward-count">{wardBlock.data.length} Units</span>
                </div>

                <table className="ward-modern-table">
                  <thead>
                    <tr>
                      <th>Unit No.</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wardBlock.data.map((ward) => (
                      <tr key={ward.number}>
                        <td className="unit-number">{ward.number}</td>
                        <td className="unit-name">{ward.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
