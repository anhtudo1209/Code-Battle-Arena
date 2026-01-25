import React, { useState } from "react";
import StreakCard from "../Widgets/StreakCard";
import LeaderboardCard from "../Widgets/LeaderboardCard";
import DailyChallengeCard from "../Widgets/DailyChallengeCard";
import PlayConsole from "../Widgets/PlayConsole";
import { Target, Trophy, Zap } from "lucide-react";

interface SidebarProps {
    onNavigate?: (view: string) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="flex flex-col h-full w-full bg-ui-800">
      
      {/* Tabs Header - Renamed to match features */}
      <div className="flex border-b border-ui-border bg-black/5 dark:bg-black/20 shrink-0">
           {[
               { id: 'daily', icon: Target, label: 'DAILY' },
               { id: 'rank', icon: Trophy, label: 'RANK' },
               { id: 'streak', icon: Zap, label: 'STREAK' }
           ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-4 transition-all border-b-2
                    ${activeTab === tab.id 
                        ? 'border-brand text-ui-text-main bg-ui-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-400 hover:bg-ui-700'}
                  `}
               >
                   <tab.icon size={16} className="mb-1" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
               </button>
           ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-ui-800 relative">
           
           {/* TAB: DAILY CHALLENGE */}
           {activeTab === 'daily' && (
               <div className="p-4 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand rounded-sm animate-pulse"></span> Daily Protocol
                         </h3>
                         <span className="text-[9px] font-mono text-gray-500">REFRESH IN 04:22:10</span>
                    </div>
                    
                    {/* Primary Functionality */}
                    <div className="bg-ui-900 border border-ui-border">
                        <DailyChallengeCard onNavigate={onNavigate} />
                    </div>

                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                        <p className="text-[10px] text-blue-400 leading-relaxed">
                            <span className="font-bold">Tip:</span> Completing daily challenges grants +15% Rank XP bonus for the next 3 matches.
                        </p>
                    </div>
               </div>
           )}

           {/* TAB: RANK (Leaderboard) */}
           {activeTab === 'rank' && (
               <div className="h-full flex flex-col p-4 animate-fade-in">
                    <div className="flex justify-between items-end mb-3">
                         <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Ranking</h3>
                         <span className="text-[9px] text-brand border border-brand/20 px-2 py-0.5 bg-brand/5 rounded">SEASON 4</span>
                    </div>
                    <div className="flex-1 bg-ui-900 border border-ui-border overflow-hidden">
                        <LeaderboardCard />
                    </div>
               </div>
           )}

           {/* TAB: STREAK */}
           {activeTab === 'streak' && (
               <div className="p-4 space-y-4 animate-fade-in">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Attendance Record</h3>
                    
                    <div className="bg-ui-900 border border-ui-border">
                        <StreakCard />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-ui-900 border border-ui-border p-3 flex flex-col items-center justify-center">
                            <span className="text-2xl font-display font-bold text-ui-text-main">12</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-wide">Max Streak</span>
                        </div>
                        <div className="bg-ui-900 border border-ui-border p-3 flex flex-col items-center justify-center">
                            <span className="text-2xl font-display font-bold text-brand">x1.2</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-wide">Multiplier</span>
                        </div>
                    </div>
               </div>
           )}

      </div>
      
      {/* Footer Info / Play Button */}
      <div className="shrink-0 z-10">
          <PlayConsole onNavigate={onNavigate} />
      </div>

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}