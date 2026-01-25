import React, { useState } from "react";
import { 
    MessageCircle, Heart, Share2, Send, Flame, Clock, 
    MoreHorizontal, Filter, Terminal, AlertTriangle,
    Ghost, Briefcase
} from "lucide-react";

// --- Types & Constants ---

type CategoryType = 'bug' | 'career' | 'rant' | 'meme';

interface Confession {
    id: number;
    authorId: string;
    avatarSeed: string;
    avatarColor: string;
    category: CategoryType;
    content: string;
    time: string;
    likes: number;
    comments: number;
    hasLiked?: boolean;
    expanded?: boolean;
}

interface Comment {
    id: number;
    author: string;
    text: string;
    time: string;
}

const CATEGORIES: Record<CategoryType, { label: string; color: string; icon: any }> = {
    bug: { label: 'Runtime Error', color: 'text-red-500 border-red-500/50 bg-red-500/10', icon: AlertTriangle },
    career: { label: 'Career Path', color: 'text-blue-400 border-blue-400/50 bg-blue-400/10', icon: Briefcase },
    rant: { label: 'System Rant', color: 'text-orange-500 border-orange-500/50 bg-orange-500/10', icon: Flame },
    meme: { label: 'Shitpost', color: 'text-purple-500 border-purple-500/50 bg-purple-500/10', icon: Ghost },
};

const INITIAL_CONFESSIONS: Confession[] = [
  { id: 1, authorId: "0x82...73", avatarSeed: "user1", avatarColor: "#f97316", category: 'rant', content: "I pushed directly to main on a Friday evening and went home. The anxiety is destroying my weekend. Why did I do this?", time: "2h ago", likes: 42, comments: 5 },
  { id: 2, authorId: "0x11...02", avatarSeed: "user2", avatarColor: "#22c55e", category: 'bug', content: "Spent 4 hours debugging a regex only to realize I was editing the wrong file. I am not a smart man.", time: "5h ago", likes: 128, comments: 23 },
  { id: 3, authorId: "0x99...31", avatarSeed: "user3", avatarColor: "#3b82f6", category: 'career', content: "Just got an offer for 2x my current salary but the tech stack is PHP/WordPress. Do I sell my soul?", time: "1d ago", likes: 356, comments: 89 },
  { id: 4, authorId: "0x44...21", avatarSeed: "user4", avatarColor: "#a855f7", category: 'meme', content: "Junior Dev: 'It works on my machine.'\nSenior Dev: 'Then we'll ship your machine.'", time: "1d ago", likes: 88, comments: 12 },
];

const MOCK_COMMENTS: Comment[] = [
    { id: 101, author: "Anon_#9921", text: "We've all been there. Drink some water.", time: "1h ago" },
    { id: 102, author: "Anon_#1120", text: "F in the chat.", time: "30m ago" },
];

const RenderAvatar = ({ seed, color }: { seed: string, color: string }) => (
    <div 
        className="w-8 h-8 flex items-center justify-center overflow-hidden relative border border-white/10 rounded-sm"
        style={{ backgroundColor: color }}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
        <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover relative z-10" />
    </div>
);

export default function ConfessionView() {
  const [confessions, setConfessions] = useState<Confession[]>(INITIAL_CONFESSIONS);
  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('rant');
  const [filter, setFilter] = useState<'all' | CategoryType>('all');
  const [sort, setSort] = useState<'latest' | 'top'>('latest');

  // --- Actions ---
  const handleLike = (id: number) => {
      setConfessions(prev => prev.map(post => {
          if (post.id === id) {
              const isLiking = !post.hasLiked;
              return {
                  ...post,
                  hasLiked: isLiking,
                  likes: isLiking ? post.likes + 1 : post.likes - 1
              };
          }
          return post;
      }));
  };

  const handleExpand = (id: number) => {
      setConfessions(prev => prev.map(post => 
          post.id === id ? { ...post, expanded: !post.expanded } : post
      ));
  };

  const handlePost = () => {
      if (!inputText.trim()) return;
      
      const newPost: Confession = {
          id: Date.now(),
          authorId: `0x${Math.floor(Math.random() * 9000).toString(16)}...${Math.floor(Math.random() * 99)}`,
          avatarSeed: Math.random().toString(),
          avatarColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][Math.floor(Math.random() * 4)],
          category: selectedCategory,
          content: inputText,
          time: "Just now",
          likes: 0,
          comments: 0
      };

      setConfessions([newPost, ...confessions]);
      setInputText("");
  };

  // --- Filter & Sort ---
  const filteredConfessions = confessions
    .filter(c => filter === 'all' || c.category === filter)
    .sort((a, b) => {
        if (sort === 'top') return b.likes - a.likes;
        return b.id - a.id; 
    });

  return (
    <div className="w-full h-full flex flex-col bg-ui-900 border border-ui-border shadow-hard relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="h-16 border-b border-ui-border bg-ui-800 shrink-0 flex items-center justify-between px-6 z-10">
            <div>
                <h2 className="text-xl font-display font-bold text-ui-text-main tracking-wider flex items-center gap-2">
                    <Ghost className="text-brand" size={20} />
                    THE CONFESSIONAL
                </h2>
                <p className="text-[10px] text-ui-text-muted font-mono tracking-widest uppercase">
                    ENCRYPTED CHANNEL // ANONYMITY GUARANTEED
                </p>
            </div>
            
            {/* Mobile Sort Toggle (Visible on small screens) */}
            <div className="flex md:hidden bg-ui-800 border border-ui-border rounded-sm">
                 <button onClick={() => setSort('latest')} className={`p-2 ${sort === 'latest' ? 'text-brand' : 'text-gray-500'}`}><Clock size={16}/></button>
                 <button onClick={() => setSort('top')} className={`p-2 ${sort === 'top' ? 'text-brand' : 'text-gray-500'}`}><Flame size={16}/></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR: FILTERS & STATS (Hidden on mobile) */}
            <div className="hidden md:flex w-64 border-r border-ui-border bg-ui-800 flex-col p-4 gap-6">
                
                {/* Global Stats */}
                <div className="bg-ui-800 border border-ui-border p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-ui-text-main">
                        <MessageCircle size={40} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Total Logs</span>
                    <div className="text-2xl font-mono font-bold text-ui-text-main mt-1">
                        {confessions.length + 842}
                    </div>
                    <div className="w-full h-1 bg-ui-700 mt-3 overflow-hidden">
                        <div className="h-full bg-brand w-3/4 animate-pulse"></div>
                    </div>
                </div>

                {/* Filter Menu */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Filter size={12} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Filter Matrix</span>
                    </div>
                    
                    <button 
                        onClick={() => setFilter('all')}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase border transition-all ${filter === 'all' ? 'bg-brand/10 border-brand text-ui-text-main' : 'border-transparent text-gray-500 hover:text-ui-text-main hover:bg-ui-800'}`}
                    >
                        <span>All Logs</span>
                        <span className="text-[10px] bg-ui-900 px-1.5 py-0.5 rounded text-gray-400">{confessions.length}</span>
                    </button>

                    {Object.entries(CATEGORIES).map(([key, data]) => (
                        <button 
                            key={key}
                            onClick={() => setFilter(key as CategoryType)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase border transition-all ${filter === key ? 'bg-ui-800 border-gray-500 text-ui-text-main' : 'border-transparent text-gray-500 hover:text-ui-text-main hover:bg-ui-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <data.icon size={12} />
                                <span>{data.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Sort Options */}
                <div className="mt-auto">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2 block">Sorting Protocol</span>
                     <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setSort('latest')}
                            className={`flex items-center justify-center gap-2 py-2 border text-[10px] font-bold uppercase transition-all ${sort === 'latest' ? 'border-brand text-brand bg-brand/5' : 'border-ui-border text-gray-500 hover:border-gray-500'}`}
                        >
                            <Clock size={12} /> Latest
                        </button>
                        <button 
                            onClick={() => setSort('top')}
                            className={`flex items-center justify-center gap-2 py-2 border text-[10px] font-bold uppercase transition-all ${sort === 'top' ? 'border-brand text-brand bg-brand/5' : 'border-ui-border text-gray-500 hover:border-gray-500'}`}
                        >
                            <Flame size={12} /> Top
                        </button>
                     </div>
                </div>
            </div>

            {/* MAIN FEED */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-ui-900/50 p-4 md:p-8">
                
                {/* 1. INPUT AREA */}
                <div className="max-w-3xl mx-auto mb-8 animate-fade-in">
                    <div className="bg-ui-800 border border-ui-border shadow-lg relative group focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                        {/* Terminal Header */}
                        <div className="bg-ui-900 border-b border-ui-border px-3 py-1.5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Terminal size={12} className="text-ui-text-muted" />
                                <span className="text-[10px] font-mono text-ui-text-muted uppercase">Input Stream</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                            </div>
                        </div>

                        {/* Text Area */}
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full bg-transparent text-sm text-ui-text-main placeholder:text-gray-600 focus:outline-none resize-none h-24 font-mono p-4"
                            placeholder="Initialize anonymous transmission..."
                        ></textarea>
                        
                        {/* Footer Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center p-3 border-t border-ui-border bg-ui-700 gap-3">
                            
                            {/* Category Selector */}
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
                                {Object.entries(CATEGORIES).map(([key, data]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key as CategoryType)}
                                        className={`
                                            flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-bold uppercase border transition-all whitespace-nowrap
                                            ${selectedCategory === key 
                                                ? data.color 
                                                : 'border-transparent text-gray-600 hover:bg-ui-700 hover:text-gray-400'}
                                        `}
                                    >
                                        <data.icon size={10} />
                                        {data.label}
                                    </button>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                <span className={`text-[10px] font-mono ${inputText.length > 250 ? 'text-red-500' : 'text-gray-600'}`}>
                                    {inputText.length}/280
                                </span>
                                <button 
                                    onClick={handlePost}
                                    disabled={!inputText.trim()}
                                    className="bg-ui-text-main text-ui-900 hover:bg-brand disabled:opacity-50 disabled:hover:bg-ui-text-main transition-colors px-4 py-1.5 text-xs font-bold uppercase flex items-center gap-2 shadow-lg"
                                >
                                    <span>Transmit</span>
                                    <Send size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONFESSION FEED */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {filteredConfessions.map((post) => {
                        const categoryStyle = CATEGORIES[post.category];
                        return (
                            <div key={post.id} className="bg-ui-800 border border-ui-border hover:border-ui-text-muted/30 transition-all flex flex-col group animate-fade-in relative overflow-hidden">
                                {/* Decor line on left */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${categoryStyle.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                                
                                <div className="p-5 flex flex-col h-full">
                                    {/* Post Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <RenderAvatar seed={post.avatarSeed} color={post.avatarColor} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-ui-text-main font-mono tracking-wide">{post.authorId}</span>
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${categoryStyle.color} flex items-center gap-1`}>
                                                        <categoryStyle.icon size={8} />
                                                        {categoryStyle.label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-mono block mt-0.5">{post.time}</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-600 hover:text-ui-text-main transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                    
                                    {/* Content */}
                                    <p className="text-sm text-ui-text-main leading-relaxed font-mono whitespace-pre-line pl-11 mb-4">
                                        {post.content}
                                    </p>

                                    {/* Interactions */}
                                    <div className="flex items-center gap-6 pl-11 border-t border-ui-border pt-3 mt-auto">
                                        <button 
                                            onClick={() => handleLike(post.id)}
                                            className={`flex items-center gap-2 transition-colors text-xs font-bold group/like ${post.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-ui-text-main'}`}
                                        >
                                            <Heart size={14} className={`transition-transform group-active/like:scale-75 ${post.hasLiked ? 'fill-red-500' : ''}`} />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleExpand(post.id)}
                                            className={`flex items-center gap-2 text-gray-500 hover:text-ui-text-main transition-colors text-xs font-bold ${post.expanded ? 'text-brand' : ''}`}
                                        >
                                            <MessageCircle size={14} />
                                            <span>{post.comments} Comments</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors text-xs font-bold ml-auto">
                                            <Share2 size={14} />
                                            <span className="hidden sm:inline">Share</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Comments (Solid Background) */}
                                {post.expanded && (
                                    <div className="bg-ui-900 border-t border-ui-border p-4 pl-16 animate-fade-in">
                                        <div className="space-y-4 mb-4">
                                            {MOCK_COMMENTS.map(comment => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="w-6 h-6 rounded bg-ui-800 border border-ui-border flex items-center justify-center text-[10px] font-mono text-gray-500">?</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-gray-400">{comment.author}</span>
                                                            <span className="text-[9px] text-gray-600">{comment.time}</span>
                                                        </div>
                                                        <p className="text-xs text-ui-text-muted mt-1">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Add a comment..." className="flex-1 bg-ui-800 border border-ui-border text-xs px-3 py-2 text-ui-text-main focus:outline-none focus:border-brand font-mono" />
                                            <button className="bg-ui-800 hover:bg-brand hover:text-black border border-ui-border hover:border-brand text-xs font-bold uppercase text-gray-400 px-3 py-2 transition-colors">
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State if filter returns nothing */}
                {filteredConfessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                        <Terminal size={48} className="mb-4" />
                        <h3 className="text-lg font-bold uppercase">No Signals Found</h3>
                        <p className="text-xs font-mono">Try adjusting your filter matrix.</p>
                    </div>
                )}

                <div className="h-20"></div> {/* Bottom spacer */}
            </div>
        </div>
    </div>
  );
}