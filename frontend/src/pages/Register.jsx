import React from "react";
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

export default function Register({ onSwitchToLogin }) {
  return (
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
        <GoogleLogin>
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
