import React from 'react';

// OPTION 1: Modern Wave Flow - Ocean Blue & Teal
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
                    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>

                {/* Wave 1 */}
                <path
                    d="M 20 30 Q 35 20, 50 30 T 80 30 L 80 45 Q 65 35, 50 45 T 20 45 Z"
                    fill="url(#wave-gradient)"
                    opacity="0.9"
                />

                {/* Wave 2 */}
                <path
                    d="M 20 50 Q 35 40, 50 50 T 80 50 L 80 65 Q 65 55, 50 65 T 20 65 Z"
                    fill="url(#wave-gradient)"
                    opacity="0.7"
                />

                {/* Wave 3 */}
                <path
                    d="M 20 70 Q 35 60, 50 70 T 80 70 L 80 85 Q 65 75, 50 85 T 20 85 Z"
                    fill="url(#wave-gradient)"
                    opacity="0.5"
                />

                {/* Play triangle overlay */}
                <path
                    d="M 40 35 L 40 75 L 70 55 Z"
                    fill="#0ea5e9"
                />
            </svg>

            {showText && (
                <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent font-bold text-xl tracking-tight">
                    VidFlow
                </span>
            )}
        </div>
    );
};

export default VidFlowLogo;
