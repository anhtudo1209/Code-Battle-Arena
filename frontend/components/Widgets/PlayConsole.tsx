import React from "react";
import { Play } from "lucide-react";

interface PlayConsoleProps {
    onNavigate?: (view: string) => void;
}

export default function PlayConsole({ onNavigate }: PlayConsoleProps) {
  return (
    <div className="relative w-full">
        {/* Solid Background Block */}
        <div className="bg-ui-900 border-t border-b border-ui-border">
            <button 
                onClick={() => onNavigate && onNavigate('play')}
                className="
                    w-full h-16 bg-brand hover:bg-brand-hover
                    flex items-center justify-between px-6
                    transition-all duration-200
                    group relative overflow-hidden
                "
            >
                {/* Scanline effect overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                
                <div className="flex flex-col items-start z-10">
                    <span className="font-display font-bold text-xl text-black tracking-widest uppercase leading-none">
                        START
                    </span>
                    <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider">
                        Ranked Queue
                    </span>
                </div>
                
                <div className="w-10 h-10 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors z-10 skew-x-[-10deg]">
                    <Play size={20} className="fill-black text-black ml-1" />
                </div>
            </button>
        </div>
    </div>
  );
}