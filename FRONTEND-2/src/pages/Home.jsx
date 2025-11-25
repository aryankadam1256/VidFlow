import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { videoAPI, recommendAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [isAuthenticated]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      let response;

      if (isAuthenticated) {
        response = await recommendAPI.home();
      } else {
        response = await videoAPI.getAllVideos({ page: 1, limit: 20, sortBy: 'views', sortType: 'desc' });
      }

      setVideos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');

      if (isAuthenticated) {
        try {
          const fallbackResponse = await videoAPI.getAllVideos({ page: 1, limit: 20, sortBy: 'views', sortType: 'desc' });
          setVideos(fallbackResponse.data.data || []);
          setError(null);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white animate-fade-in">
          {isAuthenticated ? 'Recommended For You' : 'Trending Videos'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-700 mb-3"></div>
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mb-4 text-lg font-medium text-red-500">{error}</div>
        <button
          onClick={fetchVideos}
          className="px-6 py-2 rounded-full bg-brand-blue text-white font-medium hover:bg-brand-blue-dark transition-all hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white animate-fade-in">
        {isAuthenticated ? 'Recommended For You' : 'Trending Videos'}
      </h1>

      {/* Empty State */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-scale-in">
          <div className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-300">
            No videos available
          </div>
          <p className="mb-6 text-slate-500 dark:text-slate-400">
            Be the first to upload a video!
          </p>
          {isAuthenticated && (
            <a
              href="/upload"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Upload Video
            </a>
          )}
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div
              key={video._id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;