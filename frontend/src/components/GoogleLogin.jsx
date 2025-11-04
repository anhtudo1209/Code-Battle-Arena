import { useEffect, useRef, useState } from "react";

export default function GoogleLogin({ children, onLogin, clientId: clientIdProp }) {
  const clientId = clientIdProp || import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const tokenClientRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = () => {
      if (!window.google?.accounts?.oauth2 || !clientId) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async ({ access_token }) => {
          if (!access_token) return;
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const userInfo = await res.json();
          onLogin?.(userInfo);
        },
      });
      setReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      init();
      return;
    }

    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", init, { once: true });
    }
  }, [clientId]);

  const handleClick = () => {
    if (!ready || !tokenClientRef.current) return;
    tokenClientRef.current.requestAccessToken();
  };

  return (
    <div
      onClick={handleClick}
      style={{ display: "inline-block", opacity: ready ? 1 : 0.6, pointerEvents: ready ? "auto" : "none" }}
      title={ready ? undefined : "Loading Google…"}
    >
      {children}
    </div>
  );
}
