import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ApplicationsList from "./pages/ApplicationsList";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NewApplication from "./pages/NewApplication";
import Register from "./pages/Register";
import Results from "./pages/Results";
import "./styles.css";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader">Loading secure workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/applications/new" element={<Protected><NewApplication /></Protected>} />
          <Route path="/applications" element={<Protected><ApplicationsList /></Protected>} />
          <Route path="/applications/:id" element={<Protected><Results /></Protected>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
