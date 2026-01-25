import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Terminal,
  Bell,
  AlertTriangle,
  Monitor,
  Key,
  LogOut,
  Loader2,
  Save,
  BellRing,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { put, del, get } from "../services/httpClient";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import ThemeToggle from "../components/ThemeToggle";
import "./Home.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  // Profile State
  const [displayName, setDisplayName] = useState("");
  const [avatarAnimal, setAvatarAnimal] = useState("alligator");
  const [avatarColor, setAvatarColor] = useState("green");
  const [username, setUsername] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // Animal avatar options
  const ANIMALS = [
    "alligator",
    "anteater",
    "armadillo",
    "axolotl",
    "badger",
    "bat",
    "beaver",
    "buffalo",
    "camel",
    "capybara",
    "chameleon",
    "cheetah",
    "chinchilla",
    "chipmunk",
    "cormorant",
    "coyote",
    "crow",
    "dingo",
    "dinosaur",
    "dolphin",
    "dragon",
    "duck",
    "elephant",
    "ferret",
    "fox",
    "frog",
    "giraffe",
    "goose",
    "gopher",
    "grizzly",
    "hamster",
    "hedgehog",
    "hippo",
    "hyena",
    "ibex",
    "iguana",
    "jackal",
    "kangaroo",
    "koala",
    "kraken",
    "lemur",
    "leopard",
    "liger",
    "llama",
    "manatee",
    "mink",
    "monkey",
    "moose",
    "narwhal",
    "orangutan",
    "otter",
    "panda",
    "penguin",
    "platypus",
    "python",
    "quagga",
    "rabbit",
    "raccoon",
    "rhino",
    "sheep",
    "shrew",
    "skunk",
    "squirrel",
    "tiger",
    "turtle",
    "unicorn",
    "walrus",
    "wolf",
    "wolverine",
    "wombat",
  ];
  const COLORS = [
    { name: "red", hex: "#E53935" },
    { name: "orange", hex: "#FB8C00" },
    { name: "yellow", hex: "#FDD835" },
    { name: "green", hex: "#43A047" },
    { name: "purple", hex: "#8E24AA" },
    { name: "teal", hex: "#00897B" },
  ];

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await get("/auth/me");
        if (data.user) {
          setUsername(data.user.username);
          setDisplayName(data.user.display_name || data.user.username);
          setAvatarAnimal(data.user.avatar_animal || "alligator");
          setAvatarColor(data.user.avatar_color || "green");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Tabs configuration
  const tabs = [
    { id: "profile", label: "Public Profile", icon: User },
    { id: "account", label: "Account Security", icon: Shield },
    { id: "editor", label: "Arena Editor", icon: Terminal },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleUpdatePassword = async () => {
    setPasswordStatus(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: "error", message: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "New passwords do not match",
      });
      return;
    }

    try {
      await put("/auth/change-password", { currentPassword, newPassword });
      setPasswordStatus({
        type: "success",
        message: "Password updated successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to update password",
      });
    }
  };

  const handleSaveProfile = async () => {
    setProfileStatus(null);
    setProfileSaving(true);
    try {
      await put("/auth/profile", {
        display_name: displayName,
        avatar_animal: avatarAnimal,
        avatar_color: avatarColor,
      });
      setProfileStatus({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      setProfileStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to update profile",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await logout(refreshToken);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you SURE? This action is irreversible and will delete all your data, including stats, battles, and submissions."
      )
    ) {
      return;
    }

    // Double confirmation for safety
    const confirmInput = window.prompt('Type "DELETE" to confirm.');

    if (confirmInput !== "DELETE") {
      if (confirmInput !== null) {
        alert("Account deletion cancelled. You must type 'DELETE' exactly.");
      }
      return;
    }

    try {
      await del("/auth/delete-account");
      // Perform logout client-side cleanup
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      alert(
        "Failed to delete account: " +
        (error.response?.data?.message || "Unknown error")
      );
    }
  };

  return (
    <div className="home-page">
      <PageTitle title="Settings" />
      <Header />
      <ThemeToggle />

      {/* Main content: Chiếm phần còn lại, tự cuộn (overflow-y-auto) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-[44px] font-bold mb-4 tracking-tight">
              System <span className="text-emerald-400">Configuration</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Calibrate your interface and neural link parameters. Optimized
              settings ensure maximum efficiency in the arena.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* SIDEBAR NAVIGATION - Sticky relative to scrollable main */}
            <div
              className="lg:col-span-3 lg:sticky lg:top-0 space-y-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="bg-slate-900/55 backdrop-blur-md border border-slate-700/60 rounded-2xl p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === tab.id
                        ? "bg-emerald-600/10 text-emerald-400 ring-1 ring-emerald-500/50"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-900/10 hover:text-rose-300 rounded-xl transition-colors border border-transparent hover:border-rose-900/30"
                >
                  <LogOut className="w-4 h-4 " />
                  Disconnect Session
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div
              className="lg:col-span-9 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/55 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900/30 px-6 py-4 flex items-center gap-2 border-b border-slate-700/60">
                      <span className="text-emerald-400 font-mono text-lg">
                        &gt;_
                      </span>
                      <h2 className="font-semibold text-slate-100">
                        Identity Configuration
                      </h2>
                    </div>
                    <div className="p-6 space-y-8">
                      {/* Avatar Section */}
                      <div className="space-y-6">
                        {/* Current Avatar Preview */}
                        <div className="flex items-center gap-6">
                          <div
                            className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                            style={{
                              backgroundColor:
                                COLORS.find((c) => c.name === avatarColor)
                                  ?.hex || "#43A047",
                            }}
                          >
                            <img
                              src={`https://ssl.gstatic.com/docs/common/profile/${avatarAnimal}_lg.png`}
                              alt="Avatar"
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-200">
                              Your Avatar
                            </h3>
                            <p className="text-sm text-slate-400 capitalize">
                              {avatarAnimal} • {avatarColor}
                            </p>
                          </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 block mb-3">
                            Select Color
                          </label>
                          <div className="flex gap-3">
                            {COLORS.map((color) => (
                              <button
                                key={color.name}
                                onClick={() => setAvatarColor(color.name)}
                                className={`w-10 h-10 rounded-xl transition-all ${avatarColor === color.name
                                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                                  : "hover:scale-105"
                                  }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Animal Picker Grid */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 block mb-3">
                            Select Animal
                          </label>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-950/30 rounded-xl border border-slate-800">
                            {ANIMALS.map((animal) => (
                              <button
                                key={animal}
                                onClick={() => setAvatarAnimal(animal)}
                                className={`p-1 rounded-lg transition-all ${avatarAnimal === animal
                                  ? "ring-2 ring-emerald-500 bg-emerald-900/30"
                                  : "hover:bg-slate-800"
                                  }`}
                                title={animal}
                              >
                                <img
                                  src={`https://ssl.gstatic.com/docs/common/profile/${animal}_lg.png`}
                                  alt={animal}
                                  className="w-8 h-8 object-contain mx-auto"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-300">
                            Display Handle
                          </label>
                          <input
                            type="text"
                            value={profileLoading ? "Loading..." : displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={profileLoading}
                            maxLength={50}
                            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none disabled:opacity-50"
                          />
                          <p className="text-xs text-slate-500">
                            This is the name displayed on your profile and in
                            battles.
                          </p>
                        </div>

                      </div>

                      {profileStatus && (
                        <div
                          className={`text-sm ${profileStatus.type === "success"
                            ? "text-emerald-400"
                            : "text-rose-400"
                            }`}
                        >
                          {profileStatus.message}
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-700/50 flex justify-end">
                        <button
                          onClick={handleSaveProfile}
                          disabled={profileSaving || profileLoading}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {profileSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {profileSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT TAB (With Password Change) */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/55 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900/30 px-6 py-4 flex items-center gap-2 border-b border-slate-700/60">
                      <span className="text-emerald-400 font-mono text-lg">
                        &gt;_
                      </span>
                      <h2 className="font-semibold text-slate-100">
                        Security Protocols
                      </h2>
                    </div>
                    <div className="p-6 space-y-8">
                      {/* Password Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Key className="w-4 h-4 text-emerald-400" />
                          Access Credentials
                        </h3>
                        <div className="grid gap-4">
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="password"
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                            />
                            <input
                              type="password"
                              placeholder="Confirm New Password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                            />
                          </div>

                          {passwordStatus && (
                            <div
                              className={`text-sm ${passwordStatus.type === "success"
                                ? "text-emerald-400"
                                : "text-rose-400"
                                }`}
                            >
                              {passwordStatus.message}
                            </div>
                          )}

                          <button
                            onClick={handleUpdatePassword}
                            className="w-fit bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-px bg-slate-700/50"></div>

                      {/* Danger Zone */}
                      <div className="bg-rose-950/5 border border-rose-900/30 rounded-2xl p-6 flex items-start gap-4">
                        <div className="p-2 bg-rose-900/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-rose-400">
                            Danger Zone
                          </h3>
                          <p className="text-sm text-rose-300/60 mt-1 mb-4">
                            Once you delete your account, there is no going
                            back.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="text-sm bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900/50 px-4 py-2 rounded-lg transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR TAB (Static UI) */}
              {activeTab === "editor" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/55 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900/30 px-6 py-4 flex items-center gap-2 border-b border-slate-700/60">
                      <span className="text-emerald-400 font-mono text-lg">
                        &gt;_
                      </span>
                      <h2 className="font-semibold text-slate-100">
                        IDE Environment
                      </h2>
                    </div>
                    <div className="p-6 space-y-8 text-center text-slate-500">
                      <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Editor settings are not yet implemented.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB (Static UI) */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/55 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900/30 px-6 py-4 flex items-center gap-2 border-b border-slate-700/60">
                      <span className="text-emerald-400 font-mono text-lg">
                        &gt;_
                      </span>
                      <h2 className="font-semibold text-slate-100">
                        Signal Configuration
                      </h2>
                    </div>
                    <div className="p-6 space-y-8 text-center text-slate-500">
                      <BellRing className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Notification settings are not yet implemented.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
