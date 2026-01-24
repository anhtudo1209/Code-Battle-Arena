import React, { useState } from "react";
import { ChevronDown, Dices, Lock, Globe } from "lucide-react";

const CustomRoomPanel: React.FC = () => {
  const [privacy, setPrivacy] = useState<"Private" | "Public">("Public");
  const [difficulty, setDifficulty] = useState<string>("Medium");

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-700">Customize Room</h2>
        <p className="text-slate-500 mt-2">
          Configure settings for your private match
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/80 shadow-lg">
        {/* Privacy Toggle */}
        <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mb-8 shadow-inner">
          <button
            onClick={() => setPrivacy("Private")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              privacy === "Private"
                ? "bg-white shadow-md text-slate-800"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Lock size={16} />
            Private
          </button>
          <button
            onClick={() => setPrivacy("Public")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              privacy === "Public"
                ? "bg-blue-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Globe size={16} />
            Public
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">
              Difficulty Level
            </label>
            <div className="flex gap-3">
              {["Easy", "Medium", "Hard"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    difficulty === lvl
                      ? "bg-blue-50 border-blue-400 text-blue-600 shadow-sm"
                      : "bg-white border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">
              Game Mode
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <select className="w-full appearance-none bg-white border border-white rounded-xl py-3 pl-4 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm font-medium">
                  <option>Standard Match</option>
                  <option>Speed Run</option>
                  <option>Reverse Engineering</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
              <button className="p-3 bg-white rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors shadow-sm">
                <Dices size={22} />
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">
              Room Name
            </label>
            <input
              type="text"
              className="w-full bg-white border border-white rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-slate-400 shadow-sm font-medium"
              placeholder="e.g. Saturday Night Code..."
            />
          </div>
        </div>

        {/* Create Action */}
        <div className="mt-10">
          <button className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold tracking-wider rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
            CREATE ROOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomRoomPanel;
