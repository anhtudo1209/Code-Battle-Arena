import React, { useState, useEffect } from "react";
import { 
    Users, FileCode, MessageSquare, Search, Trash2, Edit2, Save, Plus, X, 
    Check, Shield, AlertTriangle, Terminal, ChevronRight 
} from "lucide-react";

// --- MOCK DATA TYPES ---
interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    rating: number;
    win_streak: number;
    status: 'active' | 'banned';
}

interface Exercise {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    timeLimit: number; // seconds
}

interface Ticket {
    id: string;
    subject: string;
    user: string;
    status: 'open' | 'resolved' | 'pending';
    messages: { sender: 'user' | 'admin', text: string, time: string }[];
}

// --- MOCK INITIAL DATA ---
const MOCK_USERS: User[] = [
    { id: "USR-001", username: "Admin_Prime", email: "root@system.io", role: "admin", rating: 2500, win_streak: 15, status: 'active' },
    { id: "USR-002", username: "NightCoder", email: "night@code.com", role: "user", rating: 1450, win_streak: 3, status: 'active' },
    { id: "USR-003", username: "BugHunter", email: "bug@fix.net", role: "user", rating: 1200, win_streak: 0, status: 'active' },
    { id: "USR-004", username: "SpamBot_99", email: "spam@bot.ru", role: "user", rating: 100, win_streak: 0, status: 'banned' },
];

const MOCK_EXERCISES: Exercise[] = [
    { id: "EX-101", title: "Two Sum", difficulty: "easy", tags: ["Array", "Hash Table"], timeLimit: 2 },
    { id: "EX-102", title: "Reverse Linked List", difficulty: "medium", tags: ["LinkedList"], timeLimit: 3 },
    { id: "EX-103", title: "Median of Two Sorted Arrays", difficulty: "hard", tags: ["Array", "Binary Search"], timeLimit: 5 },
];

const MOCK_TICKETS: Ticket[] = [
    { 
        id: "TCK-9021", subject: "Battle Pass XP Glitch", user: "NightCoder", status: "open",
        messages: [
            { sender: 'user', text: "I didn't receive XP for the daily quest.", time: "10:30 AM" }
        ]
    },
    { 
        id: "TCK-1102", subject: "Report Player: SpamBot_99", user: "BugHunter", status: "resolved",
        messages: [
            { sender: 'user', text: "This guy is spamming chat.", time: "Yesterday" },
            { sender: 'admin', text: "User has been banned. Closing ticket.", time: "Yesterday" }
        ]
    }
];

export default function AdminView() {
    const [activeTab, setActiveTab] = useState<'users' | 'exercises' | 'tickets'>('users');
    
    // -- USER STATE --
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [userSearch, setUserSearch] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // -- EXERCISE STATE --
    const [exercises, setExercises] = useState<Exercise[]>(MOCK_EXERCISES);
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null); // For editing
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);

    // -- TICKET STATE --
    const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [adminReply, setAdminReply] = useState("");

    // --- ACTIONS: USERS ---
    const handleSaveUser = () => {
        if (!editingUser) return;
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm("CONFIRM DELETION: This action is irreversible.")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    // --- ACTIONS: EXERCISES ---
    const handleSaveExercise = (ex: Exercise) => {
        if (isCreatingExercise) {
            setExercises([...exercises, ex]);
            setIsCreatingExercise(false);
        } else {
            setExercises(exercises.map(e => e.id === ex.id ? ex : e));
            setSelectedExercise(null);
        }
    };

    const handleDeleteExercise = (id: string) => {
         if (window.confirm("CONFIRM DELETION: Remove exercise module?")) {
            setExercises(exercises.filter(e => e.id !== id));
            if (selectedExercise?.id === id) setSelectedExercise(null);
        }
    };

    // --- ACTIONS: TICKETS ---
    const handleSendReply = () => {
        if (!selectedTicketId || !adminReply.trim()) return;
        const ticket = tickets.find(t => t.id === selectedTicketId);
        if (ticket) {
            const updatedTicket = {
                ...ticket,
                messages: [...ticket.messages, { sender: 'admin' as const, text: adminReply, time: "Now" }]
            };
            setTickets(tickets.map(t => t.id === selectedTicketId ? updatedTicket : t));
            setAdminReply("");
        }
    };

    const handleTicketStatus = (status: 'open' | 'resolved') => {
        if (!selectedTicketId) return;
        setTickets(tickets.map(t => t.id === selectedTicketId ? { ...t, status } : t));
    };


    // --- RENDER HELPERS ---
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.id.toLowerCase().includes(userSearch.toLowerCase()));
    const filteredExercises = exercises.filter(e => e.title.toLowerCase().includes(exerciseSearch.toLowerCase()));
    const activeTicket = tickets.find(t => t.id === selectedTicketId);

    return (
        <div className="w-full h-full flex flex-col bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">
            
            {/* Header */}
            <div className="p-6 border-b border-ui-border bg-white dark:bg-black shrink-0 flex justify-between items-center">
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
            <div className="flex-1 overflow-hidden relative bg-white dark:bg-black">
                
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
                                    className="bg-white dark:bg-black border border-ui-border text-xs text-ui-text-main px-4 py-2 w-64 focus:border-brand focus:outline-none placeholder:text-gray-600 font-mono transition-colors"
                                />
                                <Search size={14} className="absolute right-3 top-2.5 text-gray-500" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">{filteredUsers.length} RECORDS FOUND</span>
                        </div>

                        <div className="flex-1 bg-ui-800 border border-ui-border overflow-hidden flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 p-3 border-b border-ui-border bg-white dark:bg-black text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <div className="col-span-2">ID</div>
                                <div className="col-span-3">Username</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-1 text-center">Role</div>
                                <div className="col-span-1 text-center">Rating</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                            
                            {/* Table Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="grid grid-cols-12 gap-2 p-3 border-b border-ui-border/50 hover:bg-black/5 dark:hover:bg-white/5 items-center text-xs font-mono transition-colors">
                                        <div className="col-span-2 text-brand">{user.id}</div>
                                        
                                        {/* Editable Row Logic */}
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <div className="col-span-3">
                                                    <input className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                                                </div>
                                                <div className="col-span-3">
                                                    <input className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                                                </div>
                                                <div className="col-span-1">
                                                    <select className="bg-ui-900 border border-brand text-ui-text-main w-full" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1">
                                                     <input type="number" className="bg-ui-900 border border-brand text-ui-text-main w-full px-1" value={editingUser.rating} onChange={e => setEditingUser({...editingUser, rating: parseInt(e.target.value)})} />
                                                </div>
                                                <div className="col-span-2 flex justify-end gap-2">
                                                    <button onClick={handleSaveUser} className="text-green-500 hover:text-green-400"><Check size={16} /></button>
                                                    <button onClick={() => setEditingUser(null)} className="text-red-500 hover:text-red-400"><X size={16} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-span-3 text-ui-text-main font-bold">{user.username}</div>
                                                <div className="col-span-3 text-gray-500">{user.email}</div>
                                                <div className="col-span-1 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-bold ${user.role === 'admin' ? 'bg-brand/20 text-brand' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-center text-yellow-500">{user.rating}</div>
                                                <div className="col-span-2 flex justify-end gap-2">
                                                    <button onClick={() => setEditingUser(user)} className="text-gray-500 hover:text-ui-text-main transition-colors"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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
                        <div className="w-1/3 flex flex-col bg-white dark:bg-black border border-ui-border">
                            <div className="p-3 border-b border-ui-border flex justify-between items-center bg-ui-800">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Training Modules</span>
                                <button
                                    onClick={() => { setSelectedExercise(null); setIsCreatingExercise(true); }}
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
                                        onClick={() => { setSelectedExercise(ex); setIsCreatingExercise(false); }}
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
                        <div className="flex-1 bg-ui-800 border border-ui-border flex flex-col relative">
                            {(selectedExercise || isCreatingExercise) ? (
                                <>
                                    <div className="p-4 border-b border-ui-border bg-black/5 dark:bg-black/20 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-ui-text-main uppercase flex items-center gap-2">
                                            <Terminal size={16} className="text-brand" />
                                            {isCreatingExercise ? "Initialize New Module" : `Editing: ${selectedExercise?.id}`}
                                        </h3>
                                        <div className="flex gap-2">
                                            {!isCreatingExercise && (
                                                <button onClick={() => handleDeleteExercise(selectedExercise!.id)} className="px-3 py-1.5 border border-red-500/50 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">
                                                    Delete Module
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    const dataToSave = isCreatingExercise 
                                                        ? { id: `EX-${Math.floor(Math.random()*1000)}`, title: "New Exercise", difficulty: "easy" as const, tags: [], timeLimit: 2 } 
                                                        : selectedExercise!;
                                                    handleSaveExercise(dataToSave);
                                                }}
                                                className="px-4 py-1.5 bg-brand text-black text-[10px] font-bold uppercase hover:bg-white transition-colors flex items-center gap-2"
                                            >
                                                <Save size={12} />
                                                Save Config
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                        {/* This form would actually bind to state, simulating read-only for now or simple binding */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Module Title</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue={isCreatingExercise ? "" : selectedExercise?.title}
                                                    className="w-full bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Difficulty Rating</label>
                                                <select className="w-full bg-ui-900 border border-ui-border p-2 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors">
                                                    <option>Easy</option>
                                                    <option>Medium</option>
                                                    <option>Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Problem Description (Markdown)</label>
                                            <textarea 
                                                className="w-full h-40 bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono leading-relaxed resize-none transition-colors"
                                                defaultValue="Write a function that returns the sum of two numbers..."
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Starter Code Template</label>
                                            <textarea 
                                                className="w-full h-32 bg-ui-900 border border-ui-border p-3 text-sm text-green-600 dark:text-green-500 focus:border-brand focus:outline-none font-mono resize-none transition-colors"
                                                defaultValue="function solution(a, b) {\n  // Your code here\n}"
                                            ></textarea>
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
                {activeTab === 'tickets' && (
                    <div className="h-full flex p-6 gap-6 animate-fade-in">
                         {/* Ticket List */}
                         <div className="w-80 flex flex-col bg-white dark:bg-black border border-ui-border">
                            <div className="p-3 border-b border-ui-border bg-ui-800">
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
                                            <span className={`text-[10px] font-mono ${selectedTicketId === ticket.id ? 'text-brand' : 'text-gray-500'}`}>{ticket.id}</span>
                                            <span className={`text-[9px] uppercase font-bold px-1.5 rounded-sm ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-500'}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-ui-text-main truncate mb-1">{ticket.subject}</h4>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span className="text-[10px] text-gray-500 font-mono">{ticket.user}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>

                         {/* Chat View */}
                         <div className="flex-1 bg-white dark:bg-black border border-ui-border flex flex-col relative">
                            {activeTicket ? (
                                <>
                                    <div className="p-4 border-b border-ui-border bg-white dark:bg-black flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-bold text-ui-text-main">{activeTicket.subject}</h3>
                                            <p className="text-[10px] text-gray-500 font-mono uppercase">Initiator: {activeTicket.user} // ID: {activeTicket.id}</p>
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

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-ui-900">
                                        {activeTicket.messages.map((msg, idx) => {
                                            const isAdmin = msg.sender === 'admin';
                                            return (
                                                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-3 border ${isAdmin ? 'bg-brand/10 border-brand/30 text-right' : 'bg-ui-800 border-ui-border text-left'}`}>
                                                        <p className={`text-sm ${isAdmin ? 'text-ui-text-main' : 'text-ui-text-main'}`}>{msg.text}</p>
                                                        <span className="text-[9px] text-gray-600 font-mono uppercase mt-1 block">{msg.time} // {msg.sender}</span>
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