import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <h2 className="subtitle">Password Reset Successful</h2>
          <p className="success-message">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2 className="subtitle">Reset Your Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-container">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm New Password"
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

          <button type="submit" className="btn" disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
