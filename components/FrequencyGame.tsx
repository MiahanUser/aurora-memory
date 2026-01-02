
import React, { useState, useEffect, useRef } from 'react';

interface FrequencyGameProps {
  onComplete: (traits: string[]) => void;
}

const TRAITS = ['温柔的笃定', '明亮的忧郁', '清晨的琥珀', '仲夏的飞鸟', '深秋的晚星'];

const FrequencyGame: React.FC<FrequencyGameProps> = ({ onComplete }) => {
  const [angle, setAngle] = useState(0);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  // 初始化音效引擎
  useEffect(() => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    oscillator.current = audioCtx.current.createOscillator();
    gainNode.current = audioCtx.current.createGain();
    
    oscillator.current.type = 'sine';
    gainNode.current.gain.value = 0;
    
    oscillator.current.connect(gainNode.current);
    gainNode.current.connect(audioCtx.current.destination);
    oscillator.current.start();

    return () => {
      oscillator.current?.stop();
      audioCtx.current?.close();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    setAngle(newAngle);

    // 检查是否对准了某个“频率”
    const normalizedAngle = (newAngle + 180) % 360;
    const targets = [45, 120, 210, 280, 330];
    
    let minDiff = 360;
    targets.forEach((target, idx) => {
      const diff = Math.abs(normalizedAngle - target);
      if (diff < 10 && !activeIndices.includes(idx)) {
        setActiveIndices(prev => {
          const next = [...prev, idx];
          if (next.length === 3) setTimeout(() => onComplete(next.map(i => TRAITS[i])), 1000);
          return next;
        });
      }
      minDiff = Math.min(minDiff, diff);
    });

    // 动态调整音效频率和音量
    if (audioCtx.current && oscillator.current && gainNode.current) {
      const freq = 200 + (360 - minDiff) * 2;
      oscillator.current.frequency.setTargetAtTime(freq, audioCtx.current.currentTime, 0.1);
      const volume = Math.max(0, 0.2 - minDiff / 100);
      gainNode.current.gain.setTargetAtTime(volume, audioCtx.current.currentTime, 0.1);
    }
  };

  return (
    <div 
      className="z-30 fixed inset-0 flex flex-col items-center justify-center cursor-none touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* 核心仪表盘 */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* 外环轨道 */}
        <div className="absolute inset-0 border border-amber-200/10 rounded-full"></div>
        <div className="absolute inset-4 border border-amber-200/5 rounded-full"></div>
        
        {/* 扫描线 */}
        <div 
          className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-200/40 to-amber-200 origin-left left-1/2 shadow-[0_0_15px_rgba(253,230,138,0.5)]"
          style={{ transform: `rotate(${angle}deg)` }}
        ></div>

        {/* 捕获点标识 */}
        {[45, 120, 210, 280, 330].map((t, i) => (
          <div 
            key={i}
            className={`absolute w-1 h-1 rounded-full transition-all duration-1000 ${activeIndices.includes(i) ? 'bg-amber-200 shadow-[0_0_10px_#fde68a] scale-150' : 'bg-amber-200/10'}`}
            style={{ 
              transform: `rotate(${t - 180}deg) translateX(140px)`
            }}
          ></div>
        ))}

        {/* 中心核心 */}
        <div className="relative z-10 text-center">
          <div className="text-[10px] tracking-[0.4em] text-amber-200/40 mb-2 font-light">RESONANCE</div>
          <div className="text-2xl font-calligraphy text-amber-100">
            {activeIndices.length} / 3
          </div>
        </div>
      </div>

      <div className="mt-16 text-center space-y-4">
        <p className="text-[11px] tracking-[0.6em] text-amber-200/30 uppercase animate-pulse">
          {isDragging ? '正在捕获灵魂切片...' : '按下并旋转，寻找禹含的频率'}
        </p>
        <div className="flex justify-center gap-2">
          {activeIndices.map(i => (
            <span key={i} className="px-3 py-1 bg-amber-200/5 border border-amber-200/20 text-[10px] text-amber-200/60 animate-in fade-in slide-in-from-bottom-2">
              #{TRAITS[i]}
            </span>
          ))}
        </div>
      </div>

      {/* 装饰性数据 */}
      <div className="absolute top-10 right-10 text-right font-mono text-[8px] text-amber-200/20 leading-loose">
        SIGNAL_STRENGTH: {(Math.random() * 100).toFixed(2)}%<br/>
        ENCRYPTION: AES-256-LOVE<br/>
        TARGET_ID: G.Y.H
      </div>
    </div>
  );
};

export default FrequencyGame;
