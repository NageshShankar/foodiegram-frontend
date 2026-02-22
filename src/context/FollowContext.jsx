import { createContext, useContext, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [localFollows, setLocalFollows] = useState({}); // { restaurantId: boolean }

  const toggleRestaurantFollow = async (restaurantId, currentStatus) => {
    if (!user) return { success: false, error: 'Please login to follow' };

    // Optimistic UI update
    setLocalFollows(prev => ({
      ...prev,
      [restaurantId]: !currentStatus
    }));

    try {
      const endpoint = `/restaurants/${restaurantId}/${currentStatus ? 'unfollow' : 'follow'}`;
      const method = currentStatus ? 'delete' : 'post';

      await api({
        method,
        url: endpoint
      });

      return { success: true };
    } catch (error) {
      // Revert optimistic update on error
      setLocalFollows(prev => ({
        ...prev,
        [restaurantId]: currentStatus
      }));
      console.error("Error toggling restaurant follow:", error);
      return { success: false, error: error.response?.data?.message || 'Action failed' };
    }
  };

  const getFollowStatus = (restaurantId, backendStatus) => {
    if (localFollows[restaurantId] !== undefined) {
      return localFollows[restaurantId];
    }
    return backendStatus;
  };

  return (
    <FollowContext.Provider value={{ toggleRestaurantFollow, getFollowStatus }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);
