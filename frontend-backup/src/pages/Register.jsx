import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaGoogle,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import "./Register.css";
import GoogleLogin from "../components/GoogleLogin";
import { register as registerService, oauthLogin } from "../services/authService";

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fbLoading, setFbLoading] = useState(false);
  const [fbReady, setFbReady] = useState(false);

  const handleFacebookLogin = () => {
    setError("");
    if (!window.FB) {
      setError("Facebook SDK chưa sẵn sàng. Thử lại sau.");
      return;
    }
    if (fbLoading) return;

    setFbLoading(true);
    window.FB.login(
      (response) => {
        if (response?.authResponse) {
          const { accessToken } = response.authResponse;

          fetch(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
          )
            .then((meRes) => meRes.json())
            .then((me) => {
              return oauthLogin({
                provider: "facebook",
                provider_user_id: me.id,
                email: me.email,
                username: me.name,
              });
            })
            .then((data) => {
              window.localStorage.setItem("token", data.token);
              window.location.href = "/home";
            })
            .catch(() => {
              setError("Facebook login failed");
            })
            .finally(() => {
              setFbLoading(false);
            });
        } else {
          setError("Bạn đã huỷ đăng nhập Facebook.");
          setFbLoading(false);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v24.0",
      });

      setFbReady(true);
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }, []);

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
      window.location.href = "/home";
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
        
        <button
          className="social-btn facebook"
          onClick={handleFacebookLogin}
          disabled={fbLoading}
          title="Login with Facebook"
        >
          <FaFacebook />
        </button>

        <GoogleLogin
          clientId={googleClientId}
          onLogin={async (user) => {
            try {
              const data = await oauthLogin({
                provider: "google",
                provider_user_id: user.sub,
                email: user.email,
                username: user.name,
              });
              window.localStorage.setItem("token", data.token);
              window.location.href = "/home";
            } catch {
              setError("Google login failed");
            }
          }}
        >
          <button className="social-btn google">
            <FaGoogle />
          </button>
        </GoogleLogin>

      </div>

      <p className="switch">
        Already have an account?{" "}
        <span onClick={onSwitchToLogin}>Login</span>
      </p>
    </>
  );
}
