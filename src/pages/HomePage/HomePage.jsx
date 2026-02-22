import React, { useState, useRef, useEffect } from "react";
import { useLike } from "../../context/LikeContext";
import { useComment } from "../../context/CommentContext";
import { useCart } from "../../context/CartContext";
import { useSaved } from "../../context/SavedContext";

import Sidebar from "../../components/Sidebar/Sidebar";
import ReelCard from "../../components/ReelCard";
import CommentsModal from "../CommentsModal";
import LikesListModal from "../../components/LikesListModal";

import api from "../../utils/api";
import { getAssetUrl } from "../../config";
import "./HomePage.css";

const HomePage = () => {
  const { toggleLike, setInitialLikes } = useLike();
  const { getCommentCount, setInitialComments } = useComment();
  const { addToCartFromReel, cartPanelOpen } = useCart();
  const { setInitialSavedStatus } = useSaved();

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentReelId, setCommentReelId] = useState(null);
  const [likesReelId, setLikesReelId] = useState(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await api.get('/reels');
        const reelData = response.data.data || [];
        setReels(reelData);
        setInitialLikes(reelData);
        setInitialComments(reelData);
        setInitialSavedStatus(reelData);
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  /* =======================
     SCROLL STATE
     ======================= */
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* =======================
     ACTIONS
     ======================= */
  const handleLike = (reelId) => toggleLike(reelId);

  const handleOpenComments = (reelId) => {
    setLikesReelId(null);
    setCommentReelId(reelId);
  };

  const handleOpenLikes = (reelId) => {
    setCommentReelId(null);
    setLikesReelId(reelId);
  };

  const handleAddToCart = (reelId) => {
    addToCartFromReel(reelId); // ✅ opens cart panel
  };

  const closeComments = () => setCommentReelId(null);
  const closeLikes = () => setLikesReelId(null);

  /* =======================
     SCROLL LOGIC
     ======================= */
  const scrollToReel = (index) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;

    const container = containerRef.current;
    const reelElements = container.querySelectorAll(".reel-wrapper");

    if (reelElements[index]) {
      reelElements[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentIndex(index);
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  };

  const scrollUp = () => {
    if (currentIndex > 0) scrollToReel(currentIndex - 1);
  };

  const scrollDown = () => {
    if (currentIndex < reels.length - 1) {
      scrollToReel(currentIndex + 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    const handleWheel = (e) => {
      // If any modal/overlay is open, let the user scroll normally within it
      if (document.querySelector('.modal-overlay') ||
        document.querySelector('.restaurant-detail-overlay') ||
        document.querySelector('.cart-panel-overlay')) {
        return;
      }

      e.preventDefault();
      if (isScrollingRef.current) return;

      if (e.deltaY > 0) scrollDown();
      else scrollUp();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, loading, reels.length]);

  /* =======================
     OVERLAY STATE
     ======================= */
  const isOverlayOpen =
    Boolean(commentReelId) ||
    Boolean(likesReelId) ||
    Boolean(cartPanelOpen);

  if (loading) {
    return (
      <div className="homepage">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-layout-wrapper">
      <Sidebar />

      <div className="homepage">

        <div className="reels-container" ref={containerRef}>
          {reels.map((reel, index) => (
            <div className="reel-wrapper" key={reel._id || reel.id}>
              <ReelCard
                active={index === currentIndex}
                reel={{
                  ...reel,
                  id: reel._id || reel.id,
                  dishName: reel.foodName || 'Tasty Dish',
                  caption: reel.caption,
                  isFollowing: reel.isFollowing,
                  creatorName: reel.creator?.name || 'Anonymous',
                  username: reel.creator?.username || reel.creator?.name?.toLowerCase().replace(/\s+/g, '') || 'user',
                  creatorId: reel.creator?._id || reel.creator?.id,
                  restaurantName: reel.restaurant?.restaurantName || reel.restaurant?.name || 'Unknown Restaurant',
                  restaurantId: reel.restaurant?._id || reel.restaurant?.id,
                  followersCount: reel.creator?.followersCount || 0,
                  zomatoLink: reel.restaurant?.zomatoLink,
                  swiggyLink: reel.restaurant?.swiggyLink,
                  prices: reel.prices || [],
                  isVerified: reel.restaurant?.isVerified,
                  videoSrc: getAssetUrl(reel.videoUrl || reel.videoSrc)
                }}
                onLike={handleLike}
                onComment={handleOpenComments}
                onShowLikes={handleOpenLikes}
                onAddToCart={handleAddToCart}
                commentCount={getCommentCount(reel._id || reel.id)}
              />
            </div>
          ))}
        </div>

        {!isOverlayOpen && (
          <>
            <button className="scroll-btn scroll-up" onClick={scrollUp}>▲</button>
            <button className="scroll-btn scroll-down" onClick={scrollDown}>▼</button>
          </>
        )}

        {commentReelId && (
          <CommentsModal reelId={commentReelId} onClose={closeComments} />
        )}

        {likesReelId && (
          <LikesListModal reelId={likesReelId} onClose={closeLikes} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
