
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { BASE_API_URL } from '../constants'; // Import BASE_API_URL

// Log the BASE_API_URL when AuthContext module is loaded
console.log('AuthContext loaded, BASE_API_URL:', BASE_API_URL);

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadingAuth: boolean;
  error: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearAuthError = () => setError(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoadingAuth(true);
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          // Optional: Could add a quick /api/auth/validate-token or /api/users/me endpoint call here
          // to ensure the stored session is still valid on the backend.
          // For now, trust localStorage for simplicity.
          setUser(parsedUser);
        }
      } catch (e) {
        console.error("Failed to initialize auth state from localStorage:", e);
        localStorage.removeItem('authUser'); // Clear corrupted item
      } finally {
        setLoadingAuth(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoadingAuth(true);
    setError(null);
    console.log(`AuthContext: Attempting login to ${BASE_API_URL}/login`); // Debug log before fetch
    try {
      const response = await fetch(`${BASE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed due to network or server error.' }));
        throw new Error(errorData.error || errorData.message || `Login failed: ${response.status}`);
      }
      
      const loggedInUser: User = await response.json();
      setUser(loggedInUser);
      localStorage.setItem('authUser', JSON.stringify(loggedInUser));

    } catch (err: any) {
      setError(err.message || 'Login failed due to an unexpected error.');
      throw err; // Re-throw for form handling in LoginPage
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    // Optionally: call a backend /api/logout endpoint if it exists (e.g., to invalidate server-side session/token)
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth, error, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
