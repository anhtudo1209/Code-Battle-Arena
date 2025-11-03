import React, { useState,useEffect } from "react";
import { FaFacebook, FaGoogle, FaGithub, FaUser, FaLock } from "react-icons/fa";
import "./Login.css";
import GoogleLogin from "../components/GoogleLogin";
import { login as loginService, oauthLogin } from "../services/authService";

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

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
          window.FB.api("/me", { fields: "id,name,email,picture" }, () => {
            window.location.href = "/src/pages/home.html";
            setFbLoading(false);
          });
        } else {
          setError("Bạn đã huỷ hoặc chưa cấp quyền đăng nhập Facebook.");
          setFbLoading(false);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  useEffect(() => {
    // Don't reload SDK if it's already loaded
    if (document.getElementById("facebook-jssdk")) return;

    // Define fbAsyncInit before loading SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v24.0",
      });

      // Check login status only on HTTPS or localhost
      const isSecureContext = 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isSecureContext) {
        try {
          window.FB.getLoginStatus(() => setFbReady(true));
        } catch {
          setFbReady(true);
        }
      } else {
        setFbReady(true); // Skip status check on HTTP
      }
    };

    // Load Facebook SDK
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }, []);

  const handleRememberChange = () => {
    setRememberMe(!rememberMe);
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // abc xyz 

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
        <button
  className="social-btn facebook"
  onClick={handleFacebookLogin}
  disabled={fbLoading}
  title="Login with Facebook"
>
  <FaFacebook />
</button>

        <GoogleLogin
          clientId={googleClientId} // abc xyz
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
