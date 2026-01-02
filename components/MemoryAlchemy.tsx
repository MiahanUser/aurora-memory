
import React, { useState, useEffect, useCallback } from 'react';

interface MemoryAlchemyProps {
  image: string;
  onComplete: () => void;
  status: string;
  isReady: boolean;
}

type Grid = (number | null)[][];

const SIZE = 4;
const TARGET = 128;

const MemoryAlchemy: React.FC<MemoryAlchemyProps> = ({ image, onComplete, status, isReady }) => {
  const [grid, setGrid] = useState<Grid>(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
  const [maxTile, setMaxTile] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  // 初始化游戏
  const spawnTile = useCallback((currentGrid: Grid): Grid => {
    const emptyCells: { r: number, c: number }[] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === null) emptyCells.push({ r, c });
      });
    });

    if (emptyCells.length === 0) return currentGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }, []);

  useEffect(() => {
    let initialGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    initialGrid = spawnTile(initialGrid);
    initialGrid = spawnTile(initialGrid);
    setGrid(initialGrid);
  }, [spawnTile]);

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let moved = false;

      // 顺时针旋转 90 度函数
      const rotate = (g: Grid) => g[0].map((_, colIndex) => g.map(row => row[colIndex]).reverse());
      
      /**
       * 旋转逻辑修正：
       * 我们的核心逻辑是“向左滑动合并”。
       * LEFT: 不需要旋转 (0)
       * RIGHT: 旋转 180 度 (2)
       * UP: 旋转 270 度 (3次顺时针)，此时顶部变左侧
       * DOWN: 旋转 90 度 (1次顺时针)，此时底部变左侧
       */
      let rotations = 0;
      if (direction === 'UP') rotations = 3;
      else if (direction === 'RIGHT') rotations = 2;
      else if (direction === 'DOWN') rotations = 1;

      for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

      // 向左滑动并合并
      for (let r = 0; r < SIZE; r++) {
        let originalRow = [...newGrid[r]];
        let row = newGrid[r].filter(cell => cell !== null) as number[];
        
        for (let c = 0; c < row.length - 1; c++) {
          if (row[c] === row[c + 1]) {
            row[c] *= 2;
            row.splice(c + 1, 1);
            moved = true;
          }
        }
        
        while (row.length < SIZE) row.push(null as any);
        
        if (JSON.stringify(originalRow) !== JSON.stringify(row)) moved = true;
        newGrid[r] = row;
      }

      // 旋转回来
      for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

      if (moved) {
        newGrid = spawnTile(newGrid);
        let currentMax = 0;
        newGrid.forEach(row => row.forEach(cell => {
          if (cell && cell > currentMax) currentMax = cell;
        }));
        setMaxTile(currentMax);
        if ('vibrate' in navigator) navigator.vibrate(12);
      }
      return newGrid;
    });
  }, [spawnTile]);

  // 手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) { // 稍微降低阈值提升灵敏度
      if (absX > absY) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    setTouchStart(null);
  };

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('UP');
      if (e.key === 'ArrowDown') move('DOWN');
      if (e.key === 'ArrowLeft') move('LEFT');
      if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // 检查结束条件
  useEffect(() => {
    if (maxTile >= TARGET && isReady) {
      setTimeout(onComplete, 1200);
    }
  }, [maxTile, isReady, onComplete]);

  const getTileColor = (val: number | null) => {
    if (!val) return 'bg-white/5';
    const colors: Record<number, string> = {
      2: 'bg-amber-100/10 text-amber-100/40',
      4: 'bg-amber-200/20 text-amber-100/60',
      8: 'bg-amber-300/30 text-amber-100/80',
      16: 'bg-amber-400/40 text-amber-50',
      32: 'bg-amber-500/50 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]',
      64: 'bg-amber-600/60 text-white shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      128: 'bg-yellow-400 text-black font-bold shadow-[0_0_40px_rgba(253,224,71,1)] scale-105',
    };
    return colors[val] || 'bg-yellow-500 text-white';
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center safe-pt safe-pb touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景透出效果 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-2xl pointer-events-none">
        <img src={image} className="w-[120%] h-[120%] object-cover scale-150 rotate-12" />
      </div>

      <div className="z-10 text-center mb-6 space-y-2">
        <h3 className="font-calligraphy text-4xl text-amber-100 chromatic-glow">记忆方块</h3>
        <div className="flex items-center justify-center gap-4">
          <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="font-cinzel text-[10px] tracking-widest text-amber-200/60">GOAL: {TARGET}</span>
          </div>
          <div className="px-4 py-1 rounded-full bg-amber-200/10 border border-amber-200/20 transition-all duration-300">
            <span className="font-cinzel text-[10px] tracking-widest text-amber-200">MAX: {maxTile}</span>
          </div>
        </div>
      </div>

      {/* 2048 棋盘 - 强制正方形 */}
      <div className="z-10 bg-white/[0.02] backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl relative">
        <div className="grid grid-cols-4 gap-2 w-[85vw] h-[85vw] md:w-[32rem] md:h-[32rem] aspect-square">
          {grid.map((row, r) => row.map((cell, c) => (
            <div 
              key={`${r}-${c}`}
              className={`flex items-center justify-center rounded-lg transition-all duration-300 text-2xl font-cinzel aspect-square select-none overflow-hidden ${getTileColor(cell)}`}
            >
              {cell}
            </div>
          )))}
        </div>
      </div>

      {/* 底部引导 */}
      <div className="z-10 mt-10 w-full px-10 text-center space-y-5">
        <div className="space-y-1">
          <p className="font-calligraphy text-amber-100/60 text-xl">滑动重组记忆碎片</p>
          <p className="font-cinzel text-[8px] tracking-[0.5em] text-white/20 uppercase">Merge the moments of Han</p>
        </div>

        <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
          <div 
            className="absolute inset-0 bg-amber-200 shadow-[0_0_15px_#fde68a] transition-all duration-500"
            style={{ width: `${Math.min((maxTile / TARGET) * 100, 100)}%` }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-amber-200/40 animate-pulse tracking-widest">{status}</p>
            {maxTile >= TARGET && (
              <span className="text-[10px] text-amber-400 font-bold uppercase animate-bounce tracking-widest">
                {isReady ? 'Vision Crystallized' : 'Synchronizing Soul Patterns...'}
              </span>
            )}
        </div>
      </div>

      <style>{`
        .chromatic-glow {
          text-shadow: 2px 0 rgba(255,0,0,0.3), -2px 0 rgba(0,255,255,0.3), 0 0 10px rgba(253,230,138,0.4);
        }
      `}</style>
    </div>
  );
};

export default MemoryAlchemy;
