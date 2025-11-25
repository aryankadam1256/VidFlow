import React from 'react';

// Modern, Catchy VidFlow Logo - Dynamic and Eye-catching
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
                    {/* Modern gradient */}
                    <linearGradient id="modern-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>

                    {/* Glow effect */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Dynamic play symbol with flow */}
                <g filter="url(#glow)">
                    {/* Outer ring - rotating effect */}
                    <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="url(#modern-gradient)"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.3"
                    />

                    {/* Inner dynamic shape - abstract V + play */}
                    <path
                        d="M 35 30 L 50 55 L 65 30 L 70 35 L 50 70 L 30 35 Z"
                        fill="url(#modern-gradient)"
                    />

                    {/* Flow accent - curved lines */}
                    <path
                        d="M 70 45 Q 80 50, 70 55"
                        stroke="url(#modern-gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M 75 45 Q 88 50, 75 55"
                        stroke="url(#modern-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.6"
                    />

                    {/* Accent dots */}
                    <circle cx="25" cy="50" r="3" fill="#3b82f6" opacity="0.8" />
                    <circle cx="20" cy="45" r="2" fill="#06b6d4" opacity="0.6" />
                </g>
            </svg>

            {showText && (
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    VidFlow
                </span>
            )}
        </div>
    );
};

export default VidFlowLogo;
