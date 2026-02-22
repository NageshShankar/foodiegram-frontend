import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const LikeContext = createContext();

export const LikeProvider = ({ children }) => {
  const [likes, setLikes] = useState({});
  const { user } = useAuth();

  const toggleLike = async (reelId) => {
    if (!user) return;

    try {
      const response = await api.post(`/reels/${reelId}/like`);
      const newLikes = response.data.likes;

      setLikes(prev => ({
        ...prev,
        [reelId]: newLikes
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const isLiked = (reelId) => {
    const userId = (user?.id || user?._id)?.toString();
    if (!userId) return false;
    return (likes[reelId] || []).some(l => {
      const likedId = (l._id || l).toString();
      return likedId === userId;
    });
  };

  const getLikeCount = (reelId) => {
    return (likes[reelId] || []).length;
  };

  const getLikedUsers = (reelId) => {
    return likes[reelId] || [];
  };

  // Helper to initialize likes from fetched reels
  const setInitialLikes = (reelsData) => {
    const initialLikes = {};
    reelsData.forEach(reel => {
      initialLikes[reel._id || reel.id] = reel.likes || [];
    });
    setLikes(initialLikes);
  };

  return (
    <LikeContext.Provider
      value={{
        toggleLike,
        isLiked,
        getLikeCount,
        getLikedUsers,
        setInitialLikes
      }}
    >
      {children}
    </LikeContext.Provider>
  );
};

export const useLike = () => useContext(LikeContext);
