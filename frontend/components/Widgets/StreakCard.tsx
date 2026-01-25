import React from "react";
import { Zap } from "lucide-react";

interface StreakCardProps {
    currentStreak?: number;
}

export default function StreakCard({ currentStreak = 0 }: StreakCardProps) {


    return (
        <div className="w-full p-4 relative group hover:bg-ui-700 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-brand fill-brand" />
                    <span className="text-xs font-bold text-ui-text-main uppercase">Streak: {currentStreak} Days</span>
                </div>
            </div>

            {/* Squares Removed as per request */}
            <div className="h-1 w-full bg-ui-800 rounded overflow-hidden">
                <div className="h-full bg-brand" style={{ width: '100%' }}></div>
            </div>
        </div>
    );
}