
import React, { useEffect, useState } from 'react';

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const newHeart = {
        id,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * (30 - 10) + 10}px`,
        duration: `${Math.random() * (10 - 5) + 5}s`,
      };
      setHearts((prev) => [...prev.slice(-20), newHeart]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-particle absolute bottom-[-50px] text-pink-400 opacity-60"
          style={{
            left: heart.left,
            fontSize: heart.size,
            animationDuration: heart.duration,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
