import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

type AllowedRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
  requireAuth?: boolean;
  customerOnly?: boolean; // If true, redirect ADMIN/SUPER_ADMIN to their dashboard
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  requireAuth = false,
  customerOnly = false 
}: RouteGuardProps) {
  const { user, profile, storeAdmin, loading, isSuperAdmin, isStoreAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this is a customer-only route and user is logged in with ADMIN/SUPER_ADMIN role
  if (customerOnly && user && profile) {
    if (isSuperAdmin()) {
      return <Navigate to="/superadmin" replace />;
    }
    if (isStoreAdmin()) {
      return <Navigate to="/admin" replace />;
    }
  }

  // If specific roles are required
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !profile) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for SUPER_ADMIN
    if (allowedRoles.includes('SUPER_ADMIN') && isSuperAdmin()) {
      return <>{children}</>;
    }

    // Check for ADMIN (store admin)
    if (allowedRoles.includes('ADMIN') && isStoreAdmin()) {
      return <>{children}</>;
    }

    // Check for CUSTOMER
    if (allowedRoles.includes('CUSTOMER') && profile.role === 'CUSTOMER') {
      return <>{children}</>;
    }

    // No matching role found - redirect based on actual role
    if (isSuperAdmin()) {
      return <Navigate to="/superadmin" replace />;
    }
    if (isStoreAdmin()) {
      return <Navigate to="/admin" replace />;
    }
    // Default for customers
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
