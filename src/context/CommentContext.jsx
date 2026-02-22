import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CommentContext = createContext();

export const useComment = () => useContext(CommentContext);

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState({});
  const { user } = useAuth();

  const addComment = async (reelId, text) => {
    if (!user) return;

    try {
      const response = await api.post(`/reels/${reelId}/comment`, {
        text,
        username: user.name || user.username
      });

      const newComments = response.data.data; // Backend returns updated comments array in data property

      setComments(prev => ({
        ...prev,
        [reelId.toString()]: newComments
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const getComments = (reelId) => {
    return comments[reelId?.toString()] || [];
  };

  const getCommentCount = (reelId) => {
    return (comments[reelId?.toString()] || []).length;
  };

  const setInitialComments = (reelsData) => {
    const initialComments = {};
    reelsData.forEach(reel => {
      const id = (reel._id || reel.id)?.toString();
      if (id) initialComments[id] = reel.comments || [];
    });
    setComments(initialComments);
  };

  // Replies
  const addReply = async (reelId, commentId, text) => {
    if (!user) return;
    try {
      const response = await api.post(`/reels/${reelId}/comment/${commentId}/reply`, { text });
      const updatedComments = response.data.data;
      setComments(prev => ({
        ...prev,
        [reelId.toString()]: updatedComments
      }));
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const deleteReply = async (reelId, commentId, replyId) => {
    if (!user) return;
    try {
      await api.delete(`/reels/${reelId}/comment/${commentId}/reply/${replyId}`);
      setComments(prev => ({
        ...prev,
        [reelId]: (prev[reelId] || []).map(c => {
          if ((c._id || c.id) === commentId) {
            return {
              ...c,
              replies: (c.replies || []).filter(r => (r._id || r.id) !== replyId)
            };
          }
          return c;
        })
      }));
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };
  const deleteComment = async (reelId, commentId) => {
    if (!user) return;
    try {
      await api.delete(`/reels/${reelId}/comment/${commentId}`);
      setComments(prev => ({
        ...prev,
        [reelId.toString()]: (prev[reelId.toString()] || []).filter(c => (c._id || c.id)?.toString() !== commentId.toString())
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <CommentContext.Provider value={{ addComment, deleteComment, getComments, getCommentCount, addReply, deleteReply, setInitialComments }}>
      {children}
    </CommentContext.Provider>
  );
};
