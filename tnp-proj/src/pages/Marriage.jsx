import React from 'react'
import { useNavigate } from "react-router-dom";

const Marriage = () => {
  const navigate = useNavigate();
  return (
    <div className="card-container1">
      <div className="card" onClick={() => navigate("/AddMarriage")}>
        <div className="card-details">
          <p className="text-title">ADD MARRIAGE</p>
        </div>
      </div>
      <div className="card" onClick={() => navigate("/ViewMarriage")}>
        <div className="card-details">
          <p className="text-title">VIEW MARRIAGE</p>
        </div>
      </div>
    </div>
  )
}

export default Marriage
