
import React from 'react';

interface DeploymentGuideProps {
  onClose: () => void;
}

const DeploymentGuide: React.FC<DeploymentGuideProps> = ({ onClose }) => {
  const copyCommand = () => {
    navigator.clipboard.writeText('cloudflared tunnel --url http://localhost:5173');
    alert('指令已复制到剪贴板！');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-calligraphy text-amber-100">传递浪漫 · 部署指南</h2>
          <p className="text-[10px] tracking-[0.3em] text-amber-200/30 uppercase font-cinzel">Cloudflare Tunnel Service</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">Step 1: 环境检查</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              确保你本地已下载 <a href="https://github.com/cloudflare/cloudflared/releases" target="_blank" className="text-amber-200/80 underline">cloudflared</a> 并正在本地运行此程序（通常是 5173 端口）。
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">Step 2: 启动隧道</h4>
            <p className="text-xs text-slate-400 mb-2">在你的终端（Terminal/PowerShell）中粘贴以下指令：</p>
            <div 
              onClick={copyCommand}
              className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-amber-100/80 cursor-pointer hover:bg-black/60 transition-colors flex justify-between items-center group"
            >
              <span>cloudflared tunnel --url http://localhost:5173</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-40 transition-opacity">点击复制</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">Step 3: 分享链接</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              运行后终端会显示一个以 <code className="text-amber-200/80">.trycloudflare.com</code> 结尾的链接，直接发给禹含即可。
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 mt-6 rounded-2xl bg-amber-200/10 hover:bg-amber-200/20 text-amber-100 text-[10px] tracking-[1em] uppercase transition-all"
        >
          返回程序
        </button>
      </div>
    </div>
  );
};

export default DeploymentGuide;
