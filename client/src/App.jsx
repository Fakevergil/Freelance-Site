import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import ProtectedRoute from "./ProtectedRoute";
import Signup from "./pages/Signup";
import Projects from "./pages/Projects";
import Invoice from "./pages/Invoice";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import PublicRoute from "./PublicRoute";

function App() {
  return (
    <>
      <>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route path="/" element={<Home />} />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </>
  );
}

export default App;
