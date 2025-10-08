import React, { useState } from "react";
import "./pages/Auth.css";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

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
