import React from 'react';

// OPTION 3: Liquid Drop - Orange & Red (YouTube-inspired)
const VidFlowLogo = ({ className = "h-8 w-8", showText = true }) => {
    return (
        <div className="flex items-center gap-2.5">
            <svg
                className={className}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="liquid-light" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>

                {/* Main drop shape */}
                <path
                    d="M 50 15 Q 35 30, 35 50 Q 35 70, 50 85 Q 65 70, 65 50 Q 65 30, 50 15 Z"
                    fill="url(#liquid-gradient)"
                />

                {/* Highlight */}
                <ellipse
                    cx="45"
                    cy="35"
                    rx="8"
                    ry="12"
                    fill="url(#liquid-light)"
                    opacity="0.4"
                />

                {/* Play triangle */}
                <path
                    d="M 43 40 L 43 65 L 63 52.5 Z"
                    fill="white"
                />

                {/* Small drops */}
                <circle cx="70" cy="30" r="5" fill="#f97316" opacity="0.6" />
                <circle cx="78" cy="45" r="4" fill="#ef4444" opacity="0.5" />
            </svg>

            {showText && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold text-xl tracking-tight">
                    VidFlow
                </span>
            )}
        </div>
    );
};

export default VidFlowLogo;
