
import React, { useRef, useEffect, useState } from 'react';

interface MemoryWeaverProps {
  image: string;
  caption: string;
  onComplete: () => void;
}

const MemoryWeaver: React.FC<MemoryWeaverProps> = ({ image, caption, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const points = useRef<{ x: number, y: number, r: number }[]>([]);
  const isDrawing = useRef(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (isDone) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. 绘制底层：暗色遮罩
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 绘制“编织”出的部分
      ctx.save();
      ctx.beginPath();
      points.current.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 120; // 笔触宽度
      ctx.globalCompositeOperation = 'destination-out';
      ctx.stroke();
      ctx.restore();

      // 3. 绘制底层图片（透过划痕看到）
      ctx.globalCompositeOperation = 'destination-over';
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      
      // 4. 装饰性：在划痕边缘增加“丝绸”感
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      points.current.forEach((p, i) => {
        if (i > 0) {
          ctx.moveTo(p.x + (Math.random()-0.5)*20, p.y + (Math.random()-0.5)*20);
          ctx.lineTo(points.current[i-1].x, points.current[i-1].y);
        }
      });
      ctx.stroke();

      requestAnimationFrame(draw);
    };

    img.onload = draw;

    const handleStart = (x: number, y: number) => {
      isDrawing.current = true;
      points.current.push({ x, y, r: 50 });
    };

    const handleMove = (x: number, y: number) => {
      if (!isDrawing.current) return;
      points.current.push({ x, y, r: 50 });
      
      // 计算进度
      if (points.current.length > 100 && !isDone) {
        setIsDone(true);
        setTimeout(onComplete, 2000);
      }
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => isDrawing.current = false;

    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [image, isDone, onComplete]);

  return (
    <div className="fixed inset-0 z-30 cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* 实时飘出的关键词 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isDrawing.current && (
           <div 
            className="absolute text-[9px] tracking-widest text-amber-200/40 uppercase font-serif animate-pulse"
            style={{ 
              left: points.current[points.current.length-1]?.x, 
              top: points.current[points.current.length-1]?.y - 40 
            }}
           >
            Capturing Resonance...
           </div>
        )}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
        {!points.current.length && (
          <div className="animate-in fade-in zoom-in duration-1000">
            <div className="w-16 h-16 border border-amber-200/20 rounded-full mx-auto flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_15px_#fde68a]"></div>
            </div>
            <p className="mt-6 text-[10px] tracking-[0.6em] text-amber-200/40 uppercase">轻触并滑动，编织出你的记忆</p>
          </div>
        )}
      </div>

      {isDone && (
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-1000">
           <img src={image} className="max-w-[80%] max-h-[60%] shadow-2xl rounded-sm border border-white/10 p-1" />
           <p className="mt-12 text-xl font-serif italic text-amber-100/90 px-10 text-center leading-loose">
            “{caption}”
           </p>
        </div>
      )}
    </div>
  );
};

export default MemoryWeaver;
