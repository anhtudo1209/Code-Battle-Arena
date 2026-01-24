import React from "react";

export default function FluidGlass({ children }) {
  return (
    <div className="relative w-full py-12 flex items-center justify-center">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -left-32 -top-10 w-72 h-72 rounded-full opacity-30 animate-blob bg-gradient-to-r from-purple-400 via-pink-400 to-red-400" />
        <div className="absolute -right-32 -bottom-6 w-96 h-96 rounded-full opacity-20 animate-blob-delay bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400" />
      </div>

      <div
        className="relative z-10 w-11/12 md:w-3/4 p-8 rounded-2xl
                   bg-white/6 backdrop-blur-md border border-white/10
                   shadow-2xl"
      >
        {children ?? (
          <div className="text-white text-center">
            <h3 className="text-2xl font-semibold">Fluid Glass</h3>
            <p className="mt-2 text-sm opacity-80">
              Subtle frosted glass with moving blobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
