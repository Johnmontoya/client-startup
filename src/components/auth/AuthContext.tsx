import { createContext, useEffect, useState, type ReactNode } from 'react'
import axios from 'axios';

// Interfaz para la respuesta del API
interface PurchasedCoursesResponse {
  length?: number;
  // Agrega más campos si tu API retorna más información
}

// Interfaz para el valor del contexto
interface AuthContextType {
  isAuthenticated: boolean;
  hasPurchasedCourses: boolean;
  login: () => void;
  logout: () => void;
}

// Contexto con valor por defecto
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  hasPurchasedCourses: false,
  login: () => {},
  logout: () => {},
});

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPurchasedCourses, setHasPurchasedCourses] = useState<boolean>(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      checkPurchasedCourses(token);
    }
  }, []);

  // Verificar si el usuario tiene cursos comprados
  const checkPurchasedCourses = async (token: string): Promise<void> => {
    try {
      const response = await axios.get<PurchasedCoursesResponse | any[]>(
        'http://localhost:3000/purchased/purchased-courses',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Maneja tanto arrays como objetos con length
      if (Array.isArray(response.data)) {
        setHasPurchasedCourses(response.data.length > 0);
      } else if (response.data && typeof response.data.length === 'number') {
        setHasPurchasedCourses(response.data.length > 0);
      } else {
        setHasPurchasedCourses(false);
      }
    } catch (error) {
      console.error('Error checking purchased courses:', error);
      setHasPurchasedCourses(false);
    }
  };

  // Función de login
  const login = (): void => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('token');
    if (token) {
      checkPurchasedCourses(token);
    }
  };

  // Función de logout
  const logout = (): void => {
    setIsAuthenticated(false);
    setHasPurchasedCourses(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasPurchasedCourses,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};