import React from "react";
import { FaFacebook, FaGoogle, FaGithub, FaUser, FaLock } from "react-icons/fa";
import "./Login.css";

export default function Login({ onSwitchToRegister, rememberMe, setRememberMe }) {
  const handleRememberChange = () => {
    setRememberMe(!rememberMe);
  };

  return (
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

        {/* 🔹 Remember Me + Forgot Password (đưa xuống dưới nút) */}
        <div className="remember-forgot below-login">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberChange}
            />
            <span>Remember Me</span>
          </label>
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
        </div>
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
        <span onClick={onSwitchToRegister}>Register</span>
      </p>
    </>
  );
}
