import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video, variant = 'vertical' }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/video/${video._id}`}
        className="group flex gap-4 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 card-hover animate-fade-in"
      >
        {/* Thumbnail Container */}
        <div className="relative w-[360px] flex-shrink-0 aspect-video overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-blue transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <img
              src={video.ownerDetails?.avatar || '/default-avatar.png'}
              alt={video.ownerDetails?.username}
              className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <p className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-colors font-medium">
              {video.ownerDetails?.username}
            </p>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {video.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/video/${video._id}`}
      className="group block rounded-xl overflow-hidden card-hover animate-fade-in"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700 mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Video Info */}
      <div className="flex gap-3 px-1">
        {/* Channel Avatar */}
        <img
          src={video.ownerDetails?.avatar || '/default-avatar.png'}
          alt={video.ownerDetails?.username}
          className="h-9 w-9 flex-shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700"
        />

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="mb-1 font-semibold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-blue transition-colors">
            {video.title}
          </h3>

          {/* Channel Name */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 hover:text-brand-blue transition-colors">
            {video.ownerDetails?.username}
          </p>

          {/* Views and Date */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-500">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;