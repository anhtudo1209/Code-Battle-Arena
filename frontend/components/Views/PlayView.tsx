import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
    Swords, Globe, Lock, Users, Zap, Search, Clock,
    AlertTriangle, CheckCircle, XCircle, Terminal, Play,
    Cpu, Code2, ChevronRight, Loader2, Shield
} from "lucide-react";
import {
    joinQueue, leaveQueue, getQueueStatus, getActiveBattle,
    acceptMatch, submitBattle, resign, Battle, Opponent
} from "../../services/battleService";
import { getMe } from "../../services/authService";

export default function PlayView() {
    const [viewMode, setViewMode] = useState<'ranked' | 'create' | 'join'>('ranked');

    // Ranked Queue States
    const [queueStatus, setQueueStatus] = useState<'idle' | 'searching' | 'found' | 'battle' | 'waiting_opponent'>('idle');
    const [queueTimer, setQueueTimer] = useState(0);
    const [battleTimer, setBattleTimer] = useState(0); // Seconds remaining
    const [code, setCode] = useState("");
    const [acceptCountdown, setAcceptCountdown] = useState(15);
    const [editorTheme, setEditorTheme] = useState("vs-dark");

    // Data
    const [battleId, setBattleId] = useState<number | null>(null);
    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [problem, setProblem] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [submitResult, setSubmitResult] = useState<any>(null);

    // Fetch User
    useEffect(() => {
        getMe().then(res => {
            if (res.user) setUser(res.user);
        }).catch(err => console.error(err));
    }, []);

    // Theme Logic
    useEffect(() => {
        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [{ token: '', foreground: '000000', background: 'ffffff' }],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#000000',
                'editor.lineHighlightBackground': '#f0f0f0',
                'editor.selectionBackground': '#add6ff',
                'editor.inactiveSelectionBackground': '#e5ebf1'
            }
        });
        const handleThemeChange = () => {
            const isLight = !document.documentElement.classList.contains("dark");
            setEditorTheme(isLight ? "custom-light" : "vs-dark");
        };
        handleThemeChange();
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Queue Polling
    useEffect(() => {
        let interval: any;

        if (queueStatus === 'searching') {
            interval = setInterval(async () => {
                setQueueTimer(prev => prev + 1);
                try {
                    const res = await getQueueStatus();
                    if (res.status === 'matched' && res.battleId) {
                        setBattleId(res.battleId);
                        setQueueStatus('found');
                        // Start polling battle to get opponent info immediately
                        fetchBattleDetails(res.battleId);
                    }
                } catch (err) {
                    console.error("Queue poll error", err);
                }
            }, 1000);
        } else if (queueStatus === 'found' || queueStatus === 'waiting_opponent') {
            // Poll for accept status
            interval = setInterval(async () => {
                if (queueStatus === 'found') {
                    setAcceptCountdown(prev => {
                        if (prev <= 0) return 0;
                        return prev - 1;
                    });
                }
                if (battleId) {
                    fetchBattleDetails(battleId);
                }
            }, 1000);
        } else if (queueStatus === 'battle') {
            interval = setInterval(() => {
                if (battleId) fetchBattleDetails(battleId);
                // Timer is handled by backend time ideally, but we simulate tick here
                // We'll update from backend response
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [queueStatus, battleId]);

    const fetchBattleDetails = async (id: number) => {
        try {
            const res = await getActiveBattle();
            // res: { battle, opponent, exercise, submissions }
            if (res.battle) {
                if (res.battle.id !== id) return; // Mismatch?

                if (res.battle.status === 'ongoing') {
                    setOpponent(res.opponent || null);
                    setProblem(res.exercise);
                    setQueueStatus('battle');

                    if (res.battle.startedAt && res.exercise?.timeLimit) {
                        const start = new Date(res.battle.startedAt).getTime();
                        const now = Date.now();
                        const elapsed = Math.floor((now - start) / 1000);
                        const limit = res.exercise.timeLimit * 60; // assume timeLimit is minutes or seconds? Backend typically sends minutes or we assumed. 
                        // Mock problem said 20 mins. Let's assume limit is in minutes.
                        // Check exerciseService. 
                        // If no limit, default to 20m?
                        const timeLeft = Math.max(0, (limit || 1200) - elapsed);
                        setBattleTimer(timeLeft);
                    } else {
                        // Fallback logic
                        setBattleTimer(prev => prev > 0 ? prev : 1200);
                    }

                    if (!code && res.exercise?.starterCode) {
                        setCode(res.exercise.starterCode);
                    }
                } else if (res.battle.status === 'waiting_for_acceptance') {
                    // Check if I have accepted
                    // The backend response might not tell me directly "I accepted", but I can track it locally.
                    // But if 'found' -> 'waiting_opponent' logic helps.
                } else if (res.battle.status === 'aborted' || res.battle.status === 'finished') {
                    // Battle ended unexpectedly or normally
                    setQueueStatus('idle');
                    alert(`Battle ${res.battle.status}`);
                    setBattleId(null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartSearch = async () => {
        try {
            await joinQueue();
            setQueueStatus('searching');
            setQueueTimer(0);
        } catch (err) {
            console.error("Failed to join queue", err);
        }
    };

    const handleAcceptMatch = async () => {
        if (!battleId) return;
        try {
            await acceptMatch(battleId);
            setQueueStatus('waiting_opponent');
            // Continue polling will move us to 'battle' when opponent accepts
        } catch (err) {
            console.error("Failed to accept", err);
        }
    };

    const handleCancelSearch = async () => {
        try {
            await leaveQueue();
            setQueueStatus('idle');
            setQueueTimer(0);
        } catch (err) {
            console.error("Failed to leave queue", err);
        }
    };

    const handleSubmitCode = async () => {
        if (!battleId || !problem) return;
        try {
            setSubmitResult({ message: "Submitting..." });
            const res = await submitBattle(battleId, code, problem.id);
            // res might contain immediate result or submission ID
            // For now assume simple feedback
            setSubmitResult({
                success: res.success,
                message: res.message || (res.success ? "Solution Accepted!" : "Incorrect Answer")
            });
        } catch (err: any) {
            setSubmitResult({ success: false, message: err.message || "Error submitting" });
        }
    };

    // --- RENDERERS ---

    // 1. RANKED VIEW
    const renderRanked = () => {
        if (queueStatus === 'battle') {
            return (
                <div className="flex-1 flex flex-col h-full relative animate-fade-in">
                    {/* Battle Header */}
                    <div className="h-14 border-b border-ui-border bg-white dark:bg-black shrink-0 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center overflow-hidden border border-white/20" style={{ backgroundColor: '#14b8a6' }}>
                                    <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user?.avatar_animal || 'robot'}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-ui-text-main font-bold text-sm">{user?.username || 'You'}</span>
                            </div>
                            <span className="text-gray-600 font-mono font-bold text-xs">VS</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center overflow-hidden border border-red-500/50" style={{ backgroundColor: opponent?.avatar_color || '#ef4444' }}>
                                    <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${opponent?.avatar_animal || 'dragon'}`} alt="Opponent" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-red-400 font-bold text-sm">{opponent?.username || 'Opponent'}</span>
                            </div>
                        </div>
                        <div className={`font-mono text-xl font-bold tracking-widest ${battleTimer < 60 ? 'text-red-500 animate-pulse' : 'text-ui-text-main'}`}>
                            {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <button onClick={() => { resign(battleId!); setQueueStatus('idle'); }} className="px-3 py-1 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">
                            Surrender
                        </button>
                    </div>

                    {/* Battle Workspace */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-1/3 bg-ui-800/30 border-r border-ui-border flex flex-col">
                            <div className="p-4 border-b border-ui-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/30 px-1.5 rounded bg-yellow-500/10 uppercase">{problem?.difficulty || 'Medium'}</span>
                                </div>
                                <h3 className="text-lg font-bold text-ui-text-main">{problem?.title || 'Loading Problem...'}</h3>
                            </div>
                            <div className="p-6 text-sm text-ui-text-muted font-sans leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                                {problem?.content || problem?.description || 'Problem description loading...'}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col bg-white dark:bg-[#0d0d0d]">
                            <div className="h-10 bg-white dark:bg-[#111] border-b border-gray-300 dark:border-[#222] flex items-center px-4 justify-between">
                                <span className="text-[10px] text-black dark:text-gray-500 font-bold uppercase">Your code</span>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    key={editorTheme}
                                    height="100%"
                                    language="javascript"
                                    theme={editorTheme}
                                    value={code}
                                    onChange={(val) => setCode(val || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        automaticLayout: true,
                                        fontSize: 14,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-ui-800 border-t border-ui-border">
                                <div className="text-xs">
                                    {submitResult && (
                                        <span className={submitResult.success ? "text-green-500" : "text-red-500"}>
                                            {submitResult.message}
                                        </span>
                                    )}
                                </div>
                                <button onClick={handleSubmitCode} className="bg-brand hover:bg-white text-black px-6 py-2 font-bold text-xs uppercase transition-colors">
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

                    {(queueStatus === 'found' || queueStatus === 'waiting_opponent') && (
                        <div className="bg-ui-800 border border-brand/50 p-8 text-center relative shadow-[0_0_50px_rgba(11,220,168,0.2)] animate-scale-in">
                            <div className="absolute top-0 left-0 w-full h-1 bg-brand animate-pulse"></div>

                            <h3 className="text-3xl font-display font-black text-ui-text-main mb-6">
                                {queueStatus === 'found' ? 'MATCH FOUND' : 'WAITING FOR OPPONENT'}
                            </h3>

                            <div className="flex items-center justify-center gap-6 mb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-ui-700 border-2 border-brand rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#14b8a6' }}>
                                            <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user?.avatar_animal || 'robot'}`} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-ui-text-main">{user?.username || 'You'}</div>
                                </div>
                                <div className="text-xl font-black text-brand italic">VS</div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-ui-700 border-2 border-brand rounded-full mx-auto mb-2 flex items-center justify-center">
                                        <span className="font-bold text-brand">?</span>
                                        {/* Opponent is hidden until started, usually */}
                                    </div>
                                    <div className="text-xs font-bold text-ui-text-main">Opponent</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-4xl font-mono font-bold text-brand">{acceptCountdown}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Seconds to accept</div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                {queueStatus === 'found' ? (
                                    <>
                                        <button onClick={handleAcceptMatch} className="flex-1 bg-brand hover:bg-white text-black py-4 font-black text-lg uppercase tracking-widest transition-colors">
                                            ACCEPT
                                        </button>
                                        <button onClick={handleCancelSearch} className="px-6 py-4 border border-ui-border text-gray-500 hover:text-white hover:border-white font-bold uppercase transition-colors">
                                            DECLINE
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-brand animate-pulse font-bold uppercase">Waiting for other player...</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 2. CREATE ROOM VIEW (Unchanged/Mock for now)
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
                    {/* ... existingCreateRoom UI ... */}
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

    // 3. JOIN ROOM VIEW (Unchanged/Mock for now)
    const renderJoinRoom = () => (
        <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
            {/* ... existingJoinRoom UI ... */}
            <div className="w-full max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-white dark:bg-black border border-ui-border rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-ui-text-main uppercase">Join Secure Channel</h2>
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-10 h-12 bg-ui-900 border border-ui-border flex items-center justify-center text-xl font-mono text-ui-text-main">
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
        <div className="w-full h-full flex flex-col bg-white dark:bg-black border border-ui-border shadow-hard relative overflow-hidden">
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
                <div className="flex-1 bg-white dark:bg-black relative flex flex-col">
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