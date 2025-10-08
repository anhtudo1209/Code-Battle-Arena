import React, { useState, useMemo } from "react";
import "./pages/Auth.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LiquidEther from "./components/LiquidEther";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // Memoize LiquidEther to prevent re-renders when rememberMe changes
  const liquidEtherBackground = useMemo(() => (
    <LiquidEther
      colors={["#7af2b2", "#34d399", "#06b6d4"]}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    />
  ), []);

  return (
    <div className="auth-page">
      {/* 🔹 Video Background */}
      <video
        className="bg-video"
        src="/assets/img/coding-deck-moewalls-com.mp4"
        autoPlay
        loop
        muted
        playsInline
        onError={(e) => {
          console.log("Video load error");
          e.target.style.display = "none";
        }}
      >
        <source src="/assets/img/2471303.gif" type="video/gif" />
      </video>

      {/* 🔹 Overlay giúp chữ rõ hơn */}
      <div className="bg-overlay"></div>

      {/* 🔹 LiquidEther Background */}
      <div className="liquid-ether-wrapper">
        {liquidEtherBackground}
      </div>

      <div className="glass-card">
        <h1 className="title">CODE BATTLE ARENA</h1>

        {isLogin ? (
          <Login
            onSwitchToRegister={() => setIsLogin(false)}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
          />
        ) : (
          <Register onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
