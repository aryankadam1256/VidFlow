import React, { useEffect, useState } from 'react';
import { dashboardAPI, authAPI } from '../api';
import { BarChart3, Users, Play, Heart, TrendingUp, Calendar, Video as VideoIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`rounded-lg p-2 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm text-emerald-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span className="font-medium">{trend}</span>
                <span className="ml-1 text-slate-500">vs last month</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user first to get channel ID
                const userRes = await authAPI.getCurrentUser();
                const currentUser = userRes.data.data;
                setUser(currentUser);

                // Fetch stats and videos
                const [statsRes, videosRes] = await Promise.all([
                    dashboardAPI.getChannelStats(currentUser._id),
                    dashboardAPI.getChannelVideos(currentUser._id)
                ]);

                setStats(statsRes.data.data);
                setVideos(videosRes.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Channel Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {user?.fullname}</p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Views"
                        value={stats?.totalViews?.toLocaleString() || 0}
                        icon={Play}
                        color="bg-blue-500"
                        trend="+12%"
                    />
                    <StatCard
                        title="Subscribers"
                        value={stats?.totalSubscribers?.toLocaleString() || 0}
                        icon={Users}
                        color="bg-purple-500"
                        trend="+5%"
                    />
                    <StatCard
                        title="Total Likes"
                        value={stats?.totalLikes?.toLocaleString() || 0}
                        icon={Heart}
                        color="bg-pink-500"
                        trend="+8%"
                    />
                    <StatCard
                        title="Total Videos"
                        value={stats?.totalVideos?.toLocaleString() || 0}
                        icon={VideoIcon}
                        color="bg-emerald-500"
                    />
                </div>

                {/* Recent Videos Section */}
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Videos</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Video</th>
                                    <th className="px-6 py-3 font-medium">Visibility</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Views</th>
                                    <th className="px-6 py-3 font-medium">Likes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/video/${video._id}`}
                                                        className="font-medium text-slate-900 hover:text-brand-blue line-clamp-1"
                                                    >
                                                        {video.title}
                                                    </Link>
                                                    <p className="line-clamp-1 text-xs text-slate-500">
                                                        {video.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${video.isPublished
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {video.isPublished ? 'Public' : 'Private'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">
                                            {video.views?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">
                                            {/* Likes count might need to be fetched separately or included in aggregation */}
                                            {video.likesCount || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {videos.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No videos uploaded yet.
                                            <Link to="/upload" className="ml-2 text-brand-blue hover:underline">
                                                Upload your first video
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
