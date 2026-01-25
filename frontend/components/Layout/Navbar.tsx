import React, { useState, useEffect } from "react";
import { Menu, Settings, LogOut, ShieldCheck, Sun, Moon } from "lucide-react";
import { getMe } from "../../services/authService";

interface NavbarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isDark?: boolean;
    toggleTheme?: () => void;
}

const COLORS: Record<string, string> = {
    red: "#ef4444",
    orange: "#f97316",
    yellow: "#eab308",
    green: "#22c55e",
    teal: "#14b8a6",
    blue: "#3b82f6",
    purple: "#a855f7",
    pink: "#ec4899"
};

export default function Navbar({ currentView, onNavigate, isDark, toggleTheme }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        getMe().then(res => {
            if (res.user) setUser(res.user);
        }).catch(err => console.error("Failed to fetch navbar user", err));
    }, []);

    const navItems = [
        { id: 'friends', label: 'Friends' },
        { id: 'confession', label: 'Confession' },
        { id: 'support', label: 'Support' }
    ];

    const handleSettingsClick = () => {
        onNavigate('settings');
        setIsMenuOpen(false);
    };

    const handleAdminClick = () => {
        onNavigate('admin');
        setIsMenuOpen(false);
    };

    const handleLogoutClick = () => {
        onNavigate('login');
        setIsMenuOpen(false);
    };

    const displayName = user?.display_name || user?.username || "Guest";
    const elo = user?.rating || 0;
    const avatarAnimal = user?.avatar_animal || "robot";
    const avatarColor = user?.avatar_color || "teal";
    const avatarBg = COLORS[avatarColor] || "#14b8a6";

    return (
        <nav className="w-full h-full flex items-center justify-between px-6 bg-ui-800 relative z-50 transition-colors duration-300">

            {/* Brand - Click to go Home */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-brand flex items-center justify-center font-bold text-black skew-x-[-10deg] group-hover:bg-ui-text-main transition-colors">
                    <span className="skew-x-[10deg] group-hover:text-white transition-colors">CB</span>
                </div>
                <span className="text-xl font-display font-bold text-ui-text-main tracking-widest">
                    CODEBATTLE<span className="text-brand group-hover:text-ui-text-main transition-colors">ARENA</span>
                </span>
            </button>

            {/* Main Nav - Desktop */}
            <div className="hidden lg:flex items-center gap-1 h-full">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                    h-full px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors
                    ${currentView === item.id
                                ? 'border-brand text-ui-text-main bg-ui-text-main/5'
                                : 'border-transparent text-ui-text-muted hover:text-ui-text-main hover:bg-ui-text-main/5'}
                `}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-ui-text-main/5 text-ui-text-muted hover:text-brand transition-colors"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3 border-r border-ui-border pr-4 mr-2">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-ui-text-main uppercase">{displayName}</div>
                        <div className="text-[10px] font-mono text-brand font-bold tracking-wider">ELO: {elo}</div>
                    </div>

                    {/* Updated Avatar to Match Settings Style */}
                    <div
                        className="w-8 h-8 flex items-center justify-center overflow-hidden relative border border-white/20 shadow-glow rounded-md"
                        style={{ backgroundColor: avatarBg }}
                    >
                        <img
                            src={`https://ssl.gstatic.com/docs/common/profile/${avatarAnimal}_lg.png`}
                            alt="User"
                            className="w-full h-full object-contain relative z-10"
                        />
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`
                    flex items-center justify-center w-10 h-10 border transition-all
                    ${isMenuOpen ? 'bg-brand border-brand text-black' : 'bg-ui-700 border-ui-border text-ui-text-muted hover:text-ui-text-main hover:border-ui-text-muted'}
                `}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-ui-900 border border-ui-border shadow-hard z-[100]">
                            <div className="p-1">
                                <button
                                    onClick={handleAdminClick}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-ui-text-muted hover:text-ui-text-main hover:bg-ui-800 transition-colors text-left group"
                                >
                                    <ShieldCheck size={14} className="group-hover:text-brand transition-colors" />
                                    <span className="font-bold tracking-wide uppercase text-[10px]">Admin Panel</span>
                                </button>
                                <button
                                    onClick={handleSettingsClick}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-ui-text-muted hover:text-ui-text-main hover:bg-ui-800 transition-colors text-left group"
                                >
                                    <Settings size={14} className="group-hover:text-brand transition-colors" />
                                    <span className="font-bold tracking-wide uppercase text-[10px]">Settings</span>
                                </button>
                                <div className="h-[1px] bg-ui-border my-1"></div>
                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-ui-800 transition-colors text-left"
                                >
                                    <LogOut size={14} />
                                    <span className="font-bold tracking-wide uppercase text-[10px]">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}