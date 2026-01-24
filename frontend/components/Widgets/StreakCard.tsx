import React from "react";
import { Zap } from "lucide-react";

export default function StreakCard() {
  const days = [
      { l: "M", a: true }, 
      { l: "T", a: true }, 
      { l: "W", a: true }, 
      { l: "T", a: false }, 
      { l: "F", a: false }, 
      { l: "S", a: false }, 
      { l: "S", a: false }
  ];

  return (
    <div className="w-full p-4 relative group hover:bg-ui-700 transition-colors">
         <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                 <Zap size={14} className="text-brand fill-brand" />
                 <span className="text-xs font-bold text-ui-text-main uppercase">Streak: 3 Days</span>
             </div>
         </div>

         {/* Squares */}
         <div className="flex justify-between gap-1">
             {days.map((day, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-1.5">
                     <div className={`
                        w-6 h-6 flex items-center justify-center border
                        ${day.a 
                            ? 'bg-brand border-brand text-black' 
                            : 'bg-ui-900 border-ui-border text-ui-text-muted'}
                     `}>
                         <span className="text-[9px] font-bold">{day.l}</span>
                     </div>
                 </div>
             ))}
         </div>
    </div>
  );
}