import React, { useEffect } from "react";
import { useLike } from "../context/LikeContext";
import { IoClose } from "react-icons/io5";
import "../styles/LikesListModal.css";

export default function LikesListModal({ reelId, onClose }) {
  const { getLikedUsers } = useLike();
  const likedUsers = getLikedUsers(reelId) || [];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="likes-modal-portal">
      <div className="likes-overlay" onClick={onClose} />

      <div className="likes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="likes-header">
          <div className="header-spacer" />
          <h3>Likes</h3>
          <button className="close-likes-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="likes-list">
          {likedUsers.length === 0 ? (
            <div className="no-likes">No likes yet</div>
          ) : (
            likedUsers.map((likedUser) => {
              const userId = likedUser._id || likedUser.id;
              const username = likedUser.username || "user";
              const displayName = likedUser.name || username;
              const profileImage = likedUser.profileImage;

              return (
                <div key={userId} className="liked-user-row">
                  <div className="user-section">
                    <div className="user-avatar-container">
                      {profileImage ? (
                        <img src={profileImage} alt={username} className="user-img" />
                      ) : (
                        <div className="user-initials">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-text-info">
                      <span className="user-handle-name">{username}</span>
                      <span className="user-full-name">{displayName}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
