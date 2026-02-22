import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IoLockClosedOutline, IoRocketOutline } from "react-icons/io5";
import api from "../utils/api";
import Sidebar from "../components/Sidebar/Sidebar";
import "../styles/CreatorUpload.css";

export default function CreatorUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [zomatoPrice, setZomatoPrice] = useState("");
  const [swiggyPrice, setSwiggyPrice] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch profile status
        const statusRes = await api.get('/creators/profile-status');
        setProfileStatus(statusRes.data.data);

        // Fetch restaurant details for UI context
        if (user && user.restaurant) {
          const restRes = await api.get(`/restaurants/${user.restaurant}`);
          setRestaurant(restRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch upload context:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user || user.userType !== "creator") {
    return <Navigate to="/home" replace />;
  }

  const isVerified = profileStatus?.verificationStatus === 'APPROVED' || profileStatus?.verificationStatus === 'VERIFIED';
  const isSetupComplete = profileStatus?.setupCompleted === true;
  const isPosMode = profileStatus?.priceMode === 'POS';
  const isManualMode = profileStatus?.priceMode === 'MANUAL';

  const handleUpload = async () => {
    if (!isVerified) {
      setMessage("Your account is under verification.");
      return;
    }

    if (!isSetupComplete) {
      setMessage("Please complete your profile setup (POS/Manual pricing) first.");
      return;
    }

    if (!videoFile || !foodName || !category) {
      setMessage("Add video, food name & category.");
      return;
    }

    setIsUploading(true);
    setMessage("Preparing your dish...");

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('foodName', foodName);
      formData.append('category', category);
      formData.append('caption', caption);

      if (isManualMode) {
        if (zomatoPrice) formData.append('zomatoPrice', zomatoPrice);
        if (swiggyPrice) formData.append('swiggyPrice', swiggyPrice);
      }

      const response = await api.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        setMessage(response.data.message || "Served to your menu 🍽️");
        setVideoFile(null);
        setFoodName("");
        setCategory("");
        setCaption("");
        setZomatoPrice("");
        setSwiggyPrice("");

        setTimeout(() => {
          navigate(`/creator/${user.id || user._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(error.response?.data?.message || "Failed to serve the reel. Try again!");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading Upload...</div>;

  return (
    <div className="creator-upload-layout">
      <Sidebar />
      <div className="creator-upload-page">
        <div className="bg-chips">
          <span className="bg-chip bg-chip-1">🍣</span>
          <span className="bg-chip bg-chip-2">🍕</span>
          <span className="bg-chip bg-chip-3">🌮</span>
        </div>

        {(!isVerified) && (
          <div className="verification-lock-overlay">
            <div className="lock-card">
              <div className="lock-icon-container">
                <IoLockClosedOutline />
              </div>
              <h2>Verification Pending</h2>
              <p>Your restaurant details are being reviewed. This usually takes 2-3 hours.</p>
              <p className="lock-sub">You'll be able to upload reels once your account is approved.</p>
              <button onClick={() => navigate('/home')} className="fr-btn fr-btn-main lock-btn">
                Back to Feed
              </button>
            </div>
          </div>
        )}

        {isVerified && !isSetupComplete && (
          <div className="verification-lock-overlay">
            <div className="lock-card">
              <div className="lock-icon-container" style={{ color: 'var(--color-primary)', background: 'rgba(250, 204, 21, 0.1)' }}>
                <IoRocketOutline />
              </div>
              <h2>Complete Your Profile</h2>
              <p>Your account is verified! Just one last step to start uploading reels.</p>
              <p className="lock-sub">
                {isPosMode
                  ? "Connect your POS system to sync prices."
                  : "You chose Manual mode. Please finalize your profile to continue."}
              </p>
              {isPosMode && (
                <button
                  onClick={() => navigate('/pos-setup')}
                  className="fr-btn fr-btn-main lock-btn"
                >
                  Connect POS
                </button>
              )}
              {isManualMode && (
                <button
                  onClick={() => navigate(`/creator/${user.id || user._id}`)}
                  className="fr-btn fr-btn-main lock-btn"
                >
                  Finish Setup
                </button>
              )}
            </div>
          </div>
        )}

        <div className={`fr-shell ${(!isVerified || !isSetupComplete) ? 'is-locked' : ''}`}>
          <aside className="fr-side">
            <div className="fr-logo-pill-new">
              <img src="/assets/logo_new.png" alt="Logo" className="fr-brand-logo-img" />
              <span className="fr-logo-text">Foodiegram</span>
            </div>

            <h1 className="fr-title">
              Plate your<span> next reel.</span>
            </h1>

            <div className="fr-preview-plate">
              <div className="fr-plate-inner">
                {videoFile ? (
                  <>
                    <span className="fr-tag">Ready</span>
                    <p className="fr-plate-label">{videoFile.name}</p>
                  </>
                ) : (
                  <>
                    <span className="fr-plate-icon">🍓</span>
                    <p className="fr-plate-label">Your dish video sits here.</p>
                  </>
                )}
              </div>
            </div>
          </aside>

          <main className="fr-card">
            <header className="fr-header">
              <div className="fr-avatar">
                {user?.fullName?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <h2 className="fr-card-title">New food reel</h2>
                <p className="fr-card-sub">
                  {isPosMode ? "Prices auto-sync from POS" : "One clip. One line. Done."}
                </p>
              </div>
            </header>

            {message && (
              <div className={`fr-toast ${message.includes("Served") || message.includes("synced") || message.includes("saved") ? "fr-toast-ok" : "fr-toast-warn"}`}>
                {message}
              </div>
            )}

            <div className="fr-field">
              <label className="fr-label">Dish video</label>
              <label htmlFor="video-upload" className="fr-drop">
                <input id="video-upload" type="file" accept="video/*" className="fr-drop-input" onChange={(e) => setVideoFile(e.target.files[0])} />
                <div className="fr-drop-main">
                  <span className="fr-drop-icon">⬆️</span>
                  <span className="fr-drop-text">Drop or choose a file</span>
                </div>
                {videoFile && <p className="fr-drop-file" title={videoFile.name}>{videoFile.name}</p>}
              </label>
            </div>

            <div className="fr-field">
              <label className="fr-label">Food Name *</label>
              <input type="text" className="fr-textarea" style={{ height: '45px', padding: '10px' }} placeholder="e.g. Spicy Ramen" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
            </div>

            <div className="fr-field">
              <label className="fr-label">Category *</label>
              <input type="text" className="fr-textarea" style={{ height: '45px', padding: '10px' }} placeholder="e.g. Noodles, Dessert, Appetizer" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <div className="fr-field">
              <label className="fr-label">Caption</label>
              <div className="fr-text-wrap">
                <textarea className="fr-textarea" placeholder="Describe the flavor in one line..." value={caption} onChange={(e) => setCaption(e.target.value)} />
                <div className="fr-text-meta"><span className="fr-count">{caption.length}/220</span></div>
              </div>
            </div>

            {isManualMode && (
              <>
                <div className="fr-field">
                  <label className="fr-label">Zomato Price (Optional)</label>
                  <input type="number" className="fr-textarea" style={{ height: '45px', padding: '10px' }} placeholder="e.g. 299" value={zomatoPrice} onChange={(e) => setZomatoPrice(e.target.value)} />
                </div>
                <div className="fr-field">
                  <label className="fr-label">Swiggy Price (Optional)</label>
                  <input type="number" className="fr-textarea" style={{ height: '45px', padding: '10px' }} placeholder="e.g. 299" value={swiggyPrice} onChange={(e) => setSwiggyPrice(e.target.value)} />
                </div>
                <div className="fr-info-box" style={{ background: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <span className="fr-info-icon" style={{ marginRight: '10px' }}>💡</span>
                  <span className="fr-info-text">Enter prices to improve conversions. You can skip for now.</span>
                </div>
              </>
            )}

            {isPosMode && (
              <div className="fr-info-box" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span className="fr-info-icon" style={{ marginRight: '10px' }}>⚡</span>
                <span className="fr-info-text">Prices will be fetched automatically once POS is connected.</span>
              </div>
            )}

            <div className="fr-actions">
              <button type="button" className="fr-btn fr-btn-ghost" onClick={() => {
                setVideoFile(null); setFoodName(""); setCategory(""); setCaption("");
                setZomatoPrice(""); setSwiggyPrice(""); setMessage("");
              }}>Clear</button>
              <button type="button" className="fr-btn fr-btn-main" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Serving..." : "Serve reel"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
