import React, { useState, useEffect } from "react";
import {
    Users, FileCode, MessageSquare, Search, Trash2, Edit2, Save, Plus, X,
    Check, Shield, AlertTriangle, Terminal, ChevronRight, Beaker
} from "lucide-react";
import {
    getUsers, updateUser, deleteUser,
    getExercises, getExercise, createExercise, updateExercise, deleteExercise,
    getTickets, getTicket, replyToTicket, updateTicketStatus
} from "../../services/adminService";

// --- DATA TYPES ---
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    rating: number;
    win_streak?: number;
    loss_streak?: number;
    k_win?: number;
    k_lose?: number;
    status?: 'active' | 'banned';
}

interface TestCase {
    id: string; // usually number as string "1", "2"
    input: string;
    output: string;
}

interface Exercise {
    id: string; // Folder name
    title?: string; // From config
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    timeLimit?: number;
    problemContent?: string;
    starterCode?: string;
    testCases?: TestCase[];
}

interface Ticket {
    id: number;
    subject: string;
    username: string; // Joined from user_id
    email?: string;
    status: 'open' | 'resolved' | 'closed';
    created_at: string;
}

interface TicketMessage {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    username?: string;
    role?: string;
}

export default function AdminView() {
    const [activeTab, setActiveTab] = useState<'users' | 'exercises' | 'tickets'>('users');

    // -- USER STATE --
    const [users, setUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // -- EXERCISE STATE --
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null); // For editing
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    // Form for exercise
    const [exConfig, setExConfig] = useState<any>({});
    const [exContent, setExContent] = useState("");
    const [exStarter, setExStarter] = useState("");
    const [exTestCases, setExTestCases] = useState<TestCase[]>([]);

    // -- TICKET STATE --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [currentTicketMsgs, setCurrentTicketMsgs] = useState<TicketMessage[]>([]);
    const [adminReply, setAdminReply] = useState("");

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = () => {
        if (activeTab === 'users') {
            getUsers().then(res => setUsers(res.users || [])).catch(err => console.error(err));
        } else if (activeTab === 'exercises') {
            getExercises().then(res => {
                const mapped = res.exercises.map((e: any) => ({
                    id: e.id,
                    title: e.config?.title || e.id,
                    difficulty: e.config?.difficulty,
                    tags: e.config?.tags,
                    timeLimit: e.config?.timeLimit,
                    problemContent: e.problemContent,
                    config: e.config
                }));
                setExercises(mapped);
            }).catch(err => console.error(err));
        } else if (activeTab === 'tickets') {
            getTickets().then(res => setTickets(res.tickets || [])).catch(err => console.error(err));
        }
    };

    // --- ACTIONS: USERS ---
    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            await updateUser(editingUser.id, {
                role: editingUser.role,
                rating: editingUser.rating,
                win_streak: editingUser.win_streak,
                loss_streak: editingUser.loss_streak,
                k_win: editingUser.k_win,
                k_lose: editingUser.k_lose
            });
            loadData();
            setEditingUser(null);
        } catch (err) {
            console.error("Update failed", err);
            alert("Update failed");
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm("CONFIRM DELETION: This action is irreversible.")) {
            try {
                await deleteUser(id);
                loadData();
            } catch (err) {
                console.error("Delete failed", err);
                alert("Delete failed");
            }
        }
    };

    // --- ACTIONS: EXERCISES ---
    const handleSaveExercise = async () => {
        const id = isCreatingExercise ? exConfig.id : selectedExercise?.id;
        if (!id) return;

        const payload = {
            id,
            config: {
                title: exConfig.title,
                difficulty: exConfig.difficulty,
                tags: exConfig.tags,
                timeLimit: exConfig.timeLimit,
                starterCode: "starter.js"
            },
            problemContent: exContent,
            starterCode: exStarter,
            testCases: exTestCases
        };

        try {
            if (isCreatingExercise) {
                await createExercise(payload);
                setIsCreatingExercise(false);
            } else {
                await updateExercise(id, payload);
            }
            loadData();
            setSelectedExercise(null);
        } catch (err) {
            console.error("Exercise save failed", err);
            alert("Save failed (Check ID uniqueness or constraints)");
        }
    };

    const handleDeleteExercise = async (id: string) => {
        if (window.confirm("CONFIRM DELETION: Remove exercise module?")) {
            try {
                await deleteExercise(id);
                loadData();
                if (selectedExercise?.id === id) setSelectedExercise(null);
            } catch (err) {
                console.error(err);
                alert("Delete failed");
            }
        }
    };

    const prepareEditExercise = (ex: Exercise) => {
        setSelectedExercise(ex);
        setIsCreatingExercise(false);
        // Load full details
        getExercise(ex.id).then(res => {
            setExConfig({ ...res.config, id: res.id });
            setExContent(res.problemContent || "");
            setExStarter(res.starterCode || "");
            setExTestCases(res.testCases || []);
        });
    };

    const prepareCreateExercise = () => {
        setSelectedExercise(null);
        setIsCreatingExercise(true);
        setExConfig({ id: "", title: "", difficulty: "easy", tags: [], timeLimit: 20 });
        setExContent("# New Problem\n\nDescription here...");
        setExStarter("function solution() {\n}");
        setExTestCases([]);
    };

    // Test Case Actions
    const handleAddTestCase = () => {
        const newId = (exTestCases.length + 1).toString();
        setExTestCases([...exTestCases, { id: newId, input: "", output: "" }]);
    };

    const handleUpdateTestCase = (idx: number, field: 'input' | 'output', value: string) => {
        const updated = [...exTestCases];
        updated[idx] = { ...updated[idx], [field]: value };
        setExTestCases(updated);
    };

    const handleDeleteTestCase = (idx: number) => {
        const updated = exTestCases.filter((_, i) => i !== idx);
        // Re-index IDs roughly (optional, but good for uniqueness if needed)
        // Backend mostly likely uses filenames 1.input.txt based on new save
        // But let's keep it simple
        setExTestCases(updated);
    };


    // --- ACTIONS: TICKETS ---
    useEffect(() => {
        if (selectedTicketId) {
            getTicket(selectedTicketId).then(res => {
                setCurrentTicketMsgs(res.messages || []);
            });
        } else {
            setCurrentTicketMsgs([]);
        }
    }, [selectedTicketId]);

    const handleSendReply = async () => {
        if (!selectedTicketId || !adminReply.trim()) return;
        try {
            await replyToTicket(selectedTicketId, adminReply);
            const res = await getTicket(selectedTicketId);
            setCurrentTicketMsgs(res.messages || []);
            setAdminReply("");
        } catch (err) {
            console.error("Reply failed", err);
        }
    };

    const handleTicketStatus = async (status: 'open' | 'resolved' | 'closed') => {
        if (!selectedTicketId) return;
        try {
            await updateTicketStatus(selectedTicketId, status);
            loadData();
        } catch (err) {
            console.error("Status update failed", err);
        }
    };


    // --- RENDER HELPERS ---
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
    const filteredExercises = exercises.filter(e => e.title?.toLowerCase().includes(exerciseSearch.toLowerCase()));

    const activeTicket = tickets.find(t => t.id === selectedTicketId);

    return (
        <div className="w-full h-full flex flex-col bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">

            {/* Header */}
            <div className="p-6 border-b border-ui-border bg-ui-800/80 shrink-0 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold text-ui-text-main tracking-wider flex items-center gap-2">
                        <Shield size={24} className="text-brand" />
                        ADMINISTRATION CONSOLE
                    </h2>
                    <p className="text-xs text-ui-text-muted font-mono mt-1">
                        ACCESS LEVEL: ROOT // SYSTEM OVERRIDE ENABLED
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-ui-800 border border-ui-border p-1 gap-1">
                    {[
                        { id: 'users', icon: Users, label: 'OPERATIVES' },
                        { id: 'exercises', icon: FileCode, label: 'MODULES' },
                        { id: 'tickets', icon: MessageSquare, label: 'COMMS' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase transition-all
                                ${activeTab === tab.id
                                    ? 'bg-brand text-black shadow-[0_0_10px_rgba(11,220,168,0.3)]'
                                    : 'text-gray-500 hover:text-ui-text-main hover:bg-ui-700'}
                            `}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- TAB: USERS --- */}
                {activeTab === 'users' && (
                    <div className="h-full flex flex-col p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="SEARCH DATABASE..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="bg-ui-800 border border-ui-border text-xs text-ui-text-main px-4 py-2 w-64 focus:border-brand focus:outline-none placeholder:text-gray-600 font-mono transition-colors"
                                />
                                <Search size={14} className="absolute right-3 top-2.5 text-gray-500" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">{filteredUsers.length} RECORDS FOUND</span>
                        </div>

                        <div className="flex-1 bg-ui-800 border border-ui-border overflow-hidden flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 p-3 border-b border-ui-border bg-black/5 dark:bg-black/20 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">
                                <div className="col-span-1 text-left">ID</div>
                                <div className="col-span-2 text-left">User</div>
                                <div className="col-span-2 text-left">Email</div>
                                <div className="col-span-1">Role</div>
                                <div className="col-span-1">Rating</div>
                                <div className="col-span-1">W-Strk</div>
                                <div className="col-span-1">L-Strk</div>
                                <div className="col-span-1">Kw</div>
                                <div className="col-span-1">Kl</div>
                                <div className="col-span-1 text-right">Edit</div>
                            </div>

                            {/* Table Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="grid grid-cols-12 gap-2 p-3 border-b border-ui-border/50 hover:bg-black/5 dark:hover:bg-white/5 items-center text-[10px] font-mono transition-colors text-center">
                                        <div className="col-span-1 text-brand text-left">{user.id}</div>

                                        {/* Editable Row Logic */}
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <div className="col-span-2 text-left text-gray-400 cursor-not-allowed" title="Not editable">
                                                    {user.username}
                                                </div>
                                                <div className="col-span-2 text-left text-gray-400 cursor-not-allowed truncate" title="Not editable">
                                                    {user.email}
                                                </div>
                                                <div className="col-span-1">
                                                    <select className="bg-ui-900 border border-brand text-ui-text-main w-full" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}>
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.rating} onChange={e => setEditingUser({ ...editingUser, rating: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.win_streak || 0} onChange={e => setEditingUser({ ...editingUser, win_streak: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.loss_streak || 0} onChange={e => setEditingUser({ ...editingUser, loss_streak: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.k_win || 0} onChange={e => setEditingUser({ ...editingUser, k_win: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="col-span-1">
                                                    <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.k_lose || 0} onChange={e => setEditingUser({ ...editingUser, k_lose: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="col-span-1 flex justify-end gap-1">
                                                    <button onClick={handleSaveUser} className="text-green-500 hover:text-green-400"><Check size={14} /></button>
                                                    <button onClick={() => setEditingUser(null)} className="text-red-500 hover:text-red-400"><X size={14} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-span-2 text-ui-text-main font-bold text-left truncate" title={user.username}>{user.username}</div>
                                                <div className="col-span-2 text-gray-500 text-left truncate" title={user.email}>{user.email}</div>
                                                <div className="col-span-1">
                                                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-bold ${user.role === 'admin' ? 'bg-brand/20 text-brand' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-yellow-500">{user.rating}</div>
                                                <div className="col-span-1 text-green-500">{user.win_streak || 0}</div>
                                                <div className="col-span-1 text-red-500">{user.loss_streak || 0}</div>
                                                <div className="col-span-1 text-gray-400">{user.k_win || 0}</div>
                                                <div className="col-span-1 text-gray-400">{user.k_lose || 0}</div>
                                                <div className="col-span-1 flex justify-end gap-1">
                                                    <button onClick={() => setEditingUser(user)} className="text-gray-500 hover:text-ui-text-main transition-colors"><Edit2 size={12} /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: EXERCISES --- */}
                {activeTab === 'exercises' && (
                    <div className="h-full flex p-6 gap-6 animate-fade-in">
                        {/* List View */}
                        <div className="w-1/3 flex flex-col bg-ui-800 border border-ui-border">
                            <div className="p-3 border-b border-ui-border flex justify-between items-center bg-black/5 dark:bg-black/20">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Training Modules</span>
                                <button
                                    onClick={prepareCreateExercise}
                                    className="p-1.5 bg-brand text-black hover:bg-white transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="p-2 border-b border-ui-border">
                                <input
                                    type="text"
                                    placeholder="FILTER MODULES..."
                                    value={exerciseSearch}
                                    onChange={e => setExerciseSearch(e.target.value)}
                                    className="w-full bg-ui-900 border border-ui-border text-[10px] text-ui-text-main px-2 py-1.5 focus:border-brand focus:outline-none font-mono transition-colors"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {filteredExercises.map(ex => (
                                    <div
                                        key={ex.id}
                                        onClick={() => prepareEditExercise(ex)}
                                        className={`
                                            p-3 border cursor-pointer transition-all flex justify-between items-center group
                                            ${selectedExercise?.id === ex.id
                                                ? 'bg-brand/10 border-brand'
                                                : 'bg-ui-800 border-transparent hover:border-ui-border hover:bg-ui-700'}
                                        `}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-mono px-1 border ${selectedExercise?.id === ex.id ? 'border-brand text-brand' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}>{ex.id}</span>
                                                <span className={`text-[9px] uppercase font-bold ${ex.difficulty === 'hard' ? 'text-red-500' : ex.difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{ex.difficulty}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-ui-text-main group-hover:text-brand transition-colors">{ex.title}</h4>
                                        </div>
                                        <ChevronRight size={14} className={`text-gray-600 ${selectedExercise?.id === ex.id ? 'text-brand' : ''}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor View */}
                        <div className="flex-1 bg-ui-800 border border-ui-border flex flex-col relative text-[10px]">
                            {(selectedExercise || isCreatingExercise) ? (
                                <>
                                    <div className="p-4 border-b border-ui-border bg-black/5 dark:bg-black/20 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-ui-text-main uppercase flex items-center gap-2">
                                            <Terminal size={16} className="text-brand" />
                                            {isCreatingExercise ? "Initialize New Module" : `Editing: ${selectedExercise?.id}`}
                                        </h3>
                                        <div className="flex gap-2">
                                            {!isCreatingExercise && (
                                                <button onClick={() => handleDeleteExercise(selectedExercise!.id)} className="px-3 py-1.5 border border-red-500/50 text-red-500 font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">
                                                    Delete Module
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSaveExercise}
                                                className="px-4 py-1.5 bg-brand text-black font-bold uppercase hover:bg-white transition-colors flex items-center gap-2"
                                            >
                                                <Save size={12} />
                                                Save Config
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                        {isCreatingExercise && (
                                            <div className="space-y-2">
                                                <label className="font-bold text-gray-500 uppercase">Module ID (Unique Folder Name)</label>
                                                <input
                                                    type="text"
                                                    value={exConfig.id || ""}
                                                    onChange={e => setExConfig({ ...exConfig, id: e.target.value })}
                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                                    placeholder="e.g. EX-001"
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="font-bold text-gray-500 uppercase">Module Title</label>
                                                <input
                                                    type="text"
                                                    value={exConfig.title || ""}
                                                    onChange={e => setExConfig({ ...exConfig, title: e.target.value })}
                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-bold text-gray-500 uppercase">Difficulty Rating</label>
                                                <select
                                                    value={exConfig.difficulty || "easy"}
                                                    onChange={e => setExConfig({ ...exConfig, difficulty: e.target.value })}
                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="font-bold text-gray-500 uppercase">Problem Description (Markdown)</label>
                                            <textarea
                                                className="w-full h-40 bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono leading-relaxed resize-none transition-colors"
                                                value={exContent}
                                                onChange={e => setExContent(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="font-bold text-gray-500 uppercase">Starter Code Template</label>
                                            <textarea
                                                className="w-full h-32 bg-ui-900 border border-ui-border p-3 text-sm text-green-600 dark:text-green-500 focus:border-brand focus:outline-none font-mono resize-none transition-colors"
                                                value={exStarter}
                                                onChange={e => setExStarter(e.target.value)}
                                            ></textarea>
                                        </div>

                                        {/* Test Cases */}
                                        <div className="space-y-4 pt-4 border-t border-ui-border">
                                            <div className="flex justify-between items-center">
                                                <label className="font-bold text-gray-500 uppercase flex items-center gap-2">
                                                    <Beaker size={14} /> Validation Protocols (Test Cases)
                                                </label>
                                                <button
                                                    onClick={handleAddTestCase}
                                                    className="text-brand hover:text-white uppercase font-bold flex items-center gap-1"
                                                >
                                                    <Plus size={12} /> Add Case
                                                </button>
                                            </div>

                                            {exTestCases.length === 0 && (
                                                <div className="text-gray-500 italic text-center p-4 border border-dashed border-ui-border">No validation cases configured.</div>
                                            )}

                                            <div className="space-y-3">
                                                {exTestCases.map((tc, idx) => (
                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-black/10 p-2 border border-ui-border/50">
                                                        <div className="col-span-1 text-center font-mono text-gray-500 pt-2">#{idx + 1}</div>
                                                        <div className="col-span-10 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase font-bold text-gray-500">Input</span>
                                                                <textarea
                                                                    rows={2}
                                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-xs font-mono resize-none focus:outline-none focus:border-brand"
                                                                    value={tc.input}
                                                                    onChange={e => handleUpdateTestCase(idx, 'input', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase font-bold text-gray-500">Expected Output</span>
                                                                <textarea
                                                                    rows={2}
                                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-xs font-mono resize-none focus:outline-none focus:border-brand"
                                                                    value={tc.output}
                                                                    onChange={e => handleUpdateTestCase(idx, 'output', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center pt-2">
                                                            <button
                                                                onClick={() => handleDeleteTestCase(idx)}
                                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                    <FileCode size={48} className="opacity-20 mb-4" />
                                    <p className="text-xs font-mono uppercase">Select a module to configure parameters</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: TICKETS --- */}
                {/* ... (Existing Ticket Tab Logic) */}
                {activeTab === 'tickets' && (
                    <div className="h-full flex p-6 gap-6 animate-fade-in">
                        {/* Ticket List */}
                        <div className="w-80 flex flex-col bg-ui-800 border border-ui-border">
                            <div className="p-3 border-b border-ui-border bg-black/5 dark:bg-black/20">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Incoming Transmissions</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {tickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                        className={`
                                            p-3 border cursor-pointer transition-all group
                                            ${selectedTicketId === ticket.id
                                                ? 'bg-brand/10 border-brand'
                                                : 'bg-ui-800 border-transparent hover:border-ui-border hover:bg-ui-700'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-mono ${selectedTicketId === ticket.id ? 'text-brand' : 'text-gray-500'}`}>TCK-{ticket.id}</span>
                                            <span className={`text-[9px] uppercase font-bold px-1.5 rounded-sm ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-500'}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-ui-text-main truncate mb-1">{ticket.subject}</h4>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span className="text-[10px] text-gray-500 font-mono">{ticket.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat View */}
                        <div className="flex-1 bg-ui-800 border border-ui-border flex flex-col relative">
                            {activeTicket ? (
                                <>
                                    <div className="p-4 border-b border-ui-border bg-black/5 dark:bg-black/20 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-bold text-ui-text-main">{activeTicket.subject}</h3>
                                            <p className="text-[10px] text-gray-500 font-mono uppercase">Initiator: {activeTicket.username} // ID: {activeTicket.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {activeTicket.status === 'open' ? (
                                                <button onClick={() => handleTicketStatus('resolved')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase transition-colors">
                                                    Mark Resolved
                                                </button>
                                            ) : (
                                                <button onClick={() => handleTicketStatus('open')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase transition-colors">
                                                    Reopen Ticket
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-black/5 dark:bg-black/30">
                                        {currentTicketMsgs.length === 0 && (
                                            <div className="text-center text-gray-500 text-xs mt-10">No messages loaded</div>
                                        )}
                                        {currentTicketMsgs.map((msg, idx) => {
                                            const isAdmin = msg.role === 'admin';
                                            return (
                                                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-3 border ${isAdmin ? 'bg-brand/10 border-brand/30 text-right' : 'bg-ui-800 border-ui-border text-left'}`}>
                                                        <p className={`text-sm ${isAdmin ? 'text-ui-text-main' : 'text-ui-text-main'}`}>{msg.message}</p>
                                                        <span className="text-[9px] text-gray-600 font-mono uppercase mt-1 block">
                                                            {new Date(msg.created_at).toLocaleTimeString()} // {msg.username || (isAdmin ? 'Admin' : 'User')}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-4 border-t border-ui-border bg-black/5 dark:bg-black/20">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={adminReply}
                                                onChange={e => setAdminReply(e.target.value)}
                                                placeholder="Type secure response..."
                                                className="flex-1 bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                            />
                                            <button
                                                onClick={handleSendReply}
                                                disabled={!adminReply.trim()}
                                                className="bg-brand text-black px-4 font-bold text-xs uppercase hover:bg-white transition-colors disabled:opacity-50"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                    <MessageSquare size={48} className="opacity-20 mb-4" />
                                    <p className="text-xs font-mono uppercase">Select a channel to decrypt</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}