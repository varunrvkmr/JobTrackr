"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import { getAuthUserById, fetchCurrentUserProfile, logoutUser } from "../services/api"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom";
import "./sidebar.css"


interface SidebarProps {
  activeItem?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "home",
  //user = { name: "John Doe", email: "john@example.com" },
  onLogout = () => console.log("Logout clicked"),
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string }>({
    name: "Loading...",
    email: "Loading...",
  })
  
  useEffect(() => {
    const fetchUser = async () => {
      console.log("📡 Fetching user profile using cookie-auth...");
      try {
        const res = await fetchCurrentUserProfile();
        console.log("✅ User profile:", res);

        /*
        setUser({
          name: `${res.firstName} ${res.lastName}`,
          email: res.email,
          avatar: "", // or use res.avatar if available
        });
        */
       setUser({
          name: `${res.firstName || ""} ${res.lastName || ""}`.trim(),
          email: res.email,
          avatar: "",
        }); 
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      }
    };

    fetchUser();
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (showLogoutConfirm) {
      try {
        await logoutUser();
        setShowLogoutConfirm(false);
        navigate("/login"); // ✅ return to login screen
      } catch (err) {
        console.error("Logout failed:", err);
        alert("Failed to log out. Please try again.");
      }
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  // Get first letter of user name for avatar
  const userInitial = user.name.charAt(0).toUpperCase()

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-logo">JobTrackr</h1>
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
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
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-text">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        </nav>
      </div>

      {/* User profile section at the bottom */}
      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="user-avatar">
            {user.avatar ? <img src={user.avatar || "/placeholder.svg"} alt={user.name} /> : userInitial}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button
            className={`logout-button ${showLogoutConfirm ? "confirm" : ""}`}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

