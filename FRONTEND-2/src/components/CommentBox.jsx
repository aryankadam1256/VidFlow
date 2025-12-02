// src/components/CommentBox.jsx
import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { commentAPI, likeAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CommentBox = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [commentLikes, setCommentLikes] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getVideoComments(videoId);
      const fetchedComments = response.data.data || [];
      setComments(fetchedComments);

      // Fetch like status for each comment
      if (isAuthenticated) {
        const likesData = {};
        for (const comment of fetchedComments) {
          try {
            const likeRes = await likeAPI.getCommentLikeCount(comment._id);
            likesData[comment._id] = {
              count: likeRes.data.data?.count || 0,
              liked: !!likeRes.data.data?.liked
            };
          } catch (error) {
            likesData[comment._id] = { count: 0, liked: false };
          }
        }
        setCommentLikes(likesData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await commentAPI.addComment(videoId, newComment);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await commentAPI.updateComment(commentId, editText);
      setEditingComment(null);
      setEditText('');
      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentAPI.deleteComment(commentId);
        await fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) return;

    try {
      await likeAPI.toggleCommentLike(commentId);

      // Update local state
      setCommentLikes(prev => {
        const current = prev[commentId] || { count: 0, liked: false };
        return {
          ...prev,
          [commentId]: {
            count: current.liked ? Math.max(0, current.count - 1) : current.count + 1,
            liked: !current.liked
          }
        };
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder:text-slate-400"
                rows="3"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="px-4 py-2 bg-brand-gradient text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-opacity"
                >
                  {isLoading ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const likeData = commentLikes[comment._id] || { count: 0, liked: false };

          return (
            <div key={comment._id} className="flex space-x-3">
              <img
                src={comment.owner?.avatar || '/default-avatar.png'}
                alt={comment.owner?.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{comment.owner?.username}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(comment.createdAt)}</span>
                </div>

                {editingComment === comment._id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                      rows="2"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditComment(comment._id)}
                        className="px-3 py-1 bg-brand-gradient text-white text-sm rounded-lg hover:opacity-90 font-medium transition-opacity"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        disabled={!isAuthenticated}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${likeData.liked
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue border border-brand-blue/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{likeData.count > 0 ? formatCount(likeData.count) : 'Like'}</span>
                      </button>

                      {comment.owner?._id === user?._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditText(comment.content);
                            }}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-error font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentBox;