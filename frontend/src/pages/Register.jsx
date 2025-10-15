import React, { useState } from "react";
import {
  FaFacebook,
  FaGoogle,
  FaGithub,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import "./Register.css";
import GoogleLogin from "../components/GoogleLogin";
import { register as registerService } from "../services/authService";

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await registerService({ username, email, password });
      window.localStorage.setItem("token", data.token);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="subtitle">Register</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="error" style={{ color: "#f87171", marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="social-login">
        <button className="social-btn facebook">
          <FaFacebook />
        </button>
        <GoogleLogin
          onLogin={() => {
            window.location.href = "/src/pages/home.html";
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
        Already have an account? <span onClick={onSwitchToLogin}>Login</span>
      </p>
    </>
  );
}
