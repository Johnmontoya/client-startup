import { useContext, useEffect, useRef, type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

interface PrivateRouteProps {
  element: ReactElement;
  requiresPurchase?: boolean; // Para rutas que requieren cursos comprados
  redirectTo?: string; // Ruta personalizada de redirección
  message?: string; // Mensaje personalizado
}

const PrivateRoute = ({ 
  element, 
  requiresPurchase = false,
  redirectTo = '/register',
  message = 'Please register to access this content.'
}: PrivateRouteProps) => {
  const { isAuthenticated, hasPurchasedCourses } = useContext(AuthContext);
  const alertShown = useRef(false);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated && !alertShown.current) {
      alert(message);
      alertShown.current = true;
    }
    
    // Verificar compra de cursos si es requerido
    if (isAuthenticated && requiresPurchase && !hasPurchasedCourses && !alertShown.current) {
      alert('Please purchase a course to access this content.');
      alertShown.current = true;
    }
  }, [isAuthenticated, hasPurchasedCourses, requiresPurchase, message]);

  // Si no está autenticado, redirigir
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si requiere compra y no tiene cursos, redirigir a cursos
  if (requiresPurchase && !hasPurchasedCourses) {
    return <Navigate to="/courses" replace />;
  }

  return element;
};

export default PrivateRoute;