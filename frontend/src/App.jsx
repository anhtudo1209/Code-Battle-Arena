import React, { useState } from "react";
import "./App.css";
import {
  FaFacebook,
  FaGoogle,
  FaGithub,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {/* 🔹 Video Background */}
      <video
        className="bg-video"
        src="/assets/img/rain-drops-city-moody-moewalls-com.mp4"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      {/* 🔹 Overlay giúp chữ rõ hơn */}
      <div className="bg-overlay"></div>

      <div className="glass-card">
        <h1 className="title">CODE BATTLE ARENA</h1>

        {isLogin ? (
          <>
            <h2 className="subtitle">Login</h2>
            <form className="form">
              <div className="input-container">
                <FaUser className="input-icon" />
                <input type="text" placeholder="Username or Email" />
              </div>
              <div className="input-container">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Password" />
              </div>
              <button type="submit" className="btn">
                Login
              </button>
            </form>

            <div className="social-login">
              <button className="social-btn facebook">
                <FaFacebook />
              </button>
              <button className="social-btn google">
                <FaGoogle />
              </button>
              <button className="social-btn github">
                <FaGithub />
              </button>
            </div>

            <p className="switch">
              Don’t have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Register</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="subtitle">Register</h2>
            <form className="form">
              <div className="input-container">
                <FaUser className="input-icon" />
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-container">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Email" />
              </div>
              <div className="input-container">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Password" />
              </div>
              <div className="input-container">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Confirm Password" />
              </div>
              <button type="submit" className="btn">
                Register
              </button>
            </form>

            <div className="social-login">
              <button className="social-btn facebook">
                <FaFacebook />
              </button>
              <button className="social-btn google">
                <FaGoogle />
              </button>
              <button className="social-btn github">
                <FaGithub />
              </button>
            </div>

            <p className="switch">
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
