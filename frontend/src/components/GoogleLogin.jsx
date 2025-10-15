import { useEffect } from "react";

export default function GoogleLogin({ children, onLogin }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  let tokenClient;

  useEffect(() => {
    if (!window.google) return;

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      callback: async (tokenResponse) => {
        if (tokenResponse.access_token) {
          const userInfoRes = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            }
          );
          const userInfo = await userInfoRes.json();
          console.log("Google User:", userInfo);

          onLogin?.(userInfo);
        }
      },
    });
  }, []);

  const handleClick = () => {
    if (tokenClient) tokenClient.requestAccessToken();
  };

  return (
    <div onClick={handleClick} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
