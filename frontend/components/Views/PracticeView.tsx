import React, { useState, useRef, useEffect } from "react";
import { Terminal, Play, SkipForward, AlertCircle, CheckCircle, Cpu, Code2, ChevronRight, X, Settings2 } from "lucide-react";

// --- MOCK DATA ---
const EXERCISES = {
    easy: [
        {
            id: "EZ-01",
            title: "Binary Sum",
            content: "Given two binary strings a and b, return their sum as a binary string.\n\nExample:\nInput: a = \"11\", b = \"1\"\nOutput: \"100\"",
            starterCode: "function binarySum(a, b) {\n  // Your code here\n  return \"\";\n}"
        },
        {
            id: "EZ-02",
            title: "Array Filter",
            content: "Write a function that filters out all negative numbers from an array.\n\nExample:\nInput: [1, -2, 3]\nOutput: [1, 3]",
            starterCode: "function filterNegatives(arr) {\n  // Your code here\n  return [];\n}"
        }
    ],
    medium: [
        {
            id: "MD-01",
            title: "Longest Substring",
            content: "Find the length of the longest substring without repeating characters.\n\nExample:\nInput: \"abcabcbb\"\nOutput: 3",
            starterCode: "function lengthOfLongestSubstring(s) {\n  // Your code here\n  return 0;\n}"
        }
    ],
    hard: [
        {
            id: "HD-01",
            title: "Median of Two Sorted Arrays",
            content: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nTime complexity should be O(log (m+n)).",
            starterCode: "function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n  return 0.0;\n}"
        }
    ]
};

// Simple Textarea based Code Editor to avoid heavy Monaco dependency in this env
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
            {/* Line Numbers (Fake) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#1a1a1a] border-r border-[#333] text-gray-600 text-right pr-2 pt-4 select-none leading-6 font-mono text-xs">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-transparent text-gray-300 pl-10 pt-4 pr-4 border-none resize-none focus:outline-none focus:ring-0 leading-6 custom-scrollbar"
                spellCheck={false}
            />
        </div>
    );
};

export default function PracticeView() {
    const [showModal, setShowModal] = useState(true);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [currentExercise, setCurrentExercise] = useState<any>(null);
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Load random exercise
    const loadExercise = (diff: 'easy' | 'medium' | 'hard') => {
        const list = EXERCISES[diff];
        const random = list[Math.floor(Math.random() * list.length)];
        setCurrentExercise(random);
        setCode(random.starterCode);
        setResults(null);
    };

    const handleDifficultySelect = (diff: 'easy' | 'medium' | 'hard') => {
        setDifficulty(diff);
        loadExercise(diff);
        setShowModal(false);
    };

    const handleSubmit = () => {
        setLoading(true);
        setResults(null);

        // Simulate API Submission
        setTimeout(() => {
            setLoading(false);
            // Random success/fail for demo
            const isSuccess = Math.random() > 0.3;
            setResults({
                success: isSuccess,
                message: isSuccess ? "All test cases passed." : "Test case failed: Expected '100', got 'undefined'",
                time: "42ms",
                memory: "14.2MB"
            });
        }, 1500);
    };

    return (
        <div className="w-full h-full flex flex-col bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">

            {/* --- MODAL: DIFFICULTY SELECTION --- */}
            {showModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-ui-800 border border-ui-border w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Cpu size={32} className="text-brand" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-ui-text-main mb-2">SELECT DIFFICULTY</h2>
                            <p className="text-gray-500 text-xs font-mono mb-8">CHOOSE YOUR CHALLENGE LEVEL TO INITIALIZE SIMULATION</p>

                            <div className="space-y-3">
                                {[
                                    { id: 'easy', label: 'EASY', color: 'border-green-500/50 hover:bg-green-500/10 text-green-500' },
                                    { id: 'medium', label: 'MEDIUM', color: 'border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-500' },
                                    { id: 'hard', label: 'HARD', color: 'border-red-500/50 hover:bg-red-500/10 text-red-500' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleDifficultySelect(opt.id as any)}
                                        className={`w-full py-4 border ${opt.color} font-bold tracking-widest uppercase text-sm transition-all hover:scale-[1.02] active:scale-[0.98] relative group`}
                                    >
                                        <span className="relative z-10">{opt.label}</span>
                                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="p-4 border-b border-ui-border bg-black/5 dark:bg-black/40 shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Terminal size={20} className="text-brand" />
                        <h2 className="text-lg font-display font-bold text-ui-text-main tracking-wider">PRACTICE ARENA</h2>
                    </div>
                    {!showModal && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-ui-800 border border-ui-border hover:border-brand/50 transition-colors group cursor-pointer"
                            title="Change Difficulty"
                        >
                            <Settings2 size={12} className="text-gray-500 group-hover:text-ui-text-main" />
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-ui-text-muted uppercase">LEVEL:</span>
                            <span className={`text-[10px] font-bold uppercase ${difficulty === 'hard' ? 'text-red-500' : difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                {difficulty}
                            </span>
                        </button>
                    )}
                </div>
                <button
                    onClick={() => loadExercise(difficulty)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-ui-text-main uppercase tracking-wider transition-colors"
                >
                    <span>Skip / Next Exercise</span>
                    <SkipForward size={14} />
                </button>
            </div>

            {/* --- MAIN WORKSPACE --- */}
            {!showModal && currentExercise && (
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT: PROBLEM DESCRIPTION */}
                    <div className="w-1/3 border-r border-ui-border bg-ui-800/30 flex flex-col">
                        <div className="p-4 border-b border-ui-border bg-black/5 dark:bg-black/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-gray-500">{currentExercise.id}</span>
                            </div>
                            <h3 className="text-lg font-bold text-ui-text-main mb-4">{currentExercise.title}</h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-brand/10 text-brand text-[9px] font-bold uppercase border border-brand/20">Algorithms</span>
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase border border-blue-500/20">Logic</span>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap font-sans text-ui-text-main leading-relaxed text-sm">
                                    {currentExercise.content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: EDITOR & CONSOLE */}
                    <div className="flex-1 flex flex-col bg-[#0d0d0d]">

                        {/* Toolbar */}
                        <div className="h-10 border-b border-[#222] flex items-center justify-between px-4 bg-[#111]">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold border-b-2 border-brand pb-[11px] translate-y-[1px]">
                                    <Code2 size={14} />
                                    CODE
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-600">JAVASCRIPT (NODE)</span>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 relative overflow-hidden">
                            <SimpleCodeEditor code={code} onChange={setCode} />
                        </div>

                        {/* Console/Output Area */}
                        <div className="h-48 border-t border-ui-border bg-[#0a0a0a] flex flex-col">
                            <div className="h-8 border-b border-[#222] flex items-center justify-between px-4 bg-[#111]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Console Output</span>
                                <div className="flex gap-2">
                                    {results && (
                                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${results.success ? 'text-green-500' : 'text-red-500'}`}>
                                            {results.success ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {results.success ? 'Success' : 'Failed'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-brand animate-pulse">
                                        <div className="w-2 h-2 bg-brand rounded-full"></div>
                                        <span>Compiling and executing test cases...</span>
                                    </div>
                                ) : results ? (
                                    <div className="space-y-2">
                                        <div className={results.success ? "text-green-400" : "text-red-400"}>
                                            &gt; {results.message}
                                        </div>
                                        {results.success && (
                                            <div className="text-gray-500 mt-2">
                                                Execution Time: {results.time} <br />
                                                Memory Usage: {results.memory}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-700">// Run code to see output...</span>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="p-2 border-t border-ui-border bg-ui-800 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-brand hover:bg-brand-hover text-black px-6 py-2 font-bold text-xs uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Running...' : 'Run Code'}
                                    <Play size={14} className={loading ? 'hidden' : 'block'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}