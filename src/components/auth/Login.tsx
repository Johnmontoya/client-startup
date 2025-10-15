import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// Interfaz para la respuesta del API
interface LoginResponse {
  token: string;
  refreshToken: string;
  message?: string;
}

interface RefreshResponse {
  token: string;
  message?: string;
}

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data: LoginResponse = await response.json();
      
      if (response.ok) {
        // Guardar tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Actualizar contexto de autenticación
        login();
        
        // Limpiar formulario
        setUsername('');
        setPassword('');
        
        // Redirigir a blogs
        navigate('/blogs');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para refrescar el token
  const refreshToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (!storedRefreshToken) {
      console.error('No refresh token available');
      return null;
    }
  
    try {
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      
      const data: RefreshResponse = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        return data.token;
      } else {
        console.error('Failed to refresh token');
        // Limpiar tokens inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };
  
  // Función helper para hacer peticiones autenticadas
  async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response | null> => {
    let token = localStorage.getItem('token');
    
    // Si no hay token, intentar refrescar
    if (!token) {
      token = await refreshToken();
      if (!token) {
        console.error('Could not obtain valid token');
        navigate('/login');
        return null;
      }
    }
  
    // Agregar el token a los headers
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  
    const response = await fetch(url, { ...options, headers });
    
    // Si el token expiró (401), intentar refrescar y reintentar
    if (response.status === 401) {
      token = await refreshToken();
      
      if (token) {
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
        return fetch(url, { ...options, headers: retryHeaders });
      } else {
        // Si no se puede refrescar, redirigir a login
        navigate('/login');
        return null;
      }
    }
    
    return response;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleLogin} 
          className="bg-[#001313] shadow-lg shadow-green-300/20 p-8 rounded-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Log in to your FEWV Learns account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Username field */}
          <div className="mb-5">
            <label 
              className="block text-gray-200 mb-2 font-medium" 
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your username"
              className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label 
              className="block text-gray-200 mb-2 font-medium" 
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-300 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-[#001313] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-green-300 hover:text-green-400 font-medium transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exportar también las funciones helper para usar en otros componentes
export { Login as default };

// Hook personalizado para usar makeAuthenticatedRequest en otros componentes
export const useAuthenticatedRequest = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const refreshToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (!storedRefreshToken) {
      return null;
    }
  
    try {
      const response = await fetch('https://fewvlearns-kimy.onrender.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      
      const data: RefreshResponse = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        return data.token;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        logout();
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const makeAuthenticatedRequest = async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response | null> => {
    let token = localStorage.getItem('token');
    
    if (!token) {
      token = await refreshToken();
      if (!token) {
        navigate('/login');
        return null;
      }
    }
  
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      token = await refreshToken();
      
      if (token) {
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
        return fetch(url, { ...options, headers: retryHeaders });
      } else {
        logout();
        navigate('/login');
        return null;
      }
    }
    
    return response;
  };

  return { makeAuthenticatedRequest };
};