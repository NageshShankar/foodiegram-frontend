import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IoHomeOutline, IoHome, IoSearchOutline, IoSearch, IoAddCircleOutline, IoAddCircle, IoPersonOutline, IoPerson, IoLogOutOutline, IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { RiRestaurantLine } from "react-icons/ri";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Assuming logout is available in context

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/home", icon: <IoHomeOutline />, activeIcon: <IoHome />, label: "Home" },
    { path: "/search", icon: <IoSearchOutline />, activeIcon: <IoSearch />, label: "Search" },
    { path: "/saved", icon: <IoBookmarkOutline />, activeIcon: <IoBookmark />, label: "Saved" },
  ];

  const role = (user?.userType || user?.role || "").toLowerCase();

  // High-level filter: Only Creators see 'Create' and 'Profile'
  const creatorItems = role === "creator"
    ? [
      { path: "/upload", icon: <IoAddCircleOutline />, activeIcon: <IoAddCircle />, label: "Create" },
      { path: `/creator/${user?.id || user?._id}`, icon: <IoPersonOutline />, activeIcon: <IoPerson />, label: "Profile" },
    ]
    : [];

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      {/* Background Ambience */}
      <div className="sidebar-bg-effect"></div>
      <div className="sidebar-gradient-orb"></div>

      <div className="sidebar-header">
        <div className="logo-container" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-image">
            <img src="/assets/logo_new.png" alt="FoodieGram Logo" className="brand-logo-img" />
          </div>
          <div className="sidebar-logo-text">
            <span className="logo-main">FoodieGram</span>
            <div className="logo-underline"></div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {[...menuItems, ...creatorItems].map((item, index) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              className={`sidebar-item ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              title={item.label}
              style={{ "--item-index": index }}
            >
              <div className="item-bg"></div>
              <span className="icon">
                {active ? item.activeIcon : item.icon}
              </span>
              <span className="label">{item.label}</span>

              {active && (
                <div className="active-indicator">
                  <div className="indicator-glow"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <span className="icon"><IoLogOutOutline /></span>
          <span className="label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
