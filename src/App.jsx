import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle'; // <-- Imported ThemeToggle

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Punch from './pages/Punch';
import Employees from './pages/Employees';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeToggle /> {/* Added Here globally */}
        <div className="app-container">
          <Navbar />
          <div className="main-container">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/employees" element={
                <ProtectedRoute requiredRole="admin">
                  <Employees />
                </ProtectedRoute>
              } />

              <Route path="/punch" element={
                <ProtectedRoute>
                  <Punch />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/punch" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
