import React, { useState, useEffect, useRef } from "react";
import { 
    Swords, Globe, Lock, Users, Zap, Search, Clock, 
    AlertTriangle, CheckCircle, XCircle, Terminal, Play,
    Cpu, Code2, ChevronRight, Loader2, Shield
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_OPPONENT = {
    username: "Neon_Slayer",
    rating: 1540,
    avatar_color: "#ef4444",
    avatar_seed: "dragon"
};

const MOCK_PROBLEM = {
    title: "Invert Binary Tree",
    difficulty: "medium",
    description: "Given the root of a binary tree, invert the tree, and return its root.\n\nExample:\nInput: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]",
    starterCode: "function invertTree(root) {\n    // Your code here\n}"
};

// Reusing Simple Code Editor
const SimpleCodeEditor = ({ code, onChange }: { code: string, onChange: (val: string) => void }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const value = e.currentTarget.value;
            e.currentTarget.value = value.substring(0, start) + "  " + value.substring(end);
            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            onChange(e.currentTarget.value);
        }
    };
    return (
        <div className="relative w-full h-full bg-[#0d0d0d] font-mono text-sm group">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#1a1a1a] border-r border-[#333] text-gray-600 text-right pr-2 pt-4 select-none leading-6 font-mono text-xs">
                {Array.from({ length: 30 }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-transparent text-gray-300 pl-10 pt-4 pr-4 border-none resize-none focus:outline-none focus:ring-0 leading-6 custom-scrollbar font-mono"
                spellCheck={false}
            />
        </div>
    );
};

export default function PlayView() {
    const [viewMode, setViewMode] = useState<'ranked' | 'create' | 'join'>('ranked');
    
    // Ranked Queue States
    const [queueStatus, setQueueStatus] = useState<'idle' | 'searching' | 'found' | 'battle'>('idle');
    const [queueTimer, setQueueTimer] = useState(0);
    const [battleTimer, setBattleTimer] = useState(1200); // 20 mins
    const [code, setCode] = useState(MOCK_PROBLEM.starterCode);
    const [acceptCountdown, setAcceptCountdown] = useState(15);
    
    // Simulation Logic
    useEffect(() => {
        let interval: any;
        if (queueStatus === 'searching') {
            interval = setInterval(() => {
                setQueueTimer(prev => {
                    if (prev > 4) { // Simulate finding match after 5 seconds
                        setQueueStatus('found');
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else if (queueStatus === 'found') {
            interval = setInterval(() => {
                setAcceptCountdown(prev => {
                    if (prev <= 0) {
                        setQueueStatus('idle'); // Missed match
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (queueStatus === 'battle') {
             interval = setInterval(() => {
                setBattleTimer(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [queueStatus]);

    const handleStartSearch = () => {
        setQueueStatus('searching');
        setQueueTimer(0);
    };

    const handleAcceptMatch = () => {
        setQueueStatus('battle');
    };

    const handleCancelSearch = () => {
        setQueueStatus('idle');
        setQueueTimer(0);
    };

    // --- RENDERERS ---

    // 1. RANKED VIEW
    const renderRanked = () => {
        if (queueStatus === 'battle') {
            return (
                <div className="flex-1 flex flex-col h-full relative animate-fade-in">
                    {/* Battle Header */}
                    <div className="h-14 border-b border-ui-border bg-ui-800/80 shrink-0 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center overflow-hidden border border-white/20" style={{ backgroundColor: '#14b8a6' }}>
                                    <img src="https://api.dicebear.com/9.x/bottts/svg?seed=robot" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-ui-text-main font-bold text-sm">Agent_007</span>
                            </div>
                            <span className="text-gray-600 font-mono font-bold text-xs">VS</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center overflow-hidden border border-red-500/50" style={{ backgroundColor: MOCK_OPPONENT.avatar_color }}>
                                    <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${MOCK_OPPONENT.avatar_seed}`} alt="Opponent" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-red-400 font-bold text-sm">{MOCK_OPPONENT.username}</span>
                            </div>
                        </div>
                        <div className={`font-mono text-xl font-bold tracking-widest ${battleTimer < 60 ? 'text-red-500 animate-pulse' : 'text-ui-text-main'}`}>
                            {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <button onClick={() => setQueueStatus('idle')} className="px-3 py-1 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">
                            Surrender
                        </button>
                    </div>

                    {/* Battle Workspace */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-1/3 bg-ui-800/30 border-r border-ui-border flex flex-col">
                            <div className="p-4 border-b border-ui-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/30 px-1.5 rounded bg-yellow-500/10 uppercase">{MOCK_PROBLEM.difficulty}</span>
                                </div>
                                <h3 className="text-lg font-bold text-ui-text-main">{MOCK_PROBLEM.title}</h3>
                            </div>
                            <div className="p-6 text-sm text-ui-text-muted font-sans leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                                {MOCK_PROBLEM.description}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col bg-[#0d0d0d]">
                            <div className="h-10 bg-[#111] border-b border-[#222] flex items-center px-4 justify-between">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">main.js</span>
                                <span className="text-[10px] text-gray-600 font-mono">JavaScript</span>
                            </div>
                            <div className="flex-1 relative">
                                <SimpleCodeEditor code={code} onChange={setCode} />
                            </div>
                            <div className="p-3 bg-ui-800 border-t border-ui-border flex justify-end">
                                <button className="bg-brand hover:bg-white text-black px-6 py-2 font-bold text-xs uppercase transition-colors">
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 flex items-center justify-center relative overflow-hidden animate-fade-in">
                {/* Background Decor */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Swords size={400} className="text-ui-text-main" />
                </div>

                <div className="max-w-lg w-full relative z-10">
                    {queueStatus === 'idle' && (
                        <div className="text-center space-y-8">
                            <div>
                                <h2 className="text-4xl font-display font-black text-ui-text-main mb-2 tracking-wide">RANKED ARENA</h2>
                                <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Global Matchmaking System</p>
                            </div>
                            
                            <div className="flex justify-center gap-8 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-ui-text-main">1540</div>
                                    <div className="text-[10px] text-brand font-bold uppercase">Current MMR</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-ui-text-main">52.4%</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</div>
                                </div>
                            </div>

                            <button 
                                onClick={handleStartSearch}
                                className="w-64 h-16 bg-brand hover:bg-white hover:scale-105 active:scale-95 transition-all mx-auto clip-path-polygon flex items-center justify-center gap-3 group relative overflow-hidden"
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <Swords className="text-black group-hover:rotate-45 transition-transform duration-500" />
                                <span className="font-display font-black text-xl text-black tracking-widest">FIND MATCH</span>
                            </button>
                        </div>
                    )}

                    {queueStatus === 'searching' && (
                        <div className="text-center space-y-8">
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-ui-700 rounded-full"></div>
                                <div className="absolute inset-0 border-t-4 border-brand rounded-full animate-spin"></div>
                                <span className="text-3xl font-mono font-bold text-ui-text-main">
                                    00:{(queueTimer).toString().padStart(2, '0')}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-ui-text-main animate-pulse">SEARCHING FOR OPPONENT...</h3>
                                <p className="text-xs text-gray-500 mt-2 font-mono">ESTIMATED TIME: 00:15</p>
                            </div>

                            <button onClick={handleCancelSearch} className="text-red-500 hover:text-ui-text-main text-xs font-bold uppercase tracking-widest border border-red-500/30 px-6 py-2 hover:bg-red-500 transition-all">
                                Cancel Search
                            </button>
                        </div>
                    )}

                    {queueStatus === 'found' && (
                        <div className="bg-ui-800 border border-brand/50 p-8 text-center relative shadow-[0_0_50px_rgba(11,220,168,0.2)] animate-scale-in">
                            <div className="absolute top-0 left-0 w-full h-1 bg-brand animate-pulse"></div>
                            
                            <h3 className="text-3xl font-display font-black text-ui-text-main mb-6">MATCH FOUND</h3>
                            
                            <div className="flex items-center justify-center gap-6 mb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-ui-700 border-2 border-brand rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                                         <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#14b8a6' }}>
                                            <img src="https://api.dicebear.com/9.x/bottts/svg?seed=robot" alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-ui-text-main">Agent_007</div>
                                </div>
                                <div className="text-xl font-black text-brand italic">VS</div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-ui-700 border-2 border-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                        <span className="font-bold text-red-500">???</span>
                                    </div>
                                    <div className="text-xs font-bold text-ui-text-main">Opponent</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-4xl font-mono font-bold text-brand">{acceptCountdown}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Seconds to accept</div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button onClick={handleAcceptMatch} className="flex-1 bg-brand hover:bg-white text-black py-4 font-black text-lg uppercase tracking-widest transition-colors">
                                    ACCEPT
                                </button>
                                <button onClick={handleCancelSearch} className="px-6 py-4 border border-ui-border text-gray-500 hover:text-white hover:border-white font-bold uppercase transition-colors">
                                    DECLINE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 2. CREATE ROOM VIEW
    const renderCreateRoom = () => (
        <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-2xl bg-ui-800 border border-ui-border p-8 shadow-hard relative">
                <div className="absolute -top-3 left-8 bg-ui-800 px-2 text-brand text-xs font-bold uppercase tracking-widest border border-brand">
                    Custom Lobby Configuration
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Room Name</label>
                        <input type="text" placeholder="e.g. Algo Scrims #1" className="w-full bg-ui-900 border border-ui-border p-3 text-ui-text-main focus:border-brand focus:outline-none font-mono text-sm transition-colors" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Difficulty</label>
                            <select className="w-full bg-ui-900 border border-ui-border p-3 text-ui-text-main focus:border-brand focus:outline-none font-mono text-sm transition-colors">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Max Players</label>
                            <select className="w-full bg-ui-900 border border-ui-border p-3 text-ui-text-main focus:border-brand focus:outline-none font-mono text-sm transition-colors">
                                <option>2 (1v1)</option>
                                <option>4 (FFA)</option>
                                <option>8 (Tournament)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-5 bg-ui-700 rounded-full relative cursor-pointer">
                            <div className="w-5 h-5 bg-gray-500 rounded-full absolute left-0 top-0 border-2 border-black"></div>
                        </div>
                        <span className="text-sm text-gray-400 font-bold uppercase">Private Lobby (Invite Only)</span>
                    </div>

                    <div className="pt-4 border-t border-ui-border flex justify-end">
                        <button className="bg-brand text-black px-8 py-3 font-bold text-sm uppercase hover:bg-white transition-colors flex items-center gap-2">
                            <Cpu size={16} />
                            Create Lobby
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // 3. JOIN ROOM VIEW
    const renderJoinRoom = () => (
        <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-ui-800 border border-ui-border rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-ui-text-main uppercase">Join Secure Channel</h2>
                <p className="text-xs text-gray-500 font-mono">Enter the 6-digit access code provided by the lobby host.</p>
                
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-10 h-12 bg-ui-900 border border-ui-border flex items-center justify-center text-xl font-mono text-ui-text-main focus-within:border-brand transition-colors">
                            <input type="text" maxLength={1} className="w-full h-full bg-transparent text-center focus:outline-none" />
                        </div>
                    ))}
                </div>

                <button className="w-full bg-ui-800 border border-ui-border text-gray-400 hover:text-white hover:border-white py-3 font-bold uppercase transition-colors text-sm mt-4">
                    Connect
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">
            {/* Nav Rail (Left) */}
            <div className="flex h-full">
                <div className="w-64 bg-black/5 dark:bg-black/20 border-r border-ui-border flex flex-col p-4 gap-2">
                    <div className="mb-6 px-2">
                        <h2 className="text-xl font-display font-bold text-ui-text-main tracking-widest flex items-center gap-2">
                            <Zap size={20} className="text-brand" />
                            PLAY
                        </h2>
                    </div>

                    <button 
                        onClick={() => { setViewMode('ranked'); setQueueStatus('idle'); }}
                        className={`text-left px-4 py-4 border transition-all group relative overflow-hidden ${viewMode === 'ranked' ? 'bg-brand text-black border-brand' : 'bg-transparent text-gray-500 border-transparent hover:bg-ui-800 hover:text-ui-text-main'}`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <Swords size={18} />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider">Ranked Match</div>
                                <div className={`text-[9px] font-mono mt-0.5 opacity-70 ${viewMode === 'ranked' ? 'text-black' : 'text-gray-600'}`}>Competitive 1v1</div>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setViewMode('create')}
                        className={`text-left px-4 py-4 border transition-all group ${viewMode === 'create' ? 'bg-ui-800 text-ui-text-main border-ui-border' : 'bg-transparent text-gray-500 border-transparent hover:bg-ui-800 hover:text-ui-text-main'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Cpu size={18} />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider">Create Room</div>
                                <div className="text-[9px] font-mono mt-0.5 text-gray-600">Custom Lobby</div>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setViewMode('join')}
                        className={`text-left px-4 py-4 border transition-all group ${viewMode === 'join' ? 'bg-ui-800 text-ui-text-main border-ui-border' : 'bg-transparent text-gray-500 border-transparent hover:bg-ui-800 hover:text-ui-text-main'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider">Join Room</div>
                                <div className="text-[9px] font-mono mt-0.5 text-gray-600">Enter Code</div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-ui-900/50 relative flex flex-col">
                    {viewMode === 'ranked' && renderRanked()}
                    {viewMode === 'create' && renderCreateRoom()}
                    {viewMode === 'join' && renderJoinRoom()}
                </div>
            </div>
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}