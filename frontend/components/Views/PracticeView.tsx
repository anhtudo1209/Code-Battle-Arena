import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Terminal, Play, SkipForward, AlertCircle, CheckCircle, Cpu, Code2, ChevronRight, X, Settings2 } from "lucide-react";

import { getExercisesByDifficulty, submitCode, getSubmission, getExercise } from "../../services/practiceService";

// --- MOCK DATA REMOVED ---

export default function PracticeView() {
    const [showModal, setShowModal] = useState(true);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [currentExercise, setCurrentExercise] = useState<any>(null);
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [editorTheme, setEditorTheme] = useState("vs-dark");

    useEffect(() => {
        // Define custom light theme with explicit white background and black text
        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: '', foreground: '000000' },
                { token: 'comment', foreground: '008000' },
                { token: 'keyword', foreground: '0000ff' },
                { token: 'string', foreground: 'a31515' },
                { token: 'number', foreground: '098658' }
            ],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#000000',
                'editor.lineHighlightBackground': '#f0f0f0',
                'editor.selectionBackground': '#add6ff',
                'editor.inactiveSelectionBackground': '#e5ebf1',
                'editorCursor.foreground': '#000000',
                'editorWhitespace.foreground': '#d3d3d3'
            }
        });

        const handleThemeChange = () => {
            const isLight = !document.documentElement.classList.contains("dark");
            setEditorTheme(isLight ? "custom-light" : "vs-dark");
        };

        // Initial check
        handleThemeChange();

        // Listen for theme changes
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // Load random exercise
    const loadExercise = async (diff: 'easy' | 'medium' | 'hard') => {
        try {
            const response = await getExercisesByDifficulty(diff);
            const list = response.exercises;
            if (list && list.length > 0) {
                const randomSummary = list[Math.floor(Math.random() * list.length)];

                // Fetch full details
                setLoading(true);
                const fullExercise = await getExercise(randomSummary.id); // Import getExercise first!

                setCurrentExercise(fullExercise);
                setCode(fullExercise.starterCode || "// No starter code provided");
                setResults(null);
                setLoading(false);
            } else {
                alert("No exercises found for this difficulty.");
            }
        } catch (error) {
            console.error("Failed to load exercises", error);
            setLoading(false);
        }
    };

    const handleDifficultySelect = (diff: 'easy' | 'medium' | 'hard') => {
        setDifficulty(diff);
        loadExercise(diff);
        setShowModal(false);
    };

    const pollSubmission = async (submissionId: number) => {
        const interval = setInterval(async () => {
            try {
                const res = await getSubmission(submissionId);
                const sub = res.submission;
                if (sub.status !== 'pending' && sub.status !== 'processing') {
                    clearInterval(interval);
                    setLoading(false);

                    if (sub.status === 'compile_error') {
                        setResults({
                            success: false,
                            message: `Compilation Error: ${sub.compilation_error || 'Unknown error'}`
                        });
                    } else if (sub.status === 'completed') {
                        // Check if all test cases passed
                        // Assuming sub.test_results contains pass/fail info
                        // For now simplistic check
                        const allPassed = sub.test_results?.every((t: any) => t.passed);
                        setResults({
                            success: allPassed,
                            message: allPassed ? "All test cases passed!" : "Some test cases failed.",
                            // Mocking time/memory if not in response
                            time: "N/A",
                            memory: "N/A"
                        });
                    } else {
                        setResults({
                            success: false,
                            message: `Execution Error: ${sub.status}`
                        });
                    }
                }
            } catch (err) {
                clearInterval(interval);
                setLoading(false);
                setResults({ success: false, message: "Error polling results" });
            }
        }, 1000);
    };

    const handleSubmit = async () => {
        if (!currentExercise) return;
        setLoading(true);
        setResults(null);

        try {
            const res = await submitCode(code, currentExercise.id);
            if (res.submissionId) {
                pollSubmission(res.submissionId);
            } else {
                setLoading(false);
                setResults({ success: false, message: "Submission failed to start" });
            }
        } catch (err: any) {
            setLoading(false);
            setResults({ success: false, message: err.message || "Submission failed" });
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-black border border-ui-border shadow-hard relative overflow-hidden">

            {/* --- MODAL: DIFFICULTY SELECTION --- */}
            {showModal && (
                <div className="absolute inset-0 z-50 bg-white dark:bg-black flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-black border border-ui-border w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                        <div className="p-8 text-center bg-white dark:bg-black">
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
            <div className="p-4 border-b border-ui-border bg-white dark:bg-black shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Terminal size={20} className="text-brand" />
                        <h2 className="text-lg font-display font-bold text-ui-text-main tracking-wider">PRACTICE ARENA</h2>
                    </div>
                    {!showModal && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-black border border-ui-border hover:border-brand/50 transition-colors group cursor-pointer"
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
                    <div className="w-1/3 border-r border-ui-border bg-white dark:bg-black flex flex-col">
                        <div className="p-4 border-b border-ui-border bg-white dark:bg-black">
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
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#0d0d0d]">

                        {/* Toolbar */}
                        <div className="h-10 border-b border-gray-300 dark:border-[#222] flex items-center justify-between px-4 bg-white dark:bg-[#111]">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-black dark:text-gray-500 text-xs font-bold border-b-2 border-brand pb-[11px] translate-y-[1px]">
                                    <Code2 size={14} />
                                    CODE
                                </div>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 relative overflow-hidden">
                            <Editor
                                key={editorTheme}
                                height="100%"
                                language="javascript"
                                theme={editorTheme}
                                value={code}
                                onChange={setCode}
                                options={{
                                    minimap: { enabled: false },
                                    automaticLayout: true,
                                    fontSize: 14,
                                    wordWrap: "on",
                                }}
                            />
                        </div>

                        {/* Console/Output Area */}
                        <div className="h-48 border-t border-ui-border bg-white dark:bg-[#0a0a0a] flex flex-col">
                            <div className="h-8 border-b border-[#222] flex items-center justify-between px-4 bg-white dark:bg-[#111]">
                                <span className="text-[10px] font-bold text-black dark:text-gray-500 uppercase">Console Output</span>
                                <div className="flex gap-2">
                                    {results && (
                                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${results.success ? 'text-black dark:text-green-500' : 'text-black dark:text-red-500'}`}>
                                            {results.success ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {results.success ? 'Success' : 'Failed'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-black dark:text-brand animate-pulse">
                                        <div className="w-2 h-2 bg-brand rounded-full"></div>
                                        <span>Compiling and executing test cases...</span>
                                    </div>
                                ) : results ? (
                                    <div className="space-y-2">
                                        <div className={results.success ? "text-black dark:text-green-400" : "text-black dark:text-red-400"}>
                                            &gt; {results.message}
                                        </div>
                                        {results.success && (
                                            <div className="text-black dark:text-gray-500 mt-2">
                                                Execution Time: {results.time} <br />
                                                Memory Usage: {results.memory}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-black dark:text-gray-700">// Run code to see output...</span>
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