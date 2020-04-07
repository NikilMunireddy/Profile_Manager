import React from 'react'
import { Link } from 'react-router-dom'

const DashboardActions = () => {
    return (
        <div className="dash-buttons">
        <Link to="/edit-profile" className="btn">
          <i className="fas fa-user-circle text-primary"></i> &nbsp;Edit Profile
        </Link>
        <Link to="/add-experience" className="btn">
          <i className="fab fa-black-tie text-primary"></i> &nbsp;Add Experience
        </Link>
        <Link to="/add-education" className="btn">
          <i className="fas fa-graduation-cap text-primary"></i> &nbsp;Add Education
        </Link>
      </div>
    )
}


export default DashboardActions;
