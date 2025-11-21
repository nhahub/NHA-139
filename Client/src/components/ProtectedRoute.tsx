import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireOwner?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireOwner = false 
}: ProtectedRouteProps) {
  const { user, isAdmin, isOwner, isLoading } = useAuth();
  const { t } = useTranslation(); // 2. Initialize translation hook

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          {/* Use primary color for spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ef4343] border-t-transparent"></div>
          
          {/* Display translated loading message */}
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.authenticating')}
          </p>
        </div>
      </div>
    );
  }

  // 1. Not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 2. Not authorized (Admin)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. Not authorized (Owner)
  if (requireOwner && !isOwner) {
    return <Navigate to="/" replace />;
  }

  // 4. Authorized
  return <>{children}</>;
}