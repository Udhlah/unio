import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/signIn.js";
import SignUp from "./pages/signUp.js";
import Dashboard from "./pages/dashboard.js";
import Profile from "./pages/profile.js";
import NavBar from "./components/navBar.js"

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<SignIn/>}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
