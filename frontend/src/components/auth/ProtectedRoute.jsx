// Componente de ruta protegida
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege rutas según autenticación y roles.
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  // Muestra spinner mientras carga la sesión
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirige al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Muestra 403 si el rol no está permitido
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <h1 className="text-6xl font-bold text-navy">403</h1>
        <p className="text-gray-500 text-lg">
          Sin autorización
        </p>
        <p className="text-sm text-gray-400">
          No tienes permiso para acceder a esta página.
        </p>
      </div>
    );
  }

  return children;
}
