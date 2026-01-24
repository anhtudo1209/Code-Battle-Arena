import React from "react";
import { Search, Filter, ArrowUpDown, Users, Trophy } from "lucide-react";
import { Room } from "../types";

const MOCK_ROOMS: Room[] = [
  {
    id: "1024",
    name: "Algorithm Basics",
    difficulty: "Easy",
    type: "Solo",
    participants: 1,
  },
  {
    id: "1025",
    name: "DP Challenge",
    difficulty: "Hard",
    type: "Ranked",
    participants: 4,
  },
  {
    id: "1026",
    name: "Daily Sprint",
    difficulty: "Medium",
    type: "Team",
    participants: 2,
  },
  {
    id: "1027",
    name: "Tree Traversals",
    difficulty: "Medium",
    type: "Solo",
    participants: 1,
  },
  {
    id: "1028",
    name: "Graph Theory 101",
    difficulty: "Hard",
    type: "Class",
    participants: 12,
  },
  {
    id: "1029",
    name: "String Manipulation",
    difficulty: "Easy",
    type: "Solo",
    participants: 1,
  },
  {
    id: "1030",
    name: "Bitmasking Intro",
    difficulty: "Hard",
    type: "Ranked",
    participants: 3,
  },
  {
    id: "1031",
    name: "Recursion 101",
    difficulty: "Easy",
    type: "Class",
    participants: 25,
  },
];

const PracticePanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search for a room ID or name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/60 shadow-sm transition-all"
          />
        </div>
        <button className="p-3 rounded-xl bg-white/60 border border-white/60 hover:bg-white text-slate-600 hover:text-blue-600 transition-all shadow-sm">
          <Filter size={20} />
        </button>
        <button className="p-3 rounded-xl bg-white/60 border border-white/60 hover:bg-white text-slate-600 hover:text-blue-600 transition-all shadow-sm">
          <ArrowUpDown size={20} />
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-white/60 bg-white/30 shadow-sm flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-white/40 font-bold text-slate-600 text-sm border-b border-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="col-span-2">ID</div>
          <div className="col-span-4">Room Name</div>
          <div className="col-span-2 text-center">Difficulty</div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-center">Players</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
          {MOCK_ROOMS.map((room) => (
            <div
              key={room.id}
              className="grid grid-cols-12 px-6 py-4 bg-white/70 rounded-2xl hover:bg-white hover:scale-[1.01] hover:shadow-md transition-all duration-200 cursor-pointer text-sm text-slate-600 items-center group border border-transparent hover:border-blue-100"
            >
              <div className="col-span-2 font-mono text-slate-400 group-hover:text-blue-500 font-bold">
                #{room.id}
              </div>
              <div className="col-span-4 font-semibold text-slate-700">
                {room.name}
              </div>
              <div className="col-span-2 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                    room.difficulty === "Easy"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : room.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {room.difficulty}
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded-lg text-slate-500">
                  <Trophy size={12} />
                  {room.type}
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={14} />
                  <span>{room.participants}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticePanel;
