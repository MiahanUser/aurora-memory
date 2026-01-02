
import React, { useState, useCallback, useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import NameTracer from './components/NameTracer';
import MemoryAlchemy from './components/MemoryAlchemy';
import DeploymentGuide from './components/DeploymentGuide';
import { generateVisionInOneGo } from './services/geminiService';

enum GameState {
  LOCKED,
  START,
  UPLOAD,
  ALCHEMY,
  RESULT
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOCKED);
  const [image, setImage] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<{imageUrl: string, poem: string} | null>(null);
  const [alchemyStatus, setAlchemyStatus] = useState("Memory Engine Initializing...");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const startAnalysis = useCallback(async (base64: string) => {
    try {
      setAlchemyStatus("正在编织时空维度...");
      const result = await generateVisionInOneGo(base64, "郭禹含");
      if (result) {
        setFinalResult(result);
        setAlchemyStatus("次元映像已就绪");
      } else {
        throw new Error("Generation failed");
      }
    } catch (e) {
      setAlchemyStatus("星际信号干扰，正在重试...");
      setTimeout(() => startAnalysis(base64), 2000);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setGameState(GameState.ALCHEMY);
      startAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#020617] text-slate-200 overflow-hidden select-none safe-pt safe-pb">
      <CosmicBackground />
      <div className="cinematic-vignette fixed inset-0 z-10" />
      
      {/* 隐藏的部署助手入口 */}
      {gameState === GameState.START && (
        <button 
          onClick={() => setShowGuide(true)}
          className="fixed top-8 right-8 z-[60] p-4 text-amber-200/20 hover:text-amber-200/60 transition-colors"
          title="部署指南"
        >
          ✦
        </button>
      )}

      {showGuide && <DeploymentGuide onClose={() => setShowGuide(false)} />}
      
      {gameState === GameState.LOCKED && (
        <NameTracer onUnlock={() => setGameState(GameState.START)} />
      )}

      {gameState === GameState.START && (
        <div className="z-20 text-center space-y-24 animate-in fade-in zoom-in duration-1000 px-10">
          <div className="space-y-6">
            <h1 className="text-[120px] md:text-[180px] font-calligraphy text-amber-100 chromatic-glow">
              禹含
            </h1>
            <div className="flex items-center justify-center gap-6">
                <div className="h-[0.5px] w-12 bg-amber-200/20" />
                <p className="font-cinzel text-amber-200/30 tracking-[1.5em] text-[10px] uppercase">Fragments of Eternity</p>
                <div className="h-[0.5px] w-12 bg-amber-200/20" />
            </div>
          </div>
          <button 
            onClick={() => setGameState(GameState.UPLOAD)}
            className="group relative px-20 py-6 overflow-hidden rounded-full border border-amber-200/10 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(253,230,138,0.1)]"
          >
            <div className="absolute inset-0 bg-amber-200/[0.05] group-hover:bg-amber-200/[0.15] transition-colors" />
            <span className="relative z-10 text-amber-100/60 group-hover:text-amber-100 tracking-[1.2em] text-[12px] uppercase transition-all shimmer-text">唤醒记忆</span>
          </button>
        </div>
      )}

      {gameState === GameState.UPLOAD && (
        <div className="z-20 text-center animate-in fade-in slide-in-from-bottom-20 duration-1000 px-6">
          <div className="mb-20 space-y-4">
            <h2 className="text-4xl font-calligraphy text-amber-100/90 chromatic-glow">献上她的时光</h2>
            <p className="font-cinzel text-[10px] tracking-[0.5em] text-amber-200/20 uppercase">A portal to her world</p>
          </div>
          <label className="block w-64 h-64 mx-auto relative group cursor-pointer active:scale-90 transition-all">
            <div className="absolute inset-[-20px] border-[0.5px] border-amber-200/10 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-0 border border-dashed border-amber-200/20 rounded-full group-hover:border-amber-200/60 transition-all" />
            <div className="absolute inset-4 rounded-full flex items-center justify-center bg-white/[0.01] group-hover:bg-white/[0.03] transition-all">
              <span className="text-4xl text-amber-200/20 group-hover:text-amber-200/60 transition-all">✦</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {gameState === GameState.ALCHEMY && image && (
        <MemoryAlchemy 
          image={image} 
          status={alchemyStatus}
          isReady={!!finalResult}
          onComplete={() => setGameState(GameState.RESULT)}
        />
      )}

      {gameState === GameState.RESULT && finalResult && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start bg-black overflow-y-auto animate-in fade-in duration-[3000ms]">
          <div className="fixed inset-0 z-0">
            <img 
              src={finalResult.imageUrl} 
              className="w-full h-full object-cover blur-[80px] opacity-40 scale-110" 
              alt="ambient-bg" 
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center px-6 py-20 min-h-screen">
            <div className={`relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-[2000ms] ${imageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}`}>
              <img 
                src={finalResult.imageUrl} 
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover animate-pan" 
                alt="Memory Vision" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="w-8 h-[1px] bg-amber-200/50" />
                <span className="font-cinzel text-[8px] tracking-[0.8em] text-amber-200/80 uppercase">Ethereal Projection</span>
              </div>
            </div>

            <div className={`mt-20 text-center space-y-12 transition-all duration-[3000ms] delay-700 ${imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-6 opacity-20">
                <div className="h-[0.5px] w-24 bg-gradient-to-r from-transparent to-amber-200" />
                <div className="text-amber-200 text-xs">✦</div>
                <div className="h-[0.5px] w-24 bg-gradient-to-l from-transparent to-amber-200" />
              </div>

              <div className="text-3xl md:text-5xl font-serif text-amber-50/90 leading-[2.2] italic whitespace-pre-line tracking-[0.2em] chromatic-glow drop-shadow-[0_0_20px_rgba(253,230,138,0.3)]">
                {finalResult.poem}
              </div>

              <div className="pt-24 pb-12 flex flex-col items-center gap-8">
                <div className="font-cinzel text-[9px] tracking-[1em] text-amber-200/20 uppercase">Dedicated to 郭禹含</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="group relative px-12 py-4 rounded-full border border-white/5 text-[10px] tracking-[1.5em] text-white/30 hover:text-amber-200 hover:border-amber-200/40 transition-all uppercase overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-amber-200/[0.05] transition-colors" />
                  <span className="relative z-10">回到现实</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pan {
          0% { transform: scale(1.1) translate(0%, 0%); }
          50% { transform: scale(1.15) translate(-1%, -1%); }
          100% { transform: scale(1.1) translate(0%, 0%); }
        }
        .animate-pan {
          animation: pan 20s ease-in-out infinite;
        }
        .chromatic-glow {
          text-shadow: 2px 0 rgba(255,0,0,0.2), -2px 0 rgba(0,255,255,0.2), 0 0 15px rgba(253,230,138,0.4);
        }
        ::-webkit-scrollbar { width: 0; background: transparent; }
      `}</style>
    </div>
  );
};

export default App;
