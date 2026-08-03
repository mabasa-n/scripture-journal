import { useState } from "react";
import "./App.css";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { env } from "./config/env";

function App() {
  const [authStatus, setAuthStatus] = useState<string>("Not logged in");

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setAuthStatus("Verifying with backend...");

    try {
      const response = await fetch(`${env.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // CRITICAL: This tells the browser to allow Fastify to set the HttpOnly cookie
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthStatus(`Success! Logged in as User ID: ${data.user?.id}`);
      } else {
        setAuthStatus(`Login Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setAuthStatus("Network error connecting to backend.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Scripture App (Local Dev)</h1>

      <div style={{ margin: "2rem 0" }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setAuthStatus("Google Login Widget Failed")}
          // useOneTap // Optional: shows the nice top-right dropdown for returning users
        />
      </div>

      <div
        style={{ padding: "1rem", background: "#f3f4f6", borderRadius: "8px" }}
      >
        <strong>Status:</strong> {authStatus}
      </div>
    </div>
  );
}

export default App;
