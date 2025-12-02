import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { videoAPI, recommendAPI, likeAPI, subscriptionAPI, dashboardAPI, channelAPI } from '../api';
import VideoPlayer from '../components/VideoPlayer';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import CommentBox from '../components/CommentBox';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  useEffect(() => {
    // Reset state when navigating to a new video
    setVideo(null);
    setError(null);
    setRelated([]);

    // Fetch data in parallel
    fetchVideo();
    fetchRelated();
  }, [videoId]);

  // Refresh stats when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && videoId) {
        fetchVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [videoId]);

  const fetchVideo = async () => {
    if (!videoId) return;

    try {
      setIsLoading(true);
      const response = await videoAPI.getVideoById(videoId);
      setVideo(response.data.data);

      try {
        const likeRes = await likeAPI.getVideoLikeCount(videoId);
        setLikeCount(likeRes.data.data.count || 0);
        setLiked(!!likeRes.data.data.liked);
      } catch (e) { console.debug(e); }

      try {
        const ownerId = response.data.data?.ownerDetails?._id;
        const ownerUsername = response.data.data?.ownerDetails?.username;
        if (ownerId) {
          const statsRes = await dashboardAPI.getChannelStats(ownerId);
          setSubCount(statsRes.data.data?.totalSubscribers || 0);
        }
        if (ownerUsername) {
          const profileRes = await channelAPI.getByUsername(ownerUsername);
          setIsSubscribed(!!profileRes.data.data?.isSubscribed);
        }
      } catch (e) { console.debug(e); }

      if (isAuthenticated) {
        // Log watch event and update view count in real-time
        recommendAPI.logWatch(videoId)
          .then((response) => {
            if (response?.data?.data?.views !== undefined) {
              setVideo(prev => prev ? { ...prev, views: response.data.data.views } : prev);
            }
          })
          .catch((err) => console.error('Error logging watch:', err));
      }
      // fetchRelated is called in useEffect now
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelated = async () => {
    try {
      setRelatedLoading(true);
      const response = await recommendAPI.related(videoId);
      setRelated(response.data.data || []);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      setRelated([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;

    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount((c) => (newLikedState ? c + 1 : Math.max(0, c - 1)));

    if (newLikedState) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 400); // Reset animation
    }

    try {
      await likeAPI.toggleVideoLike(videoId);
      recommendAPI.logLike(videoId).catch(() => { });
    } catch (e) {
      console.error('Error toggling like:', e);
      // Revert on error
      setLiked(!newLikedState);
      setLikeCount((c) => (!newLikedState ? c + 1 : Math.max(0, c - 1)));
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated || !video?.ownerDetails?._id) return;
    try {
      setSubLoading(true);
      await subscriptionAPI.toggle(video.ownerDetails._id);
      setIsSubscribed((prev) => !prev);
      setSubCount((c) => (isSubscribed ? Math.max(0, c - 1) : c + 1));

      const statsRes = await dashboardAPI.getChannelStats(video.ownerDetails._id);
      setSubCount(statsRes.data.data?.totalSubscribers || 0);
    } catch (e) {
      console.error('Error toggling subscribe:', e);
    } finally {
      setSubLoading(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 animate-fade-in">
        <div className="space-y-4">
          <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 text-lg font-medium text-red-500">
          {error || 'Video not found'}
        </div>
        <Link
          to="/"
          className="px-6 py-2 rounded-full bg-brand-blue text-white font-medium hover:bg-brand-blue-dark transition-all hover:scale-105"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
      {/* Main Content (Left) */}
      <div className="space-y-4 animate-slide-up">
        {/* Video Player */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <VideoPlayer src={video.videoFile} poster={video.thumbnail} />
        </div>

        {/* Video Title */}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {video.title}
        </h1>

        {/* Video Metadata & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Views & Date */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${liked
                ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue border border-brand-blue/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''} ${isLikeAnimating ? 'animate-burst text-brand-blue' : ''}`} />
              <span>{likeCount > 0 ? formatViews(likeCount) : 'Like'}</span>
            </button>

            <button className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Channel Info & Subscribe */}
        <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700">
          <Link
            to={`/channel/${video.ownerDetails?.username}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={video.ownerDetails?.avatar || '/default-avatar.png'}
              alt={video.ownerDetails?.username}
              className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-brand-blue transition-all"
            />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors">
                {video.ownerDetails?.username}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {formatViews(subCount)} subscribers
              </div>
            </div>
          </Link>

          <button
            onClick={handleToggleSubscribe}
            disabled={subLoading || !isAuthenticated}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${isSubscribed
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              : 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-lg shadow-brand-blue/20'
              }`}
          >
            {subLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Description Box */}
        {video.description && (
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
            <div className={`text-sm text-slate-700 dark:text-slate-300 ${descriptionExpanded ? '' : 'line-clamp-3'}`}>
              {video.description}
            </div>
            <button
              className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white hover:text-brand-blue transition-colors"
            >
              {descriptionExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-4">
          <CommentBox videoId={videoId} />
        </div>
      </div>

      {/* Recommended Videos Sidebar (Right) */}
      <div className="space-y-4 animate-slide-in-right">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recommended
        </h3>

        {relatedLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-700 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : related.length === 0 ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
            No related videos available
          </p>
        ) : (
          <div className="space-y-4">
            {related.map((item, index) => (
              <div
                key={item._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <VideoCard video={item} variant="horizontal" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;