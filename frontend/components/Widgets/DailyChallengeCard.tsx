import React from "react";
import { ArrowRight, Target, Terminal, Shuffle } from "lucide-react";

interface DailyChallengeCardProps {
    onNavigate?: (view: string) => void;
}

export default function DailyChallengeCard({ onNavigate }: DailyChallengeCardProps) {
  return (
    <div className="w-full relative group">
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand text-black">
                        <Shuffle size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">
                            Daily Protocol
                        </span>
                        <span className="text-xs font-bold text-ui-text-main uppercase tracking-wide">
                            Random Selection
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-4">
                <h3 className="text-lg font-display font-bold text-ui-text-main mb-2">
                    Algorithmic Gauntlet
                </h3>
                <p className="text-[11px] text-ui-text-muted leading-relaxed border-l-2 border-ui-border pl-3">
                    System will dispense a randomized coding module from the active pool upon entry. Prepare for variable difficulty.
                </p>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-bold bg-ui-text-main/10 text-ui-text-main px-2 py-1">DYNAMIC XP</span>
                <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-1">BONUS LOOT</span>
            </div>

            {/* Action Button */}
            <button 
                onClick={() => onNavigate && onNavigate('practice')}
                className="w-full group/btn relative bg-brand hover:bg-brand-hover text-black h-10 flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider"
            >
                <Terminal size={14} />
                <span>Initialize Practice</span>
                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </button>
        </div>
    </div>
  );
}