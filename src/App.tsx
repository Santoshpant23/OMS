// App.tsx - Main application component that sets up routing
// This component defines all the routes in the application and protects certain routes
// that require authentication (Dashboard and Analytics)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    // Router enables client-side routing
    // It allows navigation between pages without full page reloads
    <Router>
      <Routes>
        {/* Public Routes - Anyone can access these */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - Only authenticated users can access these */}
        {/* If user is not logged in, they'll be redirected to /login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route - Redirect any unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
