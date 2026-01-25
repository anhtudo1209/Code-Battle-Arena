import React, { useState, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import FriendsView from './components/Views/FriendsView';
import ConfessionView from './components/Views/ConfessionView';
import SupportView from './components/Views/SupportView';
import SettingsView from './components/Views/SettingsView';
import AdminView from './components/Views/AdminView';
import PracticeView from './components/Views/PracticeView';
import PlayView from './components/Views/PlayView';
import LoginView from './components/Views/LoginView';

// Import background images
import mainDarkBg from './components/img/maindark.png';
import mainLightBg from './components/img/mainlight.png';

function App() {
    const [isDark, setIsDark] = useState(true);
    const [currentView, setCurrentView] = useState('login'); // Default to login
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Apply theme class to body/app wrapper
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
            setCurrentView('home');
        }
    }, []);

    // Handle Login
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setCurrentView('home');
    };

    // Handle Logout (called via onNavigate('login'))
    const handleNavigate = (view: string) => {
        if (view === 'login') {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setIsDark(true); // Always revert to dark mode on login screen
        }
        setCurrentView(view);
    };

    return (
        <div className={`h-screen w-screen bg-ui-900 text-ui-text-main font-sans overflow-hidden relative flex flex-col transition-colors duration-300`}>

            {/* 1. BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[60s] ease-linear hover:scale-105 opacity-20 dark:opacity-40"
                    style={{
                        backgroundImage: currentView === 'home' ? `url(${isDark ? '/img/maindark.png' : '/img/mainlight.png'})` : `url('https://wallpapers.com/images/hd/cyberpunk-city-street-scenery-l650493264.jpg')`,
                    }}
                />
                {/* Overlay for readability - lighter in light mode, darker in dark mode */}
                <div className="absolute inset-0 bg-white/80 dark:bg-black/60 pointer-events-none transition-colors duration-300" />
            </div>

            {/* 2. UI LAYER (Solid Blocks) */}
            <div className="relative z-10 flex flex-col h-full">

                {/* FULL SCREEN LOGIN VIEW */}
                {currentView === 'login' && (
                    <div className="w-full h-full z-50">
                        <LoginView onLoginSuccess={handleLoginSuccess} />
                    </div>
                )}

                {/* MAIN APP INTERFACE (Only when authenticated and not on login view) */}
                {currentView !== 'login' && (
                    <>
                        {/* Top Bar - Solid Block */}
                        <div className="w-full h-16 shrink-0 border-b border-ui-border bg-ui-800 z-50 shadow-hard">
                            <Navbar
                                currentView={currentView}
                                onNavigate={handleNavigate}
                                isDark={isDark}
                                toggleTheme={() => setIsDark(!isDark)}
                            />
                        </div>

                        {/* Main Workspace - Layout with Gaps */}
                        <div className="flex-1 flex p-4 gap-4 overflow-hidden min-h-0" style={{ backgroundImage: currentView === 'home' ? `url(${isDark ? '/img/maindark.png' : '/img/mainlight.png'})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>

                            {/* Left Sidebar - Solid opaque block */}
                            <div className="w-[320px] shrink-0 flex flex-col h-full bg-ui-800 border border-ui-border shadow-hard">
                                <Sidebar onNavigate={handleNavigate} />
                            </div>

                            {/* Center Area */}
                            <div className="flex-1 relative hidden md:block">

                                {/* VIEW: HOME (Default transparent look) */}
                                {currentView === 'home' && (
                                    <div className="w-full h-full relative group animate-fade-in">
                                        {/* Floating Center Widget */}
                                        <div className="absolute top-0 left-0 p-4">
                                            <div className="bg-ui-800 text-ui-text-main px-4 py-2 border-l-4 border-brand inline-block shadow-lg">
                                                <span className="font-display font-bold tracking-widest text-sm text-brand">MISSION CONTROL // ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* VIEW: FRIENDS */}
                                {currentView === 'friends' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <FriendsView />
                                    </div>
                                )}

                                {/* VIEW: CONFESSION */}
                                {currentView === 'confession' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <ConfessionView />
                                    </div>
                                )}

                                {/* VIEW: SUPPORT */}
                                {currentView === 'support' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <SupportView />
                                    </div>
                                )}

                                {/* VIEW: SETTINGS */}
                                {currentView === 'settings' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <SettingsView onNavigate={handleNavigate} />
                                    </div>
                                )}

                                {/* VIEW: ADMIN */}
                                {currentView === 'admin' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <AdminView />
                                    </div>
                                )}

                                {/* VIEW: PRACTICE */}
                                {currentView === 'practice' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <PracticeView />
                                    </div>
                                )}

                                {/* VIEW: PLAY (Ranked / Create Room) */}
                                {currentView === 'play' && (
                                    <div className="w-full h-full animate-fade-in">
                                        <PlayView />
                                    </div>
                                )}

                            </div>
                        </div>
                    </>
                )}
            </div>
            <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.99); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
}

export default App;