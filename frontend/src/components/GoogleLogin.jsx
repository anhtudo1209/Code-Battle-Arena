import { useEffect } from "react";

export default function GoogleLogin({ children, onLogin }) {
  const clientId =
    "330125511175-iavuhoc2rhac1aft1s18dtfvop0863nk.apps.googleusercontent.com"; // client id của credential
  let tokenClient;

  useEffect(() => {
    if (!window.google) return;

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email", // scope
      callback: (tokenResponse) => {
        if (tokenResponse.access_token) {
          fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          })
            .then((res) => res.json())
            .then((userInfo) => {
              console.log("Google User:", userInfo);
              onLogin?.(userInfo);
            });
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
