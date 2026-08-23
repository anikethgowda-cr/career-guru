import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import Profile from "./pages/Profile";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Hide sidebar during onboarding / profile creation
  const showSidebar = isAuthenticated && location.pathname !== "/create-profile";
  
  return (
    <div className="app-container">
      {showSidebar && <Sidebar />}
      
      <main className={showSidebar ? "main-content" : "full-content"} style={{ width: "100%" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-profile" element={<CreateProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
