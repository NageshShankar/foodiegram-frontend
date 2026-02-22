import React, { createContext, useContext, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const SavedContext = createContext();

export const SavedProvider = ({ children }) => {
    const [savedReels, setSavedReels] = useState({}); // { [reelId]: boolean }
    const { user } = useAuth();

    const toggleSave = async (reelId) => {
        if (!user) return;

        const currentlySaved = !!savedReels[reelId];

        // Optimistic Update
        setSavedReels(prev => ({
            ...prev,
            [reelId]: !currentlySaved
        }));

        try {
            if (currentlySaved) {
                await api.delete(`/reels/${reelId}/unsave`);
            } else {
                await api.post(`/reels/${reelId}/save`);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            // Rollback on error
            setSavedReels(prev => ({
                ...prev,
                [reelId]: currentlySaved
            }));
        }
    };

    const isSaved = (reelId) => {
        return !!savedReels[reelId];
    };

    const setInitialSavedStatus = (reelsData) => {
        const initialSaved = {};
        if (Array.isArray(reelsData)) {
            reelsData.forEach(reel => {
                initialSaved[reel._id || reel.id] = !!reel.isSaved;
            });
        }
        setSavedReels(prev => ({ ...prev, ...initialSaved }));
    };

    return (
        <SavedContext.Provider
            value={{
                toggleSave,
                isSaved,
                setInitialSavedStatus
            }}
        >
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => useContext(SavedContext);
