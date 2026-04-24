import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { currentUser, userRole } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
        // If admin, they could bypass, but here we strictly check.
        // Wait, let admin bypass or strict check. Admin usually has all access.
        if (userRole !== 'admin') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}
