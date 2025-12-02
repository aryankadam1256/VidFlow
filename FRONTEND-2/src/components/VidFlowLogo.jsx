import React from 'react';

// Option 2: The "Neon Glow" (Cyberpunk/Night Mode)
const VidFlowLogo = ({ className = "h-8 w-8", showText = true }) => {
    return (
        <div className="flex items-center gap-2.5">
            {showText && (
                <span
                    className="font-bold text-2xl tracking-tight text-brand-blue dark:text-white transition-all duration-300 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                >
                    VidFlow
                </span>
            )}
        </div>
    );
};

export default VidFlowLogo;
