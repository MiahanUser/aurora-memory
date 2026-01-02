
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StarNode {
  id: number;
  x: number;
  y: number;
  found: boolean;
  pulse: number;
}

interface StarGameProps {
  onComplete: () => void;
}

const StarGame: React.FC<StarGameProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [foundCount, setFoundCount] = useState(0);
  const starsRef = useRef<StarNode[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const totalStars = 5;

  useEffect(() => {
    // 初始化 5 个隐藏星点，排列成一个大致的心形坐标
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;
    const size = Math.min(w, h) * 0.25;

    // 心形方程坐标
    const heartCoords = [
      { x: centerX, y: centerY + size * 0.5 },
      { x: centerX - size, y: centerY - size * 0.4 },
      { x: centerX - size * 0.5, y: centerY - size * 1.1 },
      { x: centerX + size * 0.5, y: centerY - size * 1.1 },
      { x: centerX + size, y: centerY - size * 0.4 },
    ];

    starsRef.current = heartCoords.map((coord, i) => ({
      id: i,
      x: coord.x + (Math.random() - 0.5) * 50, // 稍微偏移增加寻找难度
      y: coord.y + (Math.random() - 0.5) * 50,
      found: false,
      pulse: 0
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制已连接的星线
      const foundStars = starsRef.current.filter(s => s.found);
      if (foundStars.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for(let i = 0; i < foundStars.length - 1; i++) {
          ctx.moveTo(foundStars[i].x, foundStars[i].y);
          ctx.lineTo(foundStars[i+1].x, foundStars[i+1].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      starsRef.current.forEach(star => {
        const dx = mouseRef.current.x - star.x;
        const dy = mouseRef.current.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 探测反馈：越靠近越亮
        const proximity = Math.max(0, 1 - dist / 200);
        
        if (star.found) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#fde68a';
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (proximity > 0) {
          // 隐藏星点的微弱提示
          ctx.fillStyle = `rgba(253, 230, 138, ${proximity * 0.4})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2 + proximity * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = () => {
      starsRef.current.forEach(star => {
        if (!star.found) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 40) {
            star.found = true;
            setFoundCount(prev => {
              const next = prev + 1;
              if (next === totalStars) {
                setTimeout(onComplete, 800);
              }
              return next;
            });
          }
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [onComplete]);

  return (
    <div className="z-20 w-full h-full fixed inset-0 flex flex-col items-center justify-between py-20 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto cursor-crosshair" />
      
      <div className="relative text-center space-y-2 select-none">
        <p className="text-[10px] tracking-[0.5em] text-amber-200/60 uppercase">
          探测中: 正在搜寻禹含的星迹碎片
        </p>
        <div className="h-[2px] w-48 bg-white/5 mx-auto overflow-hidden">
          <div 
            className="h-full bg-amber-200 transition-all duration-700 shadow-[0_0_10px_#fde68a]"
            style={{ width: `${(foundCount / totalStars) * 100}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-amber-200/30">
          已捕获: {foundCount} / {totalStars}
        </p>
      </div>

      <div className="relative group">
        <p className="text-[10px] tracking-[0.3em] text-amber-200/20 italic">
          移动指针探索虚空，点击捕捉发光共振点
        </p>
      </div>
    </div>
  );
};

export default StarGame;
