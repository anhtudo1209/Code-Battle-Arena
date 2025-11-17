import React, { useEffect, useRef } from "react";

export default function GitHubLogin({ children, onLogin }) {
  const popupRef = useRef(null);

  const loginWithGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/auth/github/callback"; // backend callback
    const scope = "user:email";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    // Kích thước popup
    const width = 600;
    const height = 700;

    // Tính vị trí chính giữa màn hình
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      githubAuthUrl,
      "GitHub Login",
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
    );

    if (!popupRef.current) console.warn("Popup bị chặn!");
  };

  useEffect(() => {
    const handleMessage = (event) => {
      // Chỉ nhận từ frontend
      if (event.origin !== window.location.origin) return;

      const { user, token } = event.data || {};
      if (user && token) {
        onLogin?.({ user, token });
        if (popupRef.current) popupRef.current.close();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLogin]);

  return (
    <div onClick={loginWithGithub} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );
}
