
import React, { useEffect, useRef } from 'react';

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let particles: any[] = [];
    let clouds: any[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init();
    };

    const init = () => {
      particles = Array.from({ length: 150 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 2,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.05 + 0.02,
        opacity: Math.random() * 0.5 + 0.2
      }));

      clouds = Array.from({ length: 4 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 300 + 200,
        color: `hsla(${Math.random() * 60 + 200}, 70%, 10%, 0.1)`,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      }));
    };

    const animate = () => {
      // 宇宙深空黑
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // 绘制流动的星云云雾
      clouds.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        if (c.x < -c.radius) c.x = window.innerWidth + c.radius;
        if (c.x > window.innerWidth + c.radius) c.x = -c.radius;
        if (c.y < -c.radius) c.y = window.innerHeight + c.radius;
        if (c.y > window.innerHeight + c.radius) c.y = -c.radius;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        grad.addColorStop(0, c.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      });

      // 绘制多层视差星星
      particles.forEach(p => {
        p.y -= p.speed * (p.z + 1);
        if (p.y < 0) p.y = window.innerHeight;

        ctx.fillStyle = `rgba(253, 230, 138, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // 闪烁效果
        if (Math.random() > 0.98) p.opacity = Math.random() * 0.5 + 0.2;
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ width: '100vw', height: '100vh' }} />;
};

export default CosmicBackground;
