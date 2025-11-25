import React from 'react';

// OPTION 2: Geometric Stream - Deep Purple & Magenta
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
                    <linearGradient id="geo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>

                {/* Hexagon 1 - Large */}
                <path
                    d="M 50 15 L 70 27.5 L 70 52.5 L 50 65 L 30 52.5 L 30 27.5 Z"
                    fill="url(#geo-gradient)"
                />

                {/* Hexagon 2 - Small top right */}
                <path
                    d="M 75 25 L 85 31 L 85 43 L 75 49 L 65 43 L 65 31 Z"
                    fill="#ec4899"
                    opacity="0.7"
                />

                {/* Hexagon 3 - Small bottom left */}
                <path
                    d="M 25 57 L 35 63 L 35 75 L 25 81 L 15 75 L 15 63 Z"
                    fill="#7c3aed"
                    opacity="0.7"
                />

                {/* Play symbol inside */}
                <path
                    d="M 45 35 L 45 55 L 60 45 Z"
                    fill="white"
                />
            </svg>

            {showText && (
                <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent font-bold text-xl tracking-tight">
                    VidFlow
                </span>
            )}
        </div>
    );
};

export default VidFlowLogo;
