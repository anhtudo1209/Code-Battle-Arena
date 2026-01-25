import React from "react";
import { LeaderboardEntry } from "../../types";

const defaultEntries: LeaderboardEntry[] = [
  { rank: 1, name: "CyberKing", score: 2470, badge: "gold" },
  { rank: 2, name: "NeonRider", score: 1938, badge: "silver" },
  { rank: 3, name: "Glitch_01", score: 1400, badge: "bronze" },
  { rank: 4, name: "CodeNinja", score: 1250 },
  { rank: 5, name: "ByteMe", score: 1100 },
  { rank: 6, name: "NullPointer", score: 980 },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899'];

export default function LeaderboardCard({ entries = defaultEntries }: { entries?: LeaderboardEntry[] }) {
  return (
    <div className="w-full h-full flex flex-col bg-ui-900">
      {/* Header */}
      <div className="flex px-3 py-2 bg-black/20 border-b border-ui-border text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="w-8 text-center">#</div>
          <div className="flex-1">Agent</div>
          <div className="text-right">Score</div>
      </div>
      
      {/* Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {entries.map((e, idx) => {
            const isTop3 = e.rank <= 3;
            // Generate deterministic color index
            const colorIndex = e.name.length % COLORS.length;
            
            return (
                <div 
                    key={e.rank} 
                    className="flex items-center px-3 py-2 border-b border-ui-border hover:bg-ui-800 transition-colors group"
                >
                    <div className="w-8 text-center">
                        <span className={`text-xs font-mono font-bold ${isTop3 ? 'text-brand' : 'text-gray-600'}`}>
                            {e.rank}
                        </span>
                    </div>

                    <div className="flex-1 truncate pr-2 flex items-center gap-2">
                        {/* Avatar */}
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10 rounded-sm" style={{ backgroundColor: COLORS[colorIndex] }}>
                             <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${e.name}`} alt={e.name} className="w-full h-full object-cover" />
                        </div>

                        <span className={`text-xs font-bold ${isTop3 ? 'text-ui-text-main' : 'text-ui-text-muted'} group-hover:text-ui-text-main`}>
                            {e.name}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-mono text-gray-500 group-hover:text-brand">
                            {e.score}
                        </span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}