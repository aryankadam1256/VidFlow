import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, Bell, User, Mic, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VidFlowLogo from '../VidFlowLogo';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const TopNavbar = ({ onAuthModalOpen, onSidebarToggle }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Theme Toggle Logic
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Voice Search Hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Sync transcript to search query while listening
    useEffect(() => {
        if (listening) {
            setSearchQuery(transcript);
        }
    }, [transcript, listening]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleVoiceSearch = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            setSearchQuery(''); // Clear previous query
            SpeechRecognition.startListening({ continuous: false });
        }
    };

    if (!browserSupportsSpeechRecognition) {
        // Fallback or just hide the mic button logic can be handled inline
    }

    return (
        <nav className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300 animate-slide-down">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
                {/* Left: Logo & Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition-opacity">
                        <VidFlowLogo />
                    </Link>
                </div>

                {/* Center: Search Bar */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 max-w-2xl mx-8 hidden sm:block"
                >
                    <div className="relative group flex items-center">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder={listening ? "Listening..." : "Search videos..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full h-10 pl-4 pr-12 rounded-l-full ${browserSupportsSpeechRecognition ? 'rounded-r-none border-r-0' : 'rounded-r-full'} bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm`}
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-10 px-4 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-brand-blue transition-colors"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Voice Search Button */}
                        {browserSupportsSpeechRecognition && (
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                className={`h-10 px-4 rounded-r-full border-l border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all ${listening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                title="Search with your voice"
                            >
                                <Mic className={`h-5 w-5 ${listening ? 'animate-bounce' : ''}`} />
                            </button>
                        )}
                    </div>
                </form>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 text-slate-700 dark:text-slate-200"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            {/* Trending Link */}
                            <Link
                                to="/trending"
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
                                title="Trending"
                            >
                                <span className="text-xl">🔥</span>
                            </Link>

                            {/* Upload Button */}
                            <Link
                                to="/upload"
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
                                title="Upload Video"
                            >
                                <Upload className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                            </Link>

                            {/* Notifications */}
                            <button
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 relative"
                                title="Notifications"
                            >
                                <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* User Avatar */}
                            <Link to="/profile" className="flex items-center gap-2 ml-2">
                                <img
                                    src={user?.avatar || '/default-avatar.png'}
                                    alt={user?.username}
                                    className="h-9 w-9 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-brand-blue transition-all hover:scale-105"
                                />
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Sign In Button */}
                            <button
                                onClick={onAuthModalOpen}
                                className="px-5 py-2 rounded-full bg-brand-blue text-white text-sm font-medium hover:bg-brand-blue-dark transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Search Bar */}
            <form
                onSubmit={handleSearchSubmit}
                className="sm:hidden px-4 pb-3 flex gap-2"
            >
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder={listening ? "Listening..." : "Search..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-4 pr-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-0 h-9 px-3 flex items-center justify-center text-slate-600 dark:text-slate-400"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>
                {browserSupportsSpeechRecognition && (
                    <button
                        type="button"
                        onClick={handleVoiceSearch}
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${listening
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Mic className="h-4 w-4" />
                    </button>
                )}
            </form>
        </nav>
    );
};

export default TopNavbar;
