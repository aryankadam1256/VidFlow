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
        className="group flex gap-3 transition-all hover:bg-neutral-50 rounded-ant-lg p-2 border border-transparent hover:border-neutral-200"
      >
        {/* Thumbnail Container - Ant Design Style */}
        <div className="relative w-[360px] flex-shrink-0 aspect-video overflow-hidden rounded-ant bg-neutral-100">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Duration Badge - Ant Design */}
          <span className="absolute bottom-1 right-1 rounded-ant bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="mb-2 text-base font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <img
              src={video.ownerDetails?.avatar || '/default-avatar.png'}
              alt={video.ownerDetails?.username}
              className="h-6 w-6 rounded-full object-cover"
            />
            <p className="text-xs text-neutral-600 hover:text-primary-600 transition-colors font-medium">
              {video.ownerDetails?.username}
            </p>
          </div>

          <p className="text-sm text-neutral-600 line-clamp-2">
            {video.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/video/${video._id}`}
      className="group block transition-all hover:shadow-ant-md rounded-ant-lg overflow-hidden"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration Badge - Ant Design */}
        <span className="absolute bottom-1 right-1 rounded-ant bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Video Info */}
      <div className="mt-3 flex gap-3">
        {/* Channel Avatar */}
        <img
          src={video.ownerDetails?.avatar || '/default-avatar.png'}
          alt={video.ownerDetails?.username}
          className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
        />

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="mb-1 font-semibold text-sm text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {video.title}
          </h3>

          {/* Channel Name */}
          <p className="text-xs text-neutral-600 mb-0.5 hover:text-primary-600 transition-colors">
            {video.ownerDetails?.username}
          </p>

          {/* Views and Date */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
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