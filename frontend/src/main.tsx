import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./app/App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "./config/env";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
