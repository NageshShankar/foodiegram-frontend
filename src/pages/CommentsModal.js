import React, { useState, useEffect, useRef } from "react";
import { useComment } from "../context/CommentContext";
import { useAuth } from "../context/AuthContext";
import { IoClose, IoChatbubbleOutline } from "react-icons/io5";
import "../styles/CommentsModal.css";

const timeAgo = (date) => {
  if (!date) return "just now";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export default function CommentsModal({ reelId, onClose }) {
  const { user } = useAuth();
  const { getComments, addComment, addReply, deleteComment, deleteReply } = useComment();
  const [newComment, setNewComment] = useState("");
  const [inlineReplyId, setInlineReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type, parentId }
  const [showReplies, setShowReplies] = useState({});
  const replyInputRef = useRef(null);

  const comments = getComments(reelId) || [];

  // Focus inline reply input
  useEffect(() => {
    if (inlineReplyId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [inlineReplyId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(reelId, newComment);
    setNewComment("");
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    addReply(reelId, commentId, replyText);
    setReplyText("");
    setInlineReplyId(null);
    setShowReplies(prev => ({ ...prev, [commentId]: true }));
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const { id, type, parentId } = deleteConfirm;
    if (type === "comment") {
      deleteComment(reelId, id);
    } else {
      deleteReply(reelId, parentId, id);
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="comments-overlay" onClick={onClose} />

      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="grab-bar-container" onMouseDown={onClose}>
          <div className="grab-bar"></div>
        </div>

        <div className="modal-header">
          <span className="title-text">Comments</span>
          <button className="close-button" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">
              <IoChatbubbleOutline className="empty-icon" />
              <p className="empty-text">No comments yet</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id || comment.id} className="comment-wrapper">
                <div className="comment-item">
                  <div className="comment-avatar">
                    {comment.profileImage ? (
                      <img src={comment.profileImage} alt="" className="avatar-img" />
                    ) : (
                      <div className="avatar-img">
                        {(comment.username || "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.username}</span>
                      <span className="comment-dot">·</span>
                      <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <div className="comment-text">{comment.text}</div>

                    <div className="comment-actions">
                      <button
                        className="action-text-btn"
                        onClick={() => {
                          setInlineReplyId(comment._id || comment.id);
                          setReplyText(`@${comment.username} `);
                        }}
                      >
                        Reply
                      </button>

                      {((user?.id || user?._id) === comment.user) && (
                        <div style={{ position: "relative" }}>
                          <button
                            className="action-text-btn delete"
                            onClick={() => setDeleteConfirm({ id: comment._id || comment.id, type: "comment" })}
                          >
                            Delete
                          </button>
                          {deleteConfirm?.id === (comment._id || comment.id) && (
                            <div className="delete-popover">
                              <span className="popover-title">Delete this comment?</span>
                              <div className="popover-actions">
                                <button className="popover-btn cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="popover-btn delete" onClick={handleDelete}>Delete</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Reply Input */}
                    {inlineReplyId === (comment._id || comment.id) && (
                      <div className="inline-reply-container">
                        <div className="inline-input-wrapper">
                          <input
                            ref={replyInputRef}
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddReply(comment._id || comment.id)}
                            placeholder="Add a reply..."
                          />
                          <div className="inline-input-actions">
                            <button className="inline-btn cancel" onClick={() => setInlineReplyId(null)}>Cancel</button>
                            <button
                              className="inline-btn post"
                              disabled={!replyText.trim()}
                              onClick={() => handleAddReply(comment._id || comment.id)}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {(comment.replies || []).length > 0 && (
                  <>
                    {(!showReplies[comment._id || comment.id] && comment.replies.length > 2) ? (
                      <div
                        className="view-replies-link"
                        onClick={() => setShowReplies(prev => ({ ...prev, [comment._id || comment.id]: true }))}
                      >
                        View {comment.replies.length} replies
                      </div>
                    ) : (
                      <div className="replies-list" style={{ display: (showReplies[comment._id || comment.id] || comment.replies.length <= 2) ? "block" : "none" }}>
                        {comment.replies.map((reply) => (
                          <div key={reply._id || reply.id} className="reply-item">
                            <div className="comment-avatar">
                              {reply.profileImage ? (
                                <img src={reply.profileImage} alt="" className="avatar-img" />
                              ) : (
                                <div className="avatar-img">
                                  {(reply.username || "A").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="comment-content">
                              <div className="comment-header">
                                <span className="comment-user">{reply.username}</span>
                                <span className="comment-dot">·</span>
                                <span className="comment-time">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <div className="comment-text">{reply.text}</div>

                              <div className="comment-actions">
                                {((user?.id || user?._id) === reply.user) && (
                                  <div style={{ position: "relative" }}>
                                    <button
                                      className="action-text-btn delete"
                                      onClick={() => setDeleteConfirm({ id: reply._id || reply.id, type: "reply", parentId: comment._id || comment.id })}
                                    >
                                      Delete
                                    </button>
                                    {deleteConfirm?.id === (reply._id || reply.id) && (
                                      <div className="delete-popover">
                                        <span className="popover-title">Delete this reply?</span>
                                        <div className="popover-actions">
                                          <button className="popover-btn cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                          <button className="popover-btn delete" onClick={handleDelete}>Delete</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {comment.replies.length > 2 && (
                          <div
                            className="view-replies-link"
                            style={{ marginLeft: 0 }}
                            onClick={() => setShowReplies(prev => ({ ...prev, [comment._id || comment.id]: false }))}
                          >
                            Hide replies
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="comment-input-container">
          <div className="comment-input-bar">
            <div className="bottom-input-wrapper">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Add a comment..."
              />
            </div>
            <button
              className="post-text-btn"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
