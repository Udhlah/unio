import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Authentication context
import { BrowserRouter } from "react-router-dom"; // Router for navigation
import LoadingPage from "./pages/loadingPage"; // Loading screen

function AppWrapper() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingPage />; // Show loading screen while checking auth
  }

  return <App />; // Render the app once auth is checked
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper /> {/* Uses AppWrapper for auth loading */}
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
