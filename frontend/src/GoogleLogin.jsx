import { useEffect, useState } from "react";

export default function GoogleLogin({ onLogin }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!window.google) return;
    const handleCredentialResponse = (response) => {
      const data = JSON.parse(atob(response.credential.split(".")[1]));
      setUser(data);
      if (onLogin) onLogin(data); // gửi dữ liệu lên App
      console.log("User info:", data);
    };
   
    window.google?.accounts.id.initialize({
      client_id: "330125511175-iavuhoc2rhac1aft1s18dtfvop0863nk.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false
    });
   window.google?.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      {
        type: "icon",       
        theme: "filled_black", 
        size: "medium",
        shape: "pill"
      }
    );
  }, []);

   return <div id="g_id_signin"></div>;
}
