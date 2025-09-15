import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const Spinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
);


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAllowed = allowedRoles.includes(user.role);

  if (isAllowed) {
    // Redirect from root to the correct dashboard
    if (location.pathname === '/' || location.pathname === '/dashboard') {
        if (user.role === Role.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // Students are already correctly routed to /dashboard by this point
    }
    return <Outlet />;
  }

  // If user is logged in but trying to access a page they don't have the role for
  if (user.role === Role.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default ProtectedRoute;