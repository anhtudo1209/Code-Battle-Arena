import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Terminal,
  Bell,
  AlertTriangle,
  Key,
  LogOut,
  Save,
  Cpu,
  CheckCircle2
} from "lucide-react";

// Mock Data Types
interface UserProfile {
    username: string;
    displayName: string;
    avatarAnimal: string;
    avatarColor: string;
    bio: string;
}

const ANIMALS = ["alligator", "anteater", "axolotl", "badger", "bat", "beaver", "buffalo", "chameleon", "cheetah", "coyote", "dragon", "eagle", "fox", "frog", "lion", "panda", "penguin", "robot", "tiger", "wolf"];
const COLORS = [
    { name: "red", hex: "#ef4444" },
    { name: "orange", hex: "#f97316" },
    { name: "yellow", hex: "#eab308" },
    { name: "green", hex: "#22c55e" },
    { name: "teal", hex: "#14b8a6" },
    { name: "blue", hex: "#3b82f6" },
    { name: "purple", hex: "#a855f7" },
    { name: "pink", hex: "#ec4899" },
];

interface SettingsViewProps {
    onNavigate?: (view: string) => void;
}

export default function SettingsView({ onNavigate }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
      username: "CyberDrifter_01",
      displayName: "Drifter",
      avatarAnimal: "robot",
      avatarColor: "teal",
      bio: "Full stack developer by day, code warrior by night. Specializing in Python and recursive algorithms."
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  // Password State
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passMessage, setPassMessage] = useState("");

  const handleSaveProfile = () => {
      setIsSaving(true);
      // Simulate API call
      setTimeout(() => {
          setIsSaving(false);
          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 3000);
      }, 1000);
  };

  const handleUpdatePassword = () => {
      if (passwordForm.new !== passwordForm.confirm) {
          setPassMessage("Error: Checksum mismatch (Passwords do not match)");
          return;
      }
      setPassMessage("Success: Security protocols updated.");
      setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="w-full h-full flex flex-col bg-ui-900 border border-ui-border shadow-hard relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-ui-border bg-ui-800 shrink-0">
             <h2 className="text-2xl font-display font-bold text-ui-text-main tracking-wider flex items-center gap-2">
                <Cpu size={24} className="text-brand" />
                SYSTEM CONFIGURATION
             </h2>
             <p className="text-xs text-ui-text-muted font-mono mt-1">
                ADJUST NEURAL LINK PARAMETERS
             </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-64 border-r border-ui-border bg-black/5 dark:bg-black/20 flex flex-col p-4 gap-2">
                {[
                    { id: 'profile', icon: User, label: 'Identity' },
                    { id: 'account', icon: Shield, label: 'Security' },
                    { id: 'editor', icon: Terminal, label: 'Interface' },
                    { id: 'notifications', icon: Bell, label: 'Signals' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border
                            ${activeTab === tab.id 
                                ? 'bg-brand/10 border-brand text-ui-text-main' 
                                : 'bg-transparent border-transparent text-gray-500 hover:text-ui-text-main hover:bg-ui-800'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}

                <div className="mt-auto border-t border-ui-border pt-4">
                    <button 
                        onClick={() => onNavigate && onNavigate('login')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                    >
                        <LogOut size={16} />
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-ui-900">
                <div className="max-w-3xl mx-auto">
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="border-l-2 border-brand pl-4 mb-6">
                                <h3 className="text-xl font-bold text-ui-text-main uppercase">Public Identity</h3>
                                <p className="text-xs text-ui-text-muted font-mono">Visible to all operatives in the network.</p>
                            </div>

                            {/* Avatar Section */}
                            <div className="bg-ui-800 border border-ui-border p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div 
                                            className="w-32 h-32 border-2 flex items-center justify-center relative group"
                                            style={{ 
                                                backgroundColor: COLORS.find(c => c.name === profile.avatarColor)?.hex,
                                                borderColor: COLORS.find(c => c.name === profile.avatarColor)?.hex 
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                                            <img 
                                                src={`https://api.dicebear.com/9.x/bottts/svg?seed=${profile.avatarAnimal}`}
                                                alt="Avatar" 
                                                className="w-24 h-24 relative z-10"
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500 uppercase">{profile.avatarAnimal} // {profile.avatarColor}</span>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Color Tint (Frame Background)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {COLORS.map(color => (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => setProfile({...profile, avatarColor: color.name})}
                                                        className={`w-8 h-8 border transition-all ${profile.avatarColor === color.name ? 'border-white dark:border-white scale-110 shadow-glow' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Avatar Base</label>
                                             <div className="grid grid-cols-5 gap-2 h-32 overflow-y-auto custom-scrollbar pr-2 border border-ui-border p-2 bg-ui-900">
                                                {ANIMALS.map(animal => (
                                                    <button
                                                        key={animal}
                                                        onClick={() => setProfile({...profile, avatarAnimal: animal})}
                                                        className={`p-1 border hover:bg-ui-700 transition-colors ${profile.avatarAnimal === animal ? 'border-brand bg-brand/10' : 'border-transparent'}`}
                                                    >
                                                        <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${animal}`} alt={animal} className="w-full h-full" />
                                                    </button>
                                                ))}
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Form */}
                            <div className="bg-ui-800 border border-ui-border p-6 space-y-4 shadow-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Callsign (Display Name)</label>
                                        <input 
                                            type="text" 
                                            value={profile.displayName}
                                            onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                                            className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Agent ID (Username)</label>
                                        <input
                                            type="text"
                                            value={profile.username}
                                            disabled
                                            className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-gray-500 font-mono cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Mission Statement (Bio)</label>
                                    <textarea 
                                        rows={3}
                                        value={profile.bio}
                                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                        className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono resize-none transition-colors"
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-4">
                                    {saveStatus === 'success' && (
                                        <span className="text-green-500 text-xs font-bold uppercase flex items-center gap-1">
                                            <CheckCircle2 size={14} /> Saved
                                        </span>
                                    )}
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="bg-brand hover:bg-brand-hover text-black px-6 py-2 font-bold text-xs uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Processing...' : (
                                            <>
                                                <Save size={16} /> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="border-l-2 border-brand pl-4 mb-6">
                                <h3 className="text-xl font-bold text-ui-text-main uppercase">Security Protocols</h3>
                                <p className="text-xs text-ui-text-muted font-mono">Manage access credentials and account termination.</p>
                            </div>

                            <div className="bg-ui-800 border border-ui-border p-6 space-y-6 shadow-sm">
                                <h4 className="text-sm font-bold text-ui-text-main flex items-center gap-2">
                                    <Key size={16} className="text-brand" />
                                    Change Access Code
                                </h4>
                                
                                <div className="space-y-4 max-w-md">
                                    <input 
                                        type="password" 
                                        placeholder="Current Password"
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                                        className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    />
                                    <div className="h-px bg-ui-border"></div>
                                    <input 
                                        type="password" 
                                        placeholder="New Password"
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                                        className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Confirm New Password"
                                        value={passwordForm.confirm}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                        className="w-full bg-ui-900 border border-ui-border p-3 text-sm text-ui-text-main focus:border-brand focus:outline-none font-mono transition-colors"
                                    />
                                    
                                    {passMessage && (
                                        <p className={`text-xs font-mono p-2 border ${passMessage.startsWith('Error') ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-green-500/30 bg-green-500/10 text-green-500'}`}>
                                            {passMessage}
                                        </p>
                                    )}

                                    <button 
                                        onClick={handleUpdatePassword}
                                        className="bg-ui-700 hover:bg-ui-text-main hover:text-ui-900 text-ui-text-main px-4 py-2 font-bold text-xs uppercase transition-colors"
                                    >
                                        Update Credentials
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="border border-red-500/30 bg-red-500/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-500/20 text-red-500 rounded">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-red-500 uppercase">Self-Destruct Sequence</h4>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">Irreversible action. All data will be purged from the mainframe.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => alert("SELF-DESTRUCT SEQUENCE ABORTED. ADMIN ACCESS REQUIRED.")}
                                    className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500 text-red-500 px-4 py-2 font-bold text-xs uppercase transition-colors whitespace-nowrap"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* OTHER TABS (Placeholder) */}
                    {(activeTab === 'editor' || activeTab === 'notifications') && (
                         <div className="flex flex-col items-center justify-center h-64 border border-dashed border-ui-border bg-ui-800">
                            <Terminal size={32} className="text-gray-600 mb-4" />
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Module Offline</h3>
                            <p className="text-xs font-mono text-gray-600 mt-1">This configuration module is currently under maintenance.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
}