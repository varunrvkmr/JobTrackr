"use client";

import { NavLink } from "react-router-dom";
import "./sidebar.css";

interface SidebarProps {
  activeItem: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">JobTrackr</h1>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {[
              { path: "/", label: "Home", icon: "🏠" },
              { path: "/jobs", label: "Job Dashboard", icon: "📋" },
              { path: "/user-profile", label: "User Profile", icon: "👤" },
              { path: "/letter-generator", label: "Generate Letters", icon: "📝" },
            ].map(({ path, label, icon }) => (
              <li key={path} className="nav-item">
                <NavLink to={path} className={`nav-link ${activeItem === label.toLowerCase() ? "active" : ""}`}>
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-text">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
