
import React, { useState, useRef, useEffect } from 'react';

interface NameTracerProps {
  onUnlock: () => void;
}

const NameTracer: React.FC<NameTracerProps> = ({ onUnlock }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 引导文字
      ctx.font = 'bold 160px "Ma Shan Zheng"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(253, 230, 138, 0.03)';
      ctx.fillText('禹含', canvas.width / 2, canvas.height / 2);

      // 绘制轨迹
      if (points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fde68a';
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(render);
    };
    render();
  }, [points]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTracing) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // 增加采样率
    setPoints(prev => [...prev.slice(-30), { x, y }]);
    
    if (points.length > 25) {
      onUnlock(); // 快速解锁，不磨叽
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-crosshair bg-[#020617]/40 backdrop-blur-sm"
      onMouseDown={() => setIsTracing(true)}
      onMouseUp={() => setIsTracing(false)}
      onTouchStart={() => setIsTracing(true)}
      onTouchEnd={() => setIsTracing(false)}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center pointer-events-none animate-pulse">
        <h2 className="text-amber-100/60 text-lg tracking-[1.5em] mb-4">呼唤她的名字</h2>
        <p className="text-amber-200/20 text-xs">划过虚空，链接深处</p>
      </div>
    </div>
  );
};

export default NameTracer;
