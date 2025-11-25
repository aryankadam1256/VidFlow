import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Calendar, Clock } from 'lucide-react';
import { videoAPI } from '../api';
import VideoCard from '../components/VideoCard';

const Trending = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('now'); // 'now', 'week', 'month'

    useEffect(() => {
        fetchTrendingVideos();
    }, [timeRange]);

    const fetchTrendingVideos = async () => {
        try {
            setIsLoading(true);
            // In a real app, you'd pass the timeRange to the API
            // const response = await videoAPI.getTrending(timeRange);

            // For now, we'll fetch all videos and sort them by views/likes locally
            // or use a dedicated endpoint if available.
            // Let's assume we have a getTrending endpoint or use getAllVideos with sort

            let response;
            try {
                response = await videoAPI.getTrending(timeRange);
            } catch (err) {
                // Fallback if specific trending endpoint isn't ready
                response = await videoAPI.getAllVideos({
                    sortBy: 'views',
                    sortType: 'desc',
                    limit: 20
                });
            }

            setVideos(response.data.data || []);
        } catch (error) {
            console.error('Error fetching trending videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white shadow-lg">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                            <Flame className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Trending Now</h1>
                    </div>
                    <p className="text-orange-100 max-w-xl text-lg">
                        See what everyone is watching right now. The hottest videos, viral content, and rising stars all in one place.
                    </p>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10 blur-2xl"></div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <button
                    onClick={() => setTimeRange('now')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${timeRange === 'now'
                        ? 'bg-slate-900 dark:bg-brand-blue text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    <TrendingUp className="h-4 w-4" />
                    <span>Now</span>
                </button>
                <button
                    onClick={() => setTimeRange('week')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${timeRange === 'week'
                        ? 'bg-slate-900 dark:bg-brand-blue text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    <Calendar className="h-4 w-4" />
                    <span>This Week</span>
                </button>
                <button
                    onClick={() => setTimeRange('month')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${timeRange === 'month'
                        ? 'bg-slate-900 dark:bg-brand-blue text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    <Clock className="h-4 w-4" />
                    <span>This Month</span>
                </button>
            </div>

            {/* Video Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-700 mb-3"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {videos.map((video, index) => (
                        <div
                            key={video._id}
                            className="flex gap-4 items-start group animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="text-2xl font-bold text-slate-300 dark:text-slate-600 w-8 pt-8 text-center group-hover:text-brand-blue transition-colors">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <VideoCard video={video} variant="horizontal" />
                            </div>
                        </div>
                    ))}

                    {videos.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <TrendingUp className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No trending videos found</h3>
                            <p className="text-slate-500 dark:text-slate-400">Check back later for more viral content.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Trending;
