import React, { useEffect, useRef } from 'react';

const DotGridBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const dots = [];
        const spacing = 30;
        const rows = Math.ceil(window.innerHeight / spacing);
        const cols = Math.ceil(window.innerWidth / spacing);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                dots.push({
                    x: j * spacing,
                    y: i * spacing,
                    baseX: j * spacing,
                    baseY: i * spacing,
                    size: 1.5,
                    color: 'rgba(100, 116, 139, 0.2)' // slate-500 with opacity
                });
            }
        }

        let mouse = { x: undefined, y: undefined };

        const handleMouseMove = (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            dots.forEach(dot => {
                const dx = mouse.x - dot.baseX;
                const dy = mouse.y - dot.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * 20; // Repulsion strength
                    const directionY = forceDirectionY * force * 20;

                    dot.x = dot.baseX - directionX;
                    dot.y = dot.baseY - directionY;
                    dot.color = `rgba(37, 99, 235, ${0.2 + force * 0.5})`; // Blue tint on hover
                    dot.size = 1.5 + force * 2;
                } else {
                    if (dot.x !== dot.baseX) {
                        const dx = dot.x - dot.baseX;
                        dot.x -= dx * 0.1;
                    }
                    if (dot.y !== dot.baseY) {
                        const dy = dot.y - dot.baseY;
                        dot.y -= dy * 0.1;
                    }
                    dot.color = 'rgba(100, 116, 139, 0.2)';
                    dot.size = 1.5;
                }

                ctx.fillStyle = dot.color;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
        />
    );
};

export default DotGridBackground;
