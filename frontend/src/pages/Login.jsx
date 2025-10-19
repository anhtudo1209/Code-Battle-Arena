import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle, FaGithub, FaUser, FaLock } from "react-icons/fa";
import "./Login.css";
import GoogleLogin from "../components/GoogleLogin";
import { login as loginService, oauthLogin } from "../services/authService";

export default function Login({
  onSwitchToRegister,
  rememberMe,
  setRememberMe,
}) {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRememberChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await loginService({ username: usernameOrEmail, password });
      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      storage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="subtitle">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>


        {error && (
          <div className="error" style={{ color: "#f87171", marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
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
        <GoogleLogin
          onLogin={async (userInfo) => {
            try {
              const data = await oauthLogin({
                provider: "google",
                provider_user_id: userInfo.sub,
                email: userInfo.email,
                username: userInfo.name
              });
              const storage = rememberMe ? window.localStorage : window.sessionStorage;
              storage.setItem("token", data.token);
              navigate("/home");
            } catch (err) {
              setError("Google login failed");
            }
          }}
          >
          <button className="social-btn google">
            <FaGoogle />
          </button>
        </GoogleLogin>
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
