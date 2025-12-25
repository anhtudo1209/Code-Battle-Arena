import React, { useState } from "react";
import Header from "../components/Header";
import { Search } from "lucide-react";

// Mock data - backend integration left blank
const MOCK_DATA = {
    find: [
        {
            name: "Alex Rivera",
            role: "Systems Engineer",
            elo: 1820,
            bio: "If it doesn't compile, I don't sleep. Building a distributed DB.",
            tags: ["Rust", "Go", "Kubernetes"],
            btn: "Connect",
        },
        {
            name: "Jordan Lee",
            role: "Competitive Coder",
            elo: 2100,
            bio: "Grandmaster on Codeforces. Here to crush bugs.",
            tags: ["C++", "Python", "Algorithms"],
            btn: "Connect",
        },
        {
            name: "Marcus Johnson",
            role: "Security Analyst",
            elo: 1950,
            bio: "Pentesting your firewall right now. Just kidding (maybe).",
            tags: ["Kali", "Network", "Crypto"],
            btn: "Connect",
        },
    ],
    friends: [
        {
            name: "Sarah Chen",
            role: "Frontend Architect",
            elo: 1650,
            bio: "Obsessed with pixel perfection. Looking for backend partner.",
            tags: ["React", "Three.js", "UI/UX"],
            btn: "Message",
            color: "indigo",
        },
        {
            name: "David Kim",
            role: "ML Engineer",
            elo: 1550,
            bio: "Training models and breaking prod. Ask me about LLMs.",
            tags: ["Python", "PyTorch", "Gemini"],
            btn: "Message",
            color: "indigo",
        },
    ],
    requests: [
        {
            name: "Emily Davis",
            role: "Full Stack Dev",
            elo: 1400,
            bio: "Learning everyday. Currently exploring WebAssembly.",
            tags: ["Node.js", "Vue", "Postgres"],
            btn: "request",
        },
    ],
};

export default function Friends() {
    const [activeTab, setActiveTab] = useState("find");
    const [searchQuery, setSearchQuery] = useState("");

    // TODO: Backend integration
    // useEffect(() => { fetchFriends(); fetchRequests(); }, []);

    const handleConnect = (userName) => {
        console.log("Connect to:", userName);
        // TODO: Backend - POST /api/friends/request
    };

    const handleMessage = (userName) => {
        console.log("Message:", userName);
        // TODO: Navigate to chat or open message modal
    };

    const handleAcceptRequest = (userName) => {
        console.log("Accept request from:", userName);
        // TODO: Backend - POST /api/friends/accept
    };

    const handleDeclineRequest = (userName) => {
        console.log("Decline request from:", userName);
        // TODO: Backend - POST /api/friends/decline
    };

    const data = MOCK_DATA[activeTab] || [];
    const filteredData = data.filter(u =>
        !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const friendsCount = MOCK_DATA.friends.length;
    const requestsCount = MOCK_DATA.requests.length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Header />

            <main className="pt-24 px-4 pb-10">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-800">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                1,204 Developers Online
                            </span>
                            <h2 className="text-3xl font-bold mt-3">
                                Battle <span className="text-emerald-400">Partners</span>
                            </h2>
                            <p className="text-slate-400 mt-2 max-w-xl">
                                Find your next pair programming partner, hackathon teammate, or coding rival.
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setActiveTab("find")}
                                className={`px-5 py-2 text-sm rounded-xl transition-all ${activeTab === "find" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                Find Developers
                            </button>
                            <button
                                onClick={() => setActiveTab("friends")}
                                className={`px-5 py-2 text-sm rounded-xl transition-all ${activeTab === "friends" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                My Friends
                                <span className="ml-1 text-xs bg-slate-700 px-1.5 py-0.5 rounded">{friendsCount}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("requests")}
                                className={`px-5 py-2 text-sm rounded-xl transition-all ${activeTab === "requests" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                Requests
                                {requestsCount > 0 && (
                                    <span className="ml-1 text-xs bg-rose-500 px-1.5 py-0.5 rounded">{requestsCount}</span>
                                )}
                            </button>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name, role, or tech stack..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {filteredData.length === 0 ? (
                            <div className="col-span-3 text-center py-12 text-slate-500">
                                No developers found.
                            </div>
                        ) : (
                            filteredData.map((user, idx) => (
                                <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all">

                                    {/* User Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                            <div className="text-xs text-slate-400">
                                                {user.role} · <span className="text-emerald-400">ELO {user.elo}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-sm text-slate-300 mb-4">{user.bio}</p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {user.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    {user.btn === "request" ? (
                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => handleAcceptRequest(user.name)}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg py-2 text-sm font-semibold transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDeclineRequest(user.name)}
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-lg py-2 text-sm transition-colors"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => user.btn === "Message" ? handleMessage(user.name) : handleConnect(user.name)}
                                            className={`mt-auto rounded-lg py-2 font-semibold text-sm transition-colors ${user.color === "indigo"
                                                    ? "bg-indigo-600 hover:bg-indigo-500"
                                                    : "bg-emerald-600 hover:bg-emerald-500"
                                                }`}
                                        >
                                            {user.btn}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
