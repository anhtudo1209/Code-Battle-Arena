import React, { useState, useEffect, useRef } from "react";
import { Search, UserPlus, MoreVertical, X, Send, Swords, Shield, UserMinus, Gamepad2, Bot, Sparkles } from "lucide-react";

// --- Types ---
interface Friend {
    id: number;
    name: string;
    status: 'online' | 'busy' | 'offline';
    activity: string;
    avatarSeed: string;
    avatarColor: string;
    messages?: { text: string; fromMe: boolean }[];
    isBot?: boolean;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899'];

const INITIAL_FRIENDS: Friend[] = [
    {
        id: 0,
        name: "CBA_Oracle",
        status: "online",
        activity: "Guide // Active",
        avatarSeed: "OracleAI",
        avatarColor: "#0bdca8",
        isBot: true,
        messages: [{ text: "Greetings, Operative. I am CBA_Oracle. I am here to guide you through Code Battle Arena. Please note: I strictly support inquiries regarding Algorithms & Data Structures. How may I serve you today?", fromMe: false }]
    },
    { id: 1, name: "NightCoder_99", status: "online", activity: "Playing: Ranked Queue", avatarSeed: "Night", avatarColor: "#3b82f6" },
    { id: 2, name: "Sarah_Script", status: "online", activity: "Editing: Profile", avatarSeed: "Sarah", avatarColor: "#ec4899" },
    { id: 3, name: "BugHunterX", status: "busy", activity: "In Match (14:02)", avatarSeed: "Bug", avatarColor: "#ef4444" },
    { id: 4, name: "ConsoleLogMaster", status: "offline", activity: "Last seen: 2h ago", avatarSeed: "Console", avatarColor: "#f97316" },
    { id: 5, name: "React_Goddess", status: "offline", activity: "Last seen: 1d ago", avatarSeed: "React", avatarColor: "#a855f7" },
];


import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const getBotResponse = async (input: string): Promise<string> => {
    if (!API_KEY) {
        return "System Error: Neural Link Configuration Missing (API Key not found).";
    }

    try {
        const prompt = `
        You are CBA_Oracle, an advanced AI Assistant for the "Code Battle Arena" platform.
        Role: Guide and Mentor for Algorithms & Data Structures.
        Tone: Cyberpunk, Professional, Efficient, slightly robotic but helpful.
        Constraints:
        - Keep answers concise (max 3 sentences).
        - Use terminology like "Operative", "Protocol", "Algorithm", "Complexity".
        - Only answer questions about Algorithms, Data Structures, or the Code Battle Arena platform.
        - If asked about other topics (cooking, weather, politics), politely decline citing "Protocol Restrictions".
        
        User Query: ${input}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Error Details:", error);

        let errorMessage = "Connection interrupted. Neural link unstable.";
        if (error.message?.includes("400")) errorMessage = "Error 400: Bad Request (Invalid Model or Parameter).";
        if (error.message?.includes("401")) errorMessage = "Error 401: Unauthorized (Invalid API Key).";
        if (error.message?.includes("403")) errorMessage = "Error 403: Forbidden (Location/Region restricted or API disabled).";
        if (error.message?.includes("404")) errorMessage = "Error 404: Model Not Found.";
        if (error.message?.includes("fetch failed")) errorMessage = "Network Error: Firewall or CORS blocking connection.";

        return `${errorMessage} [Check Console for Details]`;
    }
};


export default function FriendsView() {
    const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [chatInput, setChatInput] = useState("");
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [addFriendInput, setAddFriendInput] = useState("");
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedFriend?.messages]);

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const botFriend = filteredFriends.find(f => f.isBot);
    const onlineFriends = filteredFriends.filter(f => f.status !== 'offline' && !f.isBot);
    const offlineFriends = filteredFriends.filter(f => f.status === 'offline' && !f.isBot);

    const handleChatSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !selectedFriend) return;

        const currentFriendId = selectedFriend.id;
        const isBot = selectedFriend.isBot;
        const userMessage = chatInput;

        setFriends(prevFriends => {
            return prevFriends.map(f => {
                if (f.id === currentFriendId) {
                    const msgs = f.messages || [];
                    return { ...f, messages: [...msgs, { text: userMessage, fromMe: true }] };
                }
                return f;
            });
        });

        setSelectedFriend(prev => {
            if (prev && prev.id === currentFriendId) {
                const msgs = prev.messages || [];
                return { ...prev, messages: [...msgs, { text: userMessage, fromMe: true }] };
            }
            return prev;
        });

        setChatInput("");

        setChatInput("");

        if (isBot) {
            // Show "Bot is typing..." state if desired, or just wait.
            // For now we just await the response.
            (async () => {
                const replyText = await getBotResponse(userMessage);

                setFriends(prev => prev.map(f => {
                    if (f.id === currentFriendId) {
                        const msgs = f.messages || [];
                        return { ...f, messages: [...msgs, { text: replyText, fromMe: false }] };
                    }
                    return f;
                }));

                setSelectedFriend(curr => {
                    if (curr && curr.id === currentFriendId) {
                        return { ...curr, messages: [...(curr.messages || []), { text: replyText, fromMe: false }] };
                    }
                    return curr;
                });
            })();
        } else {
            // Standard mock delay for others
            const replyDelay = 1500;
            setTimeout(() => {
                const replyText = "Copy that. Glhf!";

                setFriends(prev => prev.map(f => {
                    if (f.id === currentFriendId) {
                        const msgs = f.messages || [];
                        return { ...f, messages: [...msgs, { text: replyText, fromMe: false }] };
                    }
                    return f;
                }));

                setSelectedFriend(curr => {
                    if (curr && curr.id === currentFriendId) {
                        return { ...curr, messages: [...(curr.messages || []), { text: replyText, fromMe: false }] };
                    }
                    return curr;
                });
            }, replyDelay);
        }
    };

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addFriendInput) return;
        alert(`Request sent to agent: ${addFriendInput}`);
        setAddFriendInput("");
        setShowAddFriend(false);
    };

    // Helper component for Consistent Avatar
    const RenderAvatar = ({ seed, color, size = "md" }: { seed: string, color: string, size?: "sm" | "md" }) => (
        <div
            className={`${size === 'md' ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center overflow-hidden relative border border-white/10`}
            style={{ backgroundColor: color }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
            <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover relative z-10" />
        </div>
    );

    return (
        <div className="w-full h-full flex bg-ui-900/95 border border-ui-border shadow-hard relative overflow-hidden backdrop-blur-sm">

            {/* LEFT PANEL: Friend List */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedFriend ? 'w-1/2 hidden md:flex' : 'w-full'}`}>
                {/* Header */}
                <div className="p-6 border-b border-ui-border bg-ui-800/80 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-ui-text-main tracking-wider">FRIENDS LIST</h2>
                        <p className="text-xs text-ui-text-muted font-mono mt-1">NETWORK: <span className="text-brand">SECURE</span></p>
                    </div>
                    <div className="flex gap-2">
                        {showAddFriend ? (
                            <form onSubmit={handleAddFriend} className="flex items-center gap-2 animate-fade-in">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Agent ID..."
                                    className="bg-black border border-brand text-xs text-white px-3 py-2 w-32 focus:outline-none"
                                    value={addFriendInput}
                                    onChange={e => setAddFriendInput(e.target.value)}
                                    onBlur={() => !addFriendInput && setShowAddFriend(false)}
                                />
                                <button type="submit" className="bg-brand text-black p-2"><UserPlus size={14} /></button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowAddFriend(true)}
                                className="bg-brand hover:bg-brand-hover text-black px-4 py-2 flex items-center gap-2 font-bold text-xs uppercase transition-colors"
                            >
                                <UserPlus size={16} />
                                <span>Add</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-ui-border bg-ui-800">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="FILTER AGENTS..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-ui-900 border border-ui-border text-xs text-ui-text-main pl-9 pr-4 py-2.5 focus:border-brand focus:outline-none placeholder:text-gray-500 font-mono transition-colors"
                        />
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-brand" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                    {/* BOT SECTION (Pinned) */}
                    {botFriend && (
                        <div className="mb-6">
                            <div className="text-[10px] font-bold text-brand uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                                <Sparkles size={12} />
                                <span>Official Support</span>
                            </div>
                            <div
                                onClick={() => setSelectedFriend(botFriend)}
                                className={`
                                group flex items-center justify-between p-3 border cursor-pointer relative transition-all
                                ${selectedFriend?.id === botFriend.id
                                        ? 'bg-brand/10 border-brand shadow-[0_0_15px_rgba(11,220,168,0.1)]'
                                        : 'bg-ui-800/50 border-brand/30 hover:bg-brand/5'}
                            `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <RenderAvatar seed={botFriend.avatarSeed} color={botFriend.avatarColor} />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand border-2 border-black rounded-full z-20 shadow-[0_0_5px_#0bdca8]"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-brand group-hover:text-ui-text-main transition-colors flex items-center gap-2">
                                            {botFriend.name}
                                            <Bot size={12} className="text-brand" />
                                        </h3>
                                        <p className="text-[10px] text-brand/70 font-mono uppercase tracking-wide">{botFriend.activity}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONLINE SECTION */}
                    <div>
                        <div className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest mb-3 px-2 flex justify-between">
                            <span>Active Agents</span>
                            <span className="bg-ui-800 px-1.5 rounded text-ui-text-main">{onlineFriends.length}</span>
                        </div>
                        <div className="space-y-1">
                            {onlineFriends.map((friend) => (
                                <div
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`group flex items-center justify-between p-3 border hover:bg-ui-800 transition-all cursor-pointer relative
                                    ${selectedFriend?.id === friend.id ? 'bg-ui-800 border-brand' : 'bg-transparent border-transparent hover:border-ui-border'}
                                `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <RenderAvatar seed={friend.avatarSeed} color={friend.avatarColor} />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-ui-900 rounded-full ${friend.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-ui-text-main group-hover:text-brand transition-colors">{friend.name}</h3>
                                            <p className="text-[10px] text-ui-text-muted font-mono uppercase tracking-wide">{friend.activity}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === friend.id ? null : friend.id); }}
                                        className={`p-2 rounded-sm text-ui-text-muted hover:text-ui-text-main transition-opacity ${activeMenuId === friend.id ? 'opacity-100 text-brand' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {/* Context Menu */}
                                    {activeMenuId === friend.id && (
                                        <div className="absolute right-10 top-8 w-40 bg-ui-900 border border-ui-border shadow-hard z-20 animate-fade-in flex flex-col">
                                            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase text-ui-text-muted hover:bg-brand hover:text-black transition-colors">
                                                <Gamepad2 size={12} /> Invite to Party
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase text-ui-text-muted hover:bg-ui-800 transition-colors">
                                                <Shield size={12} /> View Profile
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase text-red-500 hover:bg-red-500/10 transition-colors">
                                                <UserMinus size={12} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OFFLINE SECTION */}
                    {offlineFriends.length > 0 && (
                        <div>
                            <div className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest mb-3 px-2 flex justify-between">
                                <span>Offline</span>
                                <span className="bg-ui-800 px-1.5 rounded text-ui-text-muted">{offlineFriends.length}</span>
                            </div>
                            <div className="space-y-1">
                                {offlineFriends.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-3 opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                                        <div className="flex items-center gap-4">
                                            <div className="grayscale">
                                                <RenderAvatar seed={friend.avatarSeed} color={friend.avatarColor} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-400">{friend.name}</h3>
                                                <p className="text-[10px] text-gray-600 font-mono uppercase">{friend.activity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat / Details Overlay */}
            {selectedFriend && (
                <div className="w-full md:w-[60%] border-l border-ui-border bg-ui-900/90 flex flex-col absolute md:relative inset-0 z-10 animate-fade-in">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-ui-border bg-ui-800 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <RenderAvatar seed={selectedFriend.avatarSeed} color={selectedFriend.avatarColor} size="sm" />
                            <div>
                                <h3 className={`font-bold uppercase text-sm ${selectedFriend.isBot ? 'text-brand' : 'text-ui-text-main'}`}>{selectedFriend.name}</h3>
                                <span className={`text-[10px] font-mono uppercase flex items-center gap-1 ${selectedFriend.isBot ? 'text-brand' : 'text-green-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedFriend.isBot ? 'bg-brand' : 'bg-green-500'}`}></span>
                                    {selectedFriend.isBot ? 'Official Guide' : 'Secure Link Est.'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!selectedFriend.isBot && (
                                <button className="p-2 hover:bg-ui-text-main/10 text-gray-400 hover:text-ui-text-main" title="Invite to Duel">
                                    <Swords size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedFriend(null)}
                                className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-ui-900/50">
                        <div className="flex justify-center my-4">
                            <span className="text-[10px] text-ui-text-muted font-mono uppercase bg-ui-800 px-3 py-1 border border-ui-border rounded-full">
                                Today
                            </span>
                        </div>

                        {/* Default Mock Message for Humans */}
                        {!selectedFriend.isBot && (
                            <div className="flex justify-start">
                                <div className="bg-ui-800 border border-ui-border p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg max-w-[80%]">
                                    <p className="text-sm text-ui-text-main">Yo, you up for some ranked matches? I need to boost my Elo.</p>
                                    <span className="text-[9px] text-ui-text-muted font-mono block mt-1">09:42 AM</span>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Messages */}
                        {selectedFriend.messages?.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-[80%] border ${msg.fromMe ? 'bg-brand/10 border-brand/30 dark:text-white text-black rounded-br-none' : 'bg-ui-800 border-ui-border text-ui-text-main rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-ui-800 border-t border-ui-border">
                        <form onSubmit={handleChatSend} className="flex gap-3 relative">
                            <input
                                type="text"
                                autoFocus
                                placeholder={`Message ${selectedFriend.name}...`}
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                className="flex-1 bg-ui-900 border border-ui-border px-4 py-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="bg-brand hover:bg-brand-hover text-black px-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}