import React from "react";

export default function PassStatus() {
  return (
    <div className="relative group cursor-pointer">
        {/* Banner Shape Container */}
        <div className="relative bg-gradient-to-r from-[#000]/80 to-[#000]/40 border-l-4 border-[#0bdca8] p-3 md:p-4 backdrop-blur-md rounded-r-xl">
             
             {/* Battle Pass icon */}
             <div className="absolute -top-6 -left-6 w-16 h-16 md:w-20 md:h-20 bg-[#020a0a] rounded-full border-4 border-[#252525] flex items-center justify-center z-20 shadow-xl group-hover:scale-110 transition-transform group-hover:border-[#0bdca8]">
                 <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img 
                        src="https://img.freepik.com/premium-vector/scroll-game-icon-magic-paper-scroll-with-seal_172607-313.jpg" 
                        alt="Pass" 
                        className="object-cover w-full h-full opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                         <span className="text-[#0bdca8] font-bold text-2xl font-display">XP</span>
                    </div>
                 </div>
             </div>

             <div className="pl-12 md:pl-14">
                 <div className="flex justify-between items-end mb-1">
                     <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                        Battle Pass: Season 4
                     </span>
                     <span className="text-white text-xs font-bold">Lvl 12</span>
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-[#ffffff]/10">
                     <div className="h-full bg-gradient-to-r from-[#0bdca8] to-blue-500 w-[65%] shadow-[0_0_10px_#0bdca8]" />
                 </div>

                 <div className="mt-1 text-right">
                     <span className="text-[9px] text-[#0bdca8]">Next: Premium Chest</span>
                 </div>
             </div>
        </div>
    </div>
  );
}