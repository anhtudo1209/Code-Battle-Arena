import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../../services/authService";

interface LeaderboardEntry {
    rank: number;
    name: string; // mapped from username
    score: number; // mapped from rating
    badge?: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899'];

export default function LeaderboardCard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard().then(res => {
            const mapped = res.leaderboard.map((u: any, idx: number) => ({
                rank: idx + 1,
                name: u.username,
                score: u.rating,
                badge: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined
            }));
            setEntries(mapped);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-xs text-gray-500 animate-pulse">Loading ranking...</div>;
    }

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
                {entries.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">No data available</div>
                ) : (
                    entries.map((e) => {
                        const isTop3 = e.rank <= 3;

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
                    })
                )}
            </div>
        </div>
    );
}