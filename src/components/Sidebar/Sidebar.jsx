import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IoHomeOutline, IoHome,
  IoSearchOutline, IoSearch,
  IoAddCircleOutline, IoAddCircle,
  IoPersonOutline, IoPerson,
  IoLogOutOutline,
  IoBookmarkOutline, IoBookmark
} from "react-icons/io5";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const isCreator = (user?.userType || user?.role || "").toLowerCase() === "creator";
  // True only if Creator has submitted restaurant details but admin hasn't verified yet
  const isUnverifiedCreator = isCreator && !user?.isAdminVerified;

  const role = (user?.userType || user?.role || "").toLowerCase();
  const isSetupPage = location.pathname === "/creator/setup-restaurant";

  // All users (including unverified creators) get full nav, but disabled on setup page
  const menuItems = [
    {
      path: "/home",
      icon: <IoHomeOutline />,
      activeIcon: <IoHome />,
      label: "Home",
      disabled: isSetupPage
    },
    {
      path: "/search",
      icon: <IoSearchOutline />,
      activeIcon: <IoSearch />,
      label: "Search",
      disabled: isSetupPage
    },
    {
      path: "/saved",
      icon: <IoBookmarkOutline />,
      activeIcon: <IoBookmark />,
      label: "Saved",
      disabled: isSetupPage
    },
  ];

  // Creators see Create + Profile
  const creatorItems = role === "creator"
    ? [
      {
        path: "/upload",
        icon: <IoAddCircleOutline />,
        activeIcon: <IoAddCircle />,
        label: "Create",
        disabled: isUnverifiedCreator || isSetupPage,
        tooltip: isUnverifiedCreator ? "Available after admin verification" : null,
      },
      {
        path: `/creator/${user?.id || user?._id}`,
        icon: <IoPersonOutline />,
        activeIcon: <IoPerson />,
        label: "Profile",
        disabled: isSetupPage
      },
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
      <div className="sidebar-bg-effect"></div>
      <div className="sidebar-gradient-orb"></div>

      <div className="sidebar-header">
        <div
          className="logo-container"
          onClick={() => !isSetupPage && navigate('/home')}
          style={{ cursor: isSetupPage ? 'default' : 'pointer' }}
        >
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
              onClick={() => !item.disabled && navigate(item.path)}
              title={item.tooltip || item.label}
              style={{
                "--item-index": index,
                opacity: item.disabled ? 0.4 : 1,
                cursor: item.disabled ? "not-allowed" : "pointer",
              }}
            >
              <div className="item-bg"></div>
              <span className="icon">
                {active ? item.activeIcon : item.icon}
              </span>
              <span className="label">{item.label}</span>

              {item.disabled && (
                <span style={{ fontSize: '9px', color: '#FACC15', letterSpacing: '0.3px', lineHeight: 1 }}>
                  Pending
                </span>
              )}

              {active && !item.disabled && (
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
