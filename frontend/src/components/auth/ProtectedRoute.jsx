// Componente de ruta protegida — Protected route component
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege rutas según autenticación y roles — Protects routes by authentication and roles
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  // Muestra spinner mientras carga la sesión — Shows spinner while loading session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#00B4D8] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirige al login si no está autenticado — Redirects to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Muestra 403 si el rol no está permitido — Shows 403 if role is not allowed
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <h1 className="text-6xl font-bold text-[#0E4A8A]">403</h1>
        <p className="text-gray-500 text-lg">
          Sin autorización — Unauthorized
        </p>
        <p className="text-sm text-gray-400">
          No tienes permiso para acceder a esta página — You don't have permission to access this page
        </p>
      </div>
    );
  }

  return children;
}
