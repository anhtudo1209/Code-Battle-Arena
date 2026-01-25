import React, { useState, useEffect } from "react";
import { User, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

import { login, register, forgotPassword } from "../../services/authService";

// --- ICONS ---
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

interface LoginViewProps {
    onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
    // Mode: 'login' | 'register' | 'forgot'
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

    // Common State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Login State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Register State
    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMsg, setForgotMsg] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    // --- HANDLERS ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");

        try {
            await login({ username, password });
            // Token is handled inside authService (localStorage)
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");

        if (regPassword !== regConfirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register({ username: regUsername, email: regEmail, password: regPassword });
            // Auto login handled by authService (stores token)
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) {
            setForgotMsg("Please enter your email address.");
            return;
        }
        setLoading(true);
        setForgotMsg("");
        try {
            await forgotPassword(forgotEmail);
            setEmailSent(true);
            setForgotMsg("If an account with that email exists, a password reset link has been sent.");
            setForgotEmail("");
        } catch (err: any) {
            setForgotMsg(err.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLoginSuccess();
        }, 1000);
    };

    // --- RENDER ---
    return (
        <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-black/60 dark:bg-black/60 z-0"></div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-ui-800/90 border border-ui-border shadow-hard relative z-10 backdrop-blur-md animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>

                {/* Header */}
                <div className="p-8 pb-6 text-center border-b border-ui-border">
                    <div className="w-12 h-12 bg-brand mx-auto mb-4 flex items-center justify-center font-black text-xl text-black skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">CB</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-ui-text-main tracking-widest uppercase">
                        {mode === 'login' ? "System Access" : mode === 'register' ? "New Operative" : "Recovery"}
                    </h2>
                    <p className="text-xs text-ui-text-muted font-mono mt-1">
                        {mode === 'forgot' ? "RESTORE NEURAL LINK" : "SECURE CONNECTION ESTABLISHED"}
                    </p>
                </div>

                <div className="p-8 pt-6">

                    {/* --- LOGIN FORM --- */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Username or Email"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-10 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-ui-text-main transition-colors"
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${rememberMe ? 'bg-brand border-brand' : 'bg-transparent border-gray-600'}`}>
                                        {rememberMe && <div className="w-2 h-2 bg-black"></div>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                    <span className="text-gray-500 font-bold uppercase group-hover:text-ui-text-muted">Remember Me</span>
                                </label>
                                <button type="button" onClick={() => setMode('forgot')} className="text-brand hover:text-ui-text-main font-bold uppercase transition-colors">
                                    Forgot Password?
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand hover:bg-white text-black py-3 font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(11,220,168,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                {loading ? "Authenticating..." : "Login"}
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ui-border"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-ui-800 px-2 text-gray-500 font-bold">Or Connect With</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-2.5 border border-ui-border bg-ui-900 hover:bg-ui-800 transition-colors group">
                                    <FacebookIcon />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-ui-text-main">Facebook</span>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-2.5 border border-ui-border bg-ui-900 hover:bg-ui-800 transition-colors group">
                                    <GoogleIcon />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-ui-text-main">Google</span>
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-xs font-mono text-gray-500">
                                    Don't have an account?{" "}
                                    <button type="button" onClick={() => setMode('register')} className="text-brand font-bold underline decoration-brand/50 underline-offset-4 hover:text-ui-text-main transition-colors">
                                        Register
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* --- REGISTER FORM --- */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors"><User size={18} /></div>
                                    <input type="text" placeholder="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors"><Mail size={18} /></div>
                                    <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors"><Lock size={18} /></div>
                                    <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-brand transition-colors"><Lock size={18} /></div>
                                    <input type="password" placeholder="Confirm Password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} className="w-full bg-ui-900 border border-ui-border py-3 pl-10 pr-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors" required />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-white text-black py-3 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : "Register"}
                            </button>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-2.5 border border-ui-border bg-ui-900 hover:bg-ui-800 transition-colors group">
                                    <FacebookIcon />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-ui-text-main">Facebook</span>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-2.5 border border-ui-border bg-ui-900 hover:bg-ui-800 transition-colors group">
                                    <GoogleIcon />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-ui-text-main">Google</span>
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-xs font-mono text-gray-500">
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => setMode('login')} className="text-brand font-bold underline decoration-brand/50 underline-offset-4 hover:text-ui-text-main transition-colors">
                                        Login
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* --- FORGOT PASSWORD FORM --- */}
                    {mode === 'forgot' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-ui-900 rounded-full flex items-center justify-center mx-auto mb-3 text-brand border border-ui-border">
                                    <Mail size={24} />
                                </div>
                                <h3 className="text-ui-text-main font-bold uppercase">Recovery Protocol</h3>
                                <p className="text-xs text-gray-500 mt-2 font-mono">Enter your neural link email to receive a reset token.</p>
                            </div>

                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Enter Email Address"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    className="w-full bg-ui-900 border border-ui-border py-3 px-4 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    required
                                />

                                {forgotMsg && (
                                    <div className={`text-xs font-bold p-3 text-center border ${emailSent ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                                        {forgotMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-ui-700 hover:bg-ui-text-main hover:text-ui-900 text-white py-3 font-bold uppercase transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Transmitting..." : "Send Reset Link"}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-xs font-mono text-gray-500">
                                        Remember your password?{" "}
                                        <button type="button" onClick={() => setMode('login')} className="text-brand font-bold underline decoration-brand/50 underline-offset-4 hover:text-ui-text-main transition-colors">
                                            Login
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}