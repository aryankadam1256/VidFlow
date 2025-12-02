import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Library, Video, LayoutDashboard, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const menuItems = [
        { path: '/', name: 'Home', icon: Home },
        { path: '/trending', name: 'Trending', icon: TrendingUp },
        { path: '/library', name: 'Library', icon: Library, authRequired: true },
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, authRequired: true },
        { path: '/upload', name: 'Upload', icon: UploadCloud, authRequired: true },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`
                fixed left-0 top-16 h-[calc(100vh-4rem)] 
                bg-white dark:bg-slate-900/95 backdrop-blur-sm 
                border-r border-slate-200 dark:border-slate-800 
                overflow-y-auto overflow-x-hidden z-40 transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
            `}>
                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => {
                        // Skip auth-required items if not authenticated
                        if (item.authRequired && !isAuthenticated) {
                            return null;
                        }

                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                                        ? 'bg-brand-blue/10 text-brand-blue shadow-sm'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-brand-blue/5 hover:text-brand-blue dark:hover:bg-slate-800 dark:hover:text-white'
                                    }
                    ${!isOpen ? 'lg:justify-center lg:px-2' : ''}
                  `}
                                title={!isOpen ? item.name : ''}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-brand-blue' : 'text-slate-500 dark:text-slate-400'}`} />
                                <span className={`${!isOpen ? 'lg:hidden' : ''} whitespace-nowrap`}>{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className={`border-t border-slate-200 dark:border-slate-800 my-4 mx-2 ${!isOpen ? 'lg:mx-4' : ''}`}></div>

                    {/* Subscriptions Section (if authenticated) */}
                    {isAuthenticated && (
                        <div className="px-2 py-2">
                            <h3 className={`px-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${!isOpen ? 'lg:hidden' : ''}`}>
                                Subscriptions
                            </h3>
                            <div className="space-y-1">
                                <Link
                                    to="/subscriptions"
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${!isOpen ? 'lg:justify-center lg:px-2' : ''}`}
                                    title={!isOpen ? "All Subscriptions" : ''}
                                >
                                    <Video className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                    <span className={`${!isOpen ? 'lg:hidden' : ''} whitespace-nowrap`}>All Subscriptions</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={`px-6 py-8 text-xs text-slate-500 dark:text-slate-500 ${!isOpen ? 'lg:hidden' : ''}`}>
                        <p className="mb-2 font-medium">© 2025 VidFlow</p>
                        <p className="text-slate-400 dark:text-slate-600">A modern video platform</p>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default AppSidebar;
