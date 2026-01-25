import React from "react";

export default function GettingStartedCard() {
  return (
    <div className="w-full h-full relative">
       {/* Glass Card Container */}
       <div className="bg-[#050c0c]/80 backdrop-blur-2xl border border-[#ffffff]/10 rounded-3xl p-8 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 relative px-4">
                 {/* Connecting Line */}
                 <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#ffffff]/10 -z-10" />
                 
                 {[1, 2, 3, 4].map((step) => (
                     <div key={step} className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10
                        ${step === 1 
                            ? 'bg-[#00d8ff] border-[#00d8ff] text-[#020a0a] shadow-[0_0_20px_#00d8ff]' 
                            : 'bg-[#020a0a] border-[#ffffff]/20 text-gray-600'}
                     `}>
                         {step}
                         {/* Pulse effect for active step */}
                         {step === 1 && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />}
                     </div>
                 ))}
            </div>

            {/* Content Text */}
            <div className="text-center flex-1 flex flex-col justify-center items-center gap-3">
                <h3 className="text-[#00d8ff] font-bold text-xl drop-shadow-md">Step 1: Register an Account</h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                    Create your account to access all features of Code Battle Arena.
                </p>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
                <button className="bg-[#0bdca8] hover:bg-[#00ffc3] text-[#020a0a] font-bold px-10 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(11,220,168,0.4)] uppercase tracking-wide text-sm">
                    Next
                </button>
            </div>
       </div>
    </div>
  );
}