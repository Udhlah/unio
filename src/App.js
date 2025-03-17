import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Firebase authentication
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import Skills from "./pages/skills";
import LoadingPage from "./pages/loadingPage";
import NotFound from "./pages/notFound";
import CompanyProfile from './pages/companyProfile';
import ForYouPage from './pages/forYouPage'

function AuthGuard({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); // Redirect to SignIn if not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <LoadingPage />;

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/for-you-page" element={<AuthGuard><ForYouPage /></AuthGuard>} />
      <Route path="/skills" element={<AuthGuard><Skills /></AuthGuard>} />
      <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
      <Route path="/:domain" element={<AuthGuard><CompanyProfile /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
