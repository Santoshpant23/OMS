// ProtectedRoute.tsx - Component that protects routes from unauthenticated access
// This component checks if the user is logged in before allowing access to protected pages
// If the user is not authenticated, they are redirected to the login page

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { AuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode; // The component to render if user is authenticated
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Zustand store
  // We use direct state selectors to ensure reactivity
  const token = useAuthStore((state: AuthStore) => state.token);     // JWT token from login
  const userId = useAuthStore((state: AuthStore) => state.userId);   // User ID from login

  // User is authenticated if they have both a token and a user ID
  const isAuthenticated = !!token && !!userId;

  // If user is not authenticated, redirect them to the login page
  // The 'replace' option replaces the current history entry instead of adding a new one
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the protected component
  return <>{children}</>;
};
