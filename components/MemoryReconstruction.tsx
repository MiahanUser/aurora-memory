
import React, { useState, useEffect, useRef } from 'react';

interface MemoryReconstructionProps {
  image: string;
  onComplete: () => void;
  caption: string;
}

const GRID_SIZE = 4;

const MemoryReconstruction: React.FC<MemoryReconstructionProps> = ({ image, onComplete, caption }) => {
  const [tiles, setTiles] = useState<{ id: number; currentX: number; currentY: number; targetX: number; targetY: number; isFixed: boolean }[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化碎片
    const initialTiles = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        initialTiles.push({
          id: y * GRID_SIZE + x,
          targetX: (x / GRID_SIZE) * 100,
          targetY: (y / GRID_SIZE) * 100,
          currentX: (Math.random() * 80 + 10),
          currentY: (Math.random() * 80 + 10),
          isFixed: false
        });
      }
    }
    setTiles(initialTiles);
  }, [image]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealing) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const mouseX = ((clientX - rect.left) / rect.width) * 100;
    const mouseY = ((clientY - rect.top) / rect.height) * 100;

    setTiles(prev => {
      let allFixed = true;
      const next = prev.map(tile => {
        if (tile.isFixed) return tile;

        const dx = mouseX - tile.currentX;
        const dy = mouseY - tile.currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 如果鼠标靠近，产生引力
        let nx = tile.currentX;
        let ny = tile.currentY;
        
        if (dist < 15) {
          nx += dx * 0.1;
          ny += dy * 0.1;
        }

        // 检查是否到达目标点
        const distToTarget = Math.sqrt(Math.pow(nx - tile.targetX, 2) + Math.pow(ny - tile.targetY, 2));
        const isFixed = distToTarget < 3;

        if (!isFixed) allFixed = false;

        return { ...tile, currentX: isFixed ? tile.targetX : nx, currentY: isFixed ? tile.targetY : ny, isFixed };
      });

      if (allFixed && !isRevealing) {
        setIsRevealing(true);
        setTimeout(onComplete, 3000);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full max-w-2xl aspect-video glass-card overflow-hidden group"
         ref={containerRef}
         onMouseMove={handleMouseMove}
         onTouchMove={handleMouseMove}>
      
      {/* 完整背景（暗） */}
      <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-105" alt="memory-bg" />
      
      {/* 碎片渲染 */}
      {tiles.map(tile => (
        <div
          key={tile.id}
          className={`absolute transition-opacity duration-1000 ${tile.isFixed ? 'z-10' : 'z-20'}`}
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${tile.currentX}%`,
            top: `${tile.currentY}%`,
            backgroundImage: `url(${image})`,
            backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
            backgroundPosition: `${(tile.id % GRID_SIZE) * (100 / (GRID_SIZE - 1))}% ${Math.floor(tile.id / GRID_SIZE) * (100 / (GRID_SIZE - 1))}%`,
            boxShadow: tile.isFixed ? 'none' : '0 0 10px rgba(253, 230, 138, 0.3)',
            border: tile.isFixed ? 'none' : '1px solid rgba(253, 230, 138, 0.1)',
            opacity: isRevealing ? 0 : 1
          }}
        />
      ))}

      {/* 揭晓动画 */}
      {isRevealing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 z-30 bg-[#020617]/40 backdrop-blur-md">
          <img src={image} className="w-4/5 shadow-2xl border-4 border-white/5" alt="memory-revealed" />
          <div className="mt-8 px-10 text-center animate-in slide-in-from-bottom-4 duration-1000 delay-500">
            <p className="text-amber-100/90 font-serif italic text-lg leading-relaxed">
              “{caption}”
            </p>
          </div>
        </div>
      )}

      {/* 提示语 */}
      {!isRevealing && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-amber-200/20 uppercase pointer-events-none">
          移动光标捕获星尘碎片，重构记忆
        </div>
      )}
    </div>
  );
};

export default MemoryReconstruction;
