import React, { useState, useRef, useEffect } from "react";
import LikesListModal from "./LikesListModal";
import CommentsModal from "../pages/CommentsModal";
import CartNotification from "./CartNotification";
import { useCart } from "../context/CartContext";
import { useLike } from "../context/LikeContext";
import { useComment } from "../context/CommentContext";
import { useFollow } from "../context/FollowContext";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../context/SavedContext";
import RestaurantDetailCard from "./RestaurantDetailCard";
import { IoHeart, IoHeartOutline, IoChatbubbleEllipsesOutline, IoCartOutline, IoLocationSharp, IoPlay, IoPause, IoVolumeHighOutline, IoVolumeMuteOutline, IoPersonAddOutline, IoCheckmarkDoneOutline, IoCheckmarkCircle, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import "../styles/ReelCard.css";

export default function ReelCard({ reel, active, onComment }) {
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showRestaurantDetail, setShowRestaurantDetail] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [localFollowersCount, setLocalFollowersCount] = useState(reel?.followersCount || 0);

  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  const { addToCartFromReel } = useCart();
  const { toggleLike, isLiked, getLikeCount } = useLike();
  const { getCommentCount } = useComment();
  const { toggleRestaurantFollow, getFollowStatus } = useFollow();
  const { toggleSave, isSaved } = useSaved();
  const { user } = useAuth();

  const safeReel = reel || {};

  /* ======================
     AUTO PLAY/PAUSE ON ACTIVE
     ====================== */
  useEffect(() => {
    if (!videoRef.current) return;

    if (active) {
      videoRef.current.play().catch(err => console.log("Autoplay blocked", err));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [active]);

  /* ======================
     INSTAGRAM-LIKE HANDLERS
     ====================== */

  const handleLike = () => {
    toggleLike(safeReel.id);
  };

  const handleVideoClick = () => {
    const now = Date.now();
    // Handle double tap for like
    if (now - lastTapRef.current < 300) {
      if (!isLiked(safeReel.id)) {
        toggleLike(safeReel.id);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
      lastTapRef.current = 0; // Reset to prevent triple tap being double tap
      return;
    }

    // Handle single tap for play/pause
    lastTapRef.current = now;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleOpenLikes = () => {
    setShowLikes(true);
  };

  const handleOpenComments = () => {
    if (typeof onComment === "function") {
      onComment(safeReel.id);
    } else {
      setShowComments(true);
    }
  };

  const handleAddToCart = (platform) => {
    const targetPlatform = (typeof platform === 'string') ? platform : 'ZOMATO';
    addToCartFromReel(safeReel.id, targetPlatform);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const handleFollow = (e) => {
    e.stopPropagation();
    if (safeReel.restaurantId) {
      const isFollowing = getFollowStatus(safeReel.restaurantId, safeReel.isFollowing);
      toggleRestaurantFollow(safeReel.restaurantId, isFollowing);
      setLocalFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    toggleSave(safeReel.id);
  };

  /* ======================
     KEYBOARD SUPPORT
     ====================== */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "l" || e.key === "L") handleLike();
      if (e.key === "c" || e.key === "C") handleOpenComments();
      if (e.key === " ") {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
          else { videoRef.current.pause(); setIsPlaying(false); }
        }
      }
      if (e.key === "Escape") {
        setShowComments(false);
        setShowLikes(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className={`reel-wrapper ${active ? 'active-reel' : ''}`}>
      <div className="reel-card">
        {/* VIDEO */}
        <video
          ref={videoRef}
          src={safeReel.videoSrc}
          loop
          muted={isMuted}
          playsInline
          className="reel-video"
          onClick={handleVideoClick}
        />

        {/* Play/Pause Indicator */}
        {!isPlaying && active && (
          <div className="play-pause-indicator">
            <IoPlay />
          </div>
        )}

        {/* Mute Toggle */}
        <button className="mute-btn-floating" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
          {isMuted ? <IoVolumeMuteOutline /> : <IoVolumeHighOutline />}
        </button>

        {/* HEART ANIMATION */}
        {showHeart && <div className="heart-pop"><IoHeart /></div>}

        {/* OVERLAY INFO */}
        <div className="reel-overlay">
          <div className="reel-info">
            <h3 className="reel-title">{safeReel.dishName}</h3>

            {safeReel.restaurantName && (
              <div
                className="reel-restaurant-badge-new clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRestaurantDetail(true);
                }}
              >
                <span className="venue-icon"><IoLocationSharp /></span>
                <span className="res-name">
                  {safeReel.restaurantName}
                  {safeReel.isVerified && (
                    <IoCheckmarkCircle style={{ color: '#10B981', marginLeft: '4px', verticalAlign: 'middle' }} />
                  )}
                </span>
                <span className="followers-count-dot">•</span>
                <span className="followers-count-mini">{localFollowersCount} followers</span>
              </div>
            )}

            {safeReel.caption && (
              <div className="reel-caption-container">
                <p className={`reel-caption ${showFullCaption ? 'full' : ''}`}>
                  {safeReel.caption}
                </p>
                {safeReel.caption.length > 60 && (
                  <button
                    className="read-more-btn"
                    onClick={(e) => { e.stopPropagation(); setShowFullCaption(!showFullCaption); }}
                  >
                    {showFullCaption ? 'Read less' : '...Read more'}
                  </button>
                )}
              </div>
            )}

            {user && (user.id !== safeReel.creatorId && user._id !== safeReel.creatorId) && (
              <button
                className={`reel-follow-btn-v2 ${getFollowStatus(safeReel.restaurantId, safeReel.isFollowing) ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {getFollowStatus(safeReel.restaurantId, safeReel.isFollowing) ?
                  <><IoCheckmarkDoneOutline /> Following</> :
                  <><IoPersonAddOutline /> Follow</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="reel-actions">
          {/* LIKE */}
          <div className="action-item">
            <div className="btn-glow-wrapper">
              <button className={`action-btn ${isLiked(safeReel.id) ? 'liked' : ''}`} onClick={handleLike}>
                {isLiked(safeReel.id) ? <IoHeart className="icon-filled" /> : <IoHeartOutline />}
              </button>
              <div className="btn-glow"></div>
            </div>
            <span
              className="action-count clickable"
              onClick={handleOpenLikes}
            >
              {getLikeCount(safeReel.id)}
            </span>
          </div>

          {/* COMMENT */}
          <div className="action-item">
            <div className="btn-glow-wrapper">
              <button className="action-btn" onClick={handleOpenComments}>
                <IoChatbubbleEllipsesOutline />
              </button>
              <div className="btn-glow"></div>
            </div>
            <span className="action-count">
              {getCommentCount(safeReel.id)}
            </span>
          </div>

          {/* ADD TO CART */}
          <div className="action-item">
            <div className="btn-glow-wrapper">
              <button className="action-btn cart-btn" onClick={handleAddToCart}>
                <IoCartOutline />
              </button>
              <div className="btn-glow"></div>
            </div>
          </div>

          {/* SAVE */}
          <div className="action-item">
            <div className="btn-glow-wrapper">
              <button
                className={`action-btn ${isSaved(safeReel.id) ? 'saved' : ''}`}
                onClick={handleSave}
              >
                {isSaved(safeReel.id) ? <IoBookmark className="icon-filled" /> : <IoBookmarkOutline />}
              </button>
              <div className="btn-glow"></div>
            </div>
          </div>
        </div>

        {/* COMMENTS MODAL fall back (only if onComment not provided) */}
        {showComments && (
          <CommentsModal
            reelId={safeReel.id}
            onClose={() => setShowComments(false)}
          />
        )}

        {showRestaurantDetail && (
          <RestaurantDetailCard
            restaurantId={safeReel.restaurantId}
            onClose={() => setShowRestaurantDetail(false)}
          />
        )}
      </div>

      {/* LIKES MODAL AND CART NOTIFICATION */}
      {showLikes && (
        <LikesListModal
          reelId={safeReel.id}
          onClose={() => setShowLikes(false)}
        />
      )}

      {showCartNotification && <CartNotification />}
    </div>
  );
}
