import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import AppSidebar from './AppSidebar';
import AuthModal from './AuthModal';

const AppLayout = ({ children }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Top Navbar */}
            <TopNavbar onAuthModalOpen={() => setIsAuthModalOpen(true)} />

            {/* Main Layout */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-6 animate-fade-in">
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
