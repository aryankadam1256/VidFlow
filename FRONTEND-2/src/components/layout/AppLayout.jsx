import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import AppSidebar from './AppSidebar';
import AuthModal from './AuthModal';

const AppLayout = ({ children }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

    return (
        <div className="min-h-screen bg-white dark:bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
            {/* Top Navbar */}
            <TopNavbar
                onAuthModalOpen={() => setIsAuthModalOpen(true)}
                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Layout */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <main className={`flex-1 p-6 animate-fade-in transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                    <div className="max-w-[1800px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default AppLayout;
