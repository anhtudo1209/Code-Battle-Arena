import React, { useState } from "react";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import { Heart, MessageCircle, Share2, PenLine, Search, X, Rocket, MoreHorizontal, AlertCircle } from "lucide-react";

// Mock data - backend integration left blank
const MOCK_CONFESSIONS = [
    {
        id: "CF-9021",
        content: "I secretly judge people who use light mode in their IDE. It's like staring into the sun. How do you even code like that without burning your retinas?",
        timestamp: "2 hours ago",
        likes: 42,
        commentsCount: 2,
        commentsList: [
            { user: "Dev4Life", text: "My eyes burn just thinking about it.", time: "1h ago" },
            { user: "SolarFlare", text: "I use light mode to stay awake.", time: "30m ago" },
        ],
        tags: ["lightmode", "ide", "unpopular"],
        authorAlias: "DarkThemeLoyalist",
        bgClass: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
        id: "CF-9020",
        content: "I pushed directly to production on a Friday at 4:55 PM. The deployment pipeline failed, but I just closed my laptop and went home. The guilt is eating me alive.",
        timestamp: "5 hours ago",
        likes: 128,
        commentsCount: 3,
        commentsList: [
            { user: "TechLead", text: "So THAT'S why pagerduty went off.", time: "4h ago" },
            { user: "JuniorDev", text: "Legend.", time: "3h ago" },
            { user: "SysAdmin", text: "Please don't come to work on Monday.", time: "2h ago" },
        ],
        tags: ["production", "friday", "oops"],
        authorAlias: "SeniorDevOps",
        bgClass: "bg-gradient-to-br from-red-900 to-rose-800",
    },
    {
        id: "CF-9019",
        content: "Sometimes I use ChatGPT to write simple regex because my brain refuses to learn it properly. I've been a dev for 6 years.",
        timestamp: "1 day ago",
        likes: 892,
        commentsCount: 15,
        commentsList: [
            { user: "RegexWizard", text: "Does anyone actually learn regex?", time: "20h ago" },
        ],
        tags: ["regex", "ai", "confession"],
        authorAlias: "RegexHater",
        bgClass: "bg-gradient-to-br from-emerald-600 to-teal-800",
    },
];

export default function Confession() {
    const [confessions, setConfessions] = useState(MOCK_CONFESSIONS);
    const [sortBy, setSortBy] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newConfession, setNewConfession] = useState({ text: "", tags: "" });
    const [expandedComments, setExpandedComments] = useState({});
    const [likedPosts, setLikedPosts] = useState({});

    // TODO: Backend integration - fetch confessions
    // useEffect(() => { fetchConfessions(); }, []);

    const handleLike = (id) => {
        setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
        setConfessions(prev => prev.map(c =>
            c.id === id ? { ...c, likes: c.likes + (likedPosts[id] ? -1 : 1) } : c
        ));
        // TODO: Backend - POST /api/confessions/:id/like
    };

    const toggleComments = (id) => {
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmitConfession = () => {
        if (!newConfession.text.trim()) return;

        const confession = {
            id: `CF-${Math.floor(Math.random() * 10000)}`,
            content: newConfession.text,
            timestamp: "Just now",
            likes: 0,
            commentsCount: 0,
            commentsList: [],
            tags: newConfession.tags.split(",").map(t => t.trim()).filter(t => t),
            authorAlias: "Anonymous",
            bgClass: "bg-gradient-to-br from-purple-600 to-pink-800",
        };

        setConfessions(prev => [confession, ...prev]);
        setNewConfession({ text: "", tags: "" });
        setIsModalOpen(false);
        // TODO: Backend - POST /api/confessions
    };

    const handleShare = async (content) => {
        if (navigator.share) {
            try {
                await navigator.share({ title: "Code Battle Arena Confession", text: content, url: window.location.href });
            } catch (err) { /* User cancelled */ }
        } else {
            navigator.clipboard.writeText(`${content} - via Code Battle Arena`);
        }
    };

    const sortedConfessions = [...confessions].sort((a, b) =>
        sortBy === "popular" ? b.likes - a.likes : 0
    );

    const filteredConfessions = sortedConfessions.filter(c =>
        !searchQuery || c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
            <PageTitle title="Confession" />
            <Header />

            <main className="pt-24 pb-10 px-4 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950 to-slate-950">
                <div className="max-w-4xl mx-auto">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-xs font-medium mb-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Confessions
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Void</span> Log
                            </h2>
                            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
                                Anonymous confessions from the battlefield. Share your deployment disasters, spaghetti code shame, and impostor syndrome secrets.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <PenLine className="w-5 h-5" />
                            <span>Whisper Secret</span>
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl sticky top-20 z-30">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
                                <button
                                    onClick={() => setSortBy("newest")}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === "newest" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        }`}
                                >
                                    Newest
                                </button>
                                <button
                                    onClick={() => setSortBy("popular")}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === "popular" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        }`}
                                >
                                    Popular
                                </button>
                            </div>
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by tag or keyword..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Confessions Feed */}
                    <div className="grid gap-6">
                        {filteredConfessions.map(confession => (
                            <div key={confession.id} className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-900/10">

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner ${confession.bgClass}`}>
                                            {confession.authorAlias.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-200 text-sm md:text-base">{confession.authorAlias}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700/50">{confession.id}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{confession.timestamp}</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-600 hover:text-slate-300 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="mb-4">
                                    <p className={`text-slate-200 leading-relaxed whitespace-pre-line ${confession.content.length < 100 ? "text-lg font-medium" : "text-base"}`}>
                                        {confession.content}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {confession.tags.map(tag => (
                                        <span key={tag} className="text-[10px] md:text-xs font-medium text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50 hover:border-emerald-700/50 cursor-pointer transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="h-px w-full bg-slate-800/80 mb-4"></div>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <button
                                            onClick={() => handleLike(confession.id)}
                                            className={`flex items-center gap-2 transition-colors duration-200 ${likedPosts[confession.id] ? "text-rose-500" : "text-slate-400 hover:text-rose-400"}`}
                                        >
                                            <Heart className={`w-5 h-5 ${likedPosts[confession.id] ? "fill-current" : ""}`} />
                                            <span className="text-sm font-medium">{confession.likes + (likedPosts[confession.id] ? 1 : 0)}</span>
                                        </button>
                                        <button
                                            onClick={() => toggleComments(confession.id)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">{confession.commentsCount}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-slate-500 hover:text-amber-400 transition-colors" title="Report">
                                            <AlertCircle className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleShare(confession.content)} className="text-slate-500 hover:text-white transition-colors" title="Share">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                {expandedComments[confession.id] && (
                                    <div className="flex flex-col mt-4 pt-4 border-t border-slate-800/50">
                                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4 pr-1">
                                            {confession.commentsList.length > 0 ? confession.commentsList.map((comment, idx) => (
                                                <div key={idx} className="flex gap-3 mb-3">
                                                    <img src={`https://ui-avatars.com/api/?name=${comment.user}&background=random&color=fff`} className="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0" alt={comment.user} />
                                                    <div className="flex flex-col max-w-[85%]">
                                                        <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-700/50">
                                                            <span className="text-xs font-bold text-slate-200 block mb-0.5">{comment.user}</span>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 mt-1 ml-2">{comment.time}</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-xs text-slate-600 italic">No comments yet. Be the first!</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">U</div>
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="flex-1 bg-slate-950/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center py-12 text-slate-600 text-sm font-mono">
            // End of stream_
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Post a Confession
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Your Secret</label>
                                <textarea
                                    placeholder="I accidentally deleted the production database..."
                                    value={newConfession.text}
                                    onChange={e => setNewConfession(prev => ({ ...prev, text: e.target.value }))}
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none placeholder:text-slate-600 font-mono text-sm"
                                />
                                <div className="flex justify-end">
                                    <span className="text-xs text-slate-500">{newConfession.text.length}/500</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Tags</label>
                                <input
                                    type="text"
                                    placeholder="bug, sql, regret (comma separated)"
                                    value={newConfession.tags}
                                    onChange={e => setNewConfession(prev => ({ ...prev, tags: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="p-6 pt-2 flex justify-end gap-3 bg-slate-900/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-300 font-medium hover:text-white transition-colors text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitConfession}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 text-sm"
                            >
                                <Rocket className="w-4 h-4" />
                                <span>Post Secret</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
