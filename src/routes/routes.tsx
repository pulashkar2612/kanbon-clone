import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home.tsx';
import Login from '../pages/Login.tsx';
import { useAuth } from '../hooks/useAuth.ts';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth(); // Destructure user from useAuth

  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth(); // Destructure user here as well

  return (
    <Router>
      <Routes>
        {/* Home Page with ProtectedRoute */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Login Page */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
