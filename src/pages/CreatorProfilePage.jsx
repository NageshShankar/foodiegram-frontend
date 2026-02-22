import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IoCheckmarkCircle } from "react-icons/io5";
import api from "../utils/api";
import { getAssetUrl } from "../config";
import Sidebar from "../components/Sidebar/Sidebar";
import "../styles/CreatorProfile.css";

export default function CreatorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    restaurant: "",
    bio: "",
    description: "",
    ambienceImages: [],
    menuImages: [],
    zomatoLink: "",
    swiggyLink: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [ambienceImageFiles, setAmbienceImageFiles] = useState([]);
  const [menuImageFiles, setMenuImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile user
        const userRes = await api.get(`/creators/${id}`);
        const userData = userRes.data.data;
        setProfileUser(userData);
        setRestaurant(userData.restaurant);
        setEditForm({
          name: userData.name || "",
          username: userData.username || "",
          restaurant: userData.restaurant?.restaurantName || "",
          bio: userData.bio || "",
          description: userData.restaurant?.description || "",
          ambienceImages: userData.restaurant?.ambienceImages || [],
          menuImages: userData.restaurant?.menuImages || [],
          zomatoLink: userData.restaurant?.zomatoLink || "",
          swiggyLink: userData.restaurant?.swiggyLink || "",
        });

        // If it's own profile, fetch status
        if (user && (user.id === id || user._id === id)) {
          const statusRes = await api.get('/creators/profile-status');
          setProfileStatus(statusRes.data.data);
        }

        // Fetch reels
        const reelsRes = await api.get(`/reels?creator=${id}`);
        const creatorReels = reelsRes.data.data || [];
        setReels(creatorReels);

        setPosts(creatorReels.map(r => ({
          id: r._id,
          src: getAssetUrl(r.videoUrl),
          likesCount: r.likes?.length || 0,
          comments: r.comments || [],
          dishName: r.foodName || r.caption,
          status: r.priceStatus // Added for visibility
        })));

      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Check if following
    const checkFollow = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/users/${user.id || user._id}/following`);
        const following = res.data.data || [];
        const isFollowingProfile = following.some(f => (f._id || f.id) === profileUser?.restaurant?._id || (f._id || f.id) === profileUser?.restaurant?.id);
        setIsFollowing(isFollowingProfile);
      } catch (err) {
        console.error("Check follow error:", err);
      }
    };
    if (profileUser) checkFollow();

    // Force body scroll to be enabled for this page
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    return () => {
      // Optional: Reset if needed when leaving
    };
  }, [id, user, profileUser?.restaurant?._id]);

  useEffect(() => {
    if (profileUser) {
      setFollowCount(profileUser.followersCount || 0);
    }
  }, [profileUser]);

  const handleFollowClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isFollowing) {
        await api.delete(`/restaurants/${profileUser.restaurant._id || profileUser.restaurant.id}/unfollow`);
        setIsFollowing(false);
        setFollowCount(prev => prev - 1);
      } else {
        await api.post(`/restaurants/${profileUser.restaurant._id || profileUser.restaurant.id}/follow`);
        setIsFollowing(true);
        setFollowCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const fetchFollowers = async () => {
    setModalLoading(true);
    setShowFollowersModal(true);
    try {
      const res = await api.get(`/creators/${id}/followers`);
      setFollowersList(res.data.data || []);
    } catch (err) {
      console.error("Fetch followers error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setModalLoading(true);
    setShowFollowingModal(true);
    try {
      const targetId = id;
      const res = await api.get(`/users/${targetId}/following`);
      setFollowingList(res.data.data || []);
    } catch (err) {
      console.error("Fetch following error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const isOwnProfile = user && (String(user.id) === String(id) || String(user._id) === String(id));

  const handleBack = () => navigate(-1);

  const handleOpenEdit = () => setIsEditing(true);
  const handleCloseEdit = () => setIsEditing(false);

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAmbienceFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setAmbienceImageFiles(prev => [...prev, ...newFiles]);
  };

  const handleMenuFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setMenuImageFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveNewAmbience = (index) => {
    setAmbienceImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewMenu = (index) => {
    setMenuImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [activeTab, setActiveTab] = useState("POSTS"); // Added activeTab state
  const [currentSlide, setCurrentSlide] = useState(0); // For ambience slideshow
  const [menuSlide, setMenuSlide] = useState(0);

  const handleRemoveExistingAmbience = (index) => {
    setEditForm(prev => ({
      ...prev,
      ambienceImages: prev.ambienceImages.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExistingMenu = (index) => {
    setEditForm(prev => ({
      ...prev,
      menuImages: prev.menuImages.filter((_, i) => i !== index)
    }));
  };

  const nextSlide = (type) => {
    if (type === 'ambience') {
      setCurrentSlide(prev => (prev + 1) % restaurant.ambienceImages.length);
    } else {
      setMenuSlide(prev => (prev + 1) % restaurant.menuImages.length);
    }
  };

  const prevSlide = (type) => {
    if (type === 'ambience') {
      setCurrentSlide(prev => (prev - 1 + restaurant.ambienceImages.length) % restaurant.ambienceImages.length);
    } else {
      setMenuSlide(prev => (prev - 1 + restaurant.menuImages.length) % restaurant.menuImages.length);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      await api.put('/creators/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Save Restaurant Details
      const restData = new FormData();
      restData.append('description', editForm.description || "");
      restData.append('zomatoLink', editForm.zomatoLink || "");
      restData.append('swiggyLink', editForm.swiggyLink || "");

      // Send existing images to keep
      editForm.ambienceImages.forEach(url => {
        restData.append('existingAmbienceImages', url);
      });
      editForm.menuImages.forEach(url => {
        restData.append('existingMenuImages', url);
      });

      ambienceImageFiles.forEach(file => {
        restData.append('ambienceImages', file);
      });
      menuImageFiles.forEach(file => {
        restData.append('menuImages', file);
      });

      await api.put('/creators/restaurant/profile', restData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refetch to ensure all data is in sync
      const updatedUser = await api.get(`/creators/${id}`);
      const ud = updatedUser.data.data;
      setProfileUser(ud);
      setRestaurant(ud.restaurant);
      setEditForm({
        name: ud.name || "",
        username: ud.username || "",
        restaurant: ud.restaurant?.restaurantName || "",
        bio: ud.bio || "",
        description: ud.restaurant?.description || "",
        ambienceImages: ud.restaurant?.ambienceImages || [],
        menuImages: ud.restaurant?.menuImages || [],
        zomatoLink: ud.restaurant?.zomatoLink || "",
        swiggyLink: ud.restaurant?.swiggyLink || "",
      });

      setIsEditing(false);
      setProfileImageFile(null);
      setAmbienceImageFiles([]);
      setMenuImageFiles([]);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile or restaurant details");
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!profileUser) return <div className="error-state">Creator not found</div>;

  const avatarChar = profileUser.name?.[0]?.toUpperCase() || "C";
  const avatarUrl = getAssetUrl(profileUser.profileImage);
  const avatarImage = profilePicPreview || avatarUrl;

  return (
    <div className="creator-profile-layout" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="creator-profile-page" style={{ flex: 1 }}>
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <span>← Back</span>
          </button>
        </div>

        <div className="creator-profile-inner">
          <header className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar" style={{ backgroundImage: avatarImage ? `url(${avatarImage})` : 'none' }}>
                {!avatarImage && <span>{avatarChar}</span>}
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-top">
                <div className="profile-name-section">
                  <h1 className="profile-name">
                    {profileUser.name}
                    {profileUser.verificationStatus === 'APPROVED' && (
                      <span className="verified-badge-pill">
                        <IoCheckmarkCircle />
                      </span>
                    )}
                  </h1>
                  <span className="profile-username">@{profileUser.username}</span>
                </div>
                <div className="profile-actions-header">
                  {isOwnProfile ? (
                    <button className="edit-btn" onClick={handleOpenEdit}>Edit Profile</button>
                  ) : (
                    <button
                      className={`follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={handleFollowClick}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}</span> posts
                </div>
                <div className="stat clickable" onClick={fetchFollowers}>
                  <span className="stat-number">{followCount}</span> followers
                </div>
                <div className="stat clickable" onClick={fetchFollowing}>
                  <span className="stat-number">{profileUser.followingCount || 0}</span> following
                </div>
              </div>

              <div className="profile-restaurant">🍽️ {restaurant?.restaurantName || "No Restaurant Linked"}</div>
              {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
              {restaurant?.description && <p className="profile-description">{restaurant.description}</p>}

              {/* PART H - STATUS RENDERING */}
              {isOwnProfile && profileStatus?.verificationStatus === 'PENDING' && (
                <div className="verification-banner" style={{ background: '#fef9c3', border: '1px solid #facc15', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                  <div className="verification-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <div>
                      <h3 style={{ margin: 0, color: '#854d0e', fontSize: '16px' }}>Your account is under verification</h3>
                      <p style={{ margin: 0, color: '#a16207', fontSize: '13px' }}>It may take up to 1 hour. You'll be notified once approved.</p>
                    </div>
                  </div>
                </div>
              )}

              {isOwnProfile && profileStatus?.verificationStatus === 'REJECTED' && (
                <div className="verification-banner" style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                  <div className="verification-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>❌</span>
                    <div>
                      <h3 style={{ margin: 0, color: '#991b1b', fontSize: '16px' }}>Verification Rejected</h3>
                      <p style={{ margin: 0, color: '#b91c1c', fontSize: '13px' }}>Your account does not seem genuine. Please try again creating the account or contact support.</p>
                    </div>
                  </div>
                </div>
              )}

              {isOwnProfile && profileStatus?.verificationStatus === 'APPROVED' && (
                <>
                  {profileStatus?.nextStep === 'COMPLETE_POS_SETUP' && (
                    <div className="setup-guidance-banner" style={{ background: '#ecfdf5', border: '1px solid #34d399', padding: '15px', borderRadius: '12px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="setup-content">
                        <h4 style={{ margin: 0, color: '#065f46' }}>🚀 Almost Done!</h4>
                        <p style={{ margin: 0, color: '#047857', fontSize: '13px' }}>Complete your POS setup to start posting.</p>
                      </div>
                      <button className="setup-cta-btn" onClick={() => navigate('/pos-setup')} style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Complete POS Setup</button>
                    </div>
                  )}

                  {profileStatus?.nextStep === 'READY' && (
                    <div className="ready-actions" style={{ marginTop: '20px' }}>
                      <button className="btn-primary" onClick={() => navigate('/upload')} style={{ padding: '12px 30px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Upload New Reel</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </header>

          <nav className="profile-tabs">
            <button className={`tab ${activeTab === 'POSTS' ? 'active' : ''}`} onClick={() => setActiveTab('POSTS')}>POSTS</button>
            <button className={`tab ${activeTab === 'AMBIENCE' ? 'active' : ''}`} onClick={() => setActiveTab('AMBIENCE')}>AMBIENCE</button>
            <button className={`tab ${activeTab === 'MENU' ? 'active' : ''}`} onClick={() => setActiveTab('MENU')}>MENU</button>
          </nav>

          <main className="profile-content">
            {activeTab === 'POSTS' ? (
              <div className="posts-grid">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className="post-item" onClick={() => navigate(`/home`)}>
                      <video
                        src={post.src}
                        muted
                        loop
                        playsInline
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => {
                          e.target.pause();
                          e.target.currentTime = 0;
                        }}
                      />
                      {post.status === 'PENDING' && <div className="pending-badge">Pending Approval</div>}
                      <div className="post-overlay">
                        <div className="post-stats-overlay">
                          <span>❤️ {post.likesCount}</span>
                          <span>💬 {post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-posts">
                    <p>No posts yet. Start your journey by uploading your first reel!</p>
                    <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Reel</button>
                  </div>
                )}
              </div>
            ) : activeTab === 'AMBIENCE' ? (
              <div className="ambience-gallery">
                {restaurant?.ambienceImages?.length > 0 ? (
                  <div className="slideshow-container">
                    <div className="slideshow-main">
                      <img
                        src={getAssetUrl(restaurant.ambienceImages[currentSlide])}
                        alt="Ambience"
                        className="slide-image"
                      />
                      <button className="slide-nav prev" onClick={() => prevSlide('ambience')}>‹</button>
                      <button className="slide-nav next" onClick={() => nextSlide('ambience')}>›</button>
                      <div className="slide-dots">
                        {restaurant.ambienceImages.map((_, i) => (
                          <span key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></span>
                        ))}
                      </div>
                    </div>
                    <div className="slideshow-thumbnail-strip">
                      {restaurant.ambienceImages.map((img, i) => (
                        <div key={i} className={`thumb-item ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}>
                          <img src={getAssetUrl(img)} alt="thumb" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-posts">
                    <p>No ambience photos uploaded yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="menu-gallery">
                {restaurant?.menuImages?.length > 0 ? (
                  <div className="slideshow-container">
                    <div className="slideshow-main">
                      <img
                        src={getAssetUrl(restaurant.menuImages[menuSlide])}
                        alt="Menu"
                        className="slide-image"
                      />
                      <button className="slide-nav prev" onClick={() => prevSlide('menu')}>‹</button>
                      <button className="slide-nav next" onClick={() => nextSlide('menu')}>›</button>
                      <div className="slide-dots">
                        {restaurant.menuImages.map((_, i) => (
                          <span key={i} className={`dot ${i === menuSlide ? 'active' : ''}`} onClick={() => setMenuSlide(i)}></span>
                        ))}
                      </div>
                    </div>
                    <div className="slideshow-thumbnail-strip">
                      {restaurant.menuImages.map((img, i) => (
                        <div key={i} className={`thumb-item ${i === menuSlide ? 'active' : ''}`} onClick={() => setMenuSlide(i)}>
                          <img src={getAssetUrl(img)} alt="thumb" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-posts">
                    <p>No menu photos uploaded yet.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {isEditing && (
          <div className="modal-overlay" onClick={handleCloseEdit}>
            <div className="modal-content profile-edit-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Profile & Restaurant</h3>
                <button className="close-x" onClick={handleCloseEdit}>&times;</button>
              </div>

              <div className="modal-body-scroll">
                <div className="edit-section">
                  <h4>Personal Details</h4>
                  <div className="form-group">
                    <label>Name</label>
                    <input name="name" value={editForm.name} onChange={handleChangeEdit} />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea name="bio" value={editForm.bio} onChange={handleChangeEdit} />
                  </div>
                  <div className="form-group">
                    <label>Profile Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>

                <div className="edit-section restaurant-edit-section">
                  <h4>Restaurant Details</h4>
                  <div className="form-group">
                    <label>Short Description</label>
                    <textarea
                      name="description"
                      placeholder="Tell users why they should visit..."
                      value={editForm.description || ""}
                      onChange={handleChangeEdit}
                    />
                  </div>

                  <div className="form-group">
                    <label>Zomato Link</label>
                    <input name="zomatoLink" value={editForm.zomatoLink || ""} onChange={handleChangeEdit} placeholder="https://zomato.com/..." />
                  </div>

                  <div className="form-group">
                    <label>Swiggy Link</label>
                    <input name="swiggyLink" value={editForm.swiggyLink || ""} onChange={handleChangeEdit} placeholder="https://swiggy.com/..." />
                  </div>

                  <div className="form-group">
                    <label>Ambience Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAmbienceFilesChange}
                    />
                    <div className="url-preview-grid">
                      {/* Existing previews with remove button */}
                      {(editForm.ambienceImages || []).map((url, i) => (
                        <div key={`old-${i}`} className="preview-item existing">
                          <img
                            src={getAssetUrl(url)}
                            alt="existing"
                            className="mini-preview"
                          />
                          <button className="remove-preview-btn" onClick={() => handleRemoveExistingAmbience(i)}>&times;</button>
                        </div>
                      ))}
                      {/* New file previews */}
                      {ambienceImageFiles.map((file, i) => (
                        <div key={`new-${i}`} className="preview-item">
                          <img src={URL.createObjectURL(file)} alt="new preview" className="mini-preview" />
                          <span className="preview-label">New</span>
                          <button className="remove-preview-btn" onClick={() => handleRemoveNewAmbience(i)}>&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Menu Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMenuFilesChange}
                    />
                    <div className="url-preview-grid">
                      {/* Existing previews */}
                      {(editForm.menuImages || []).map((url, i) => (
                        <div key={`old-menu-${i}`} className="preview-item existing">
                          <img
                            key={`old-menu-${i}`}
                            src={getAssetUrl(url)}
                            alt="existing"
                            className="mini-preview"
                          />
                          <button className="remove-preview-btn" onClick={() => handleRemoveExistingMenu(i)}>&times;</button>
                        </div>
                      ))}
                      {/* New file previews */}
                      {menuImageFiles.map((file, i) => (
                        <div key={`new-menu-${i}`} className="preview-item">
                          <img src={URL.createObjectURL(file)} alt="new preview" className="mini-preview" />
                          <span className="preview-label">New</span>
                          <button className="remove-preview-btn" onClick={() => handleRemoveNewMenu(i)}>&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={handleCloseEdit}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit}>Save All Changes</button>
              </div>
            </div>
          </div>
        )}

        {(showFollowersModal || showFollowingModal) && (
          <div className="modal-overlay" onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }}>
            <div className="modal-content users-list-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{showFollowersModal ? "Followers" : "Following"}</h3>
                <button className="close-x" onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }}>&times;</button>
              </div>
              <div className="modal-body-scroll users-list">
                {modalLoading ? (
                  <div className="modal-loading">Loading...</div>
                ) : (
                  <div className="users-grid">
                    {(showFollowersModal ? followersList : followingList).map(u => (
                      <div key={u._id || u.id} className="user-row" onClick={() => { navigate(`/creator/${u._id || u.id}`); setShowFollowersModal(false); setShowFollowingModal(false); }}>
                        <div className="user-avatar-small">
                          {u.profileImage ? (
                            <img src={getAssetUrl(u.profileImage)} alt="" />
                          ) : (
                            <span>{(u.username || u.name || "A")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="user-info-small">
                          <span className="user-username-small">@{u.username || u.name}</span>
                          <span className="user-name-small">{u.name || u.restaurantName}</span>
                        </div>
                      </div>
                    ))}
                    {(showFollowersModal ? followersList : followingList).length === 0 && (
                      <div className="empty-list">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
