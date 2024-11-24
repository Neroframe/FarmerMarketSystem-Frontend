// contexts/AuthContext.tsx

import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Alert } from 'react-native';
import { useApi } from '../utils/api';

// Define user roles
export type UserType = 'buyer' | 'farmer';

// Base User interface with common attributes
interface BaseUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

// Buyer-specific attributes (extend BaseUser if needed)
interface Buyer extends BaseUser {

}

// Farmer-specific attributes (extend BaseUser)
interface Farmer extends BaseUser {
  farmName: string;
  farmSize: string;
  location: string;
}

// Union type for authenticated users
type AuthenticatedUser = Buyer | Farmer;

// Define the shape of AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
}

// Initialize AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
});

// AuthProvider component to wrap around your app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const { apiCall } = useApi();

  /**
   * Handles user login by sending credentials to the backend.
   *
   * @param email - User's email
   * @param password - User's password
   * @param userType - Type of user ('buyer' or 'farmer')
   */
  const login = async (email: string, password: string, userType: UserType) => {
    try {
      // Determine the endpoint based on userType
      const endpoint = userType === 'farmer' ? '/farmer/login' : '/buyer/login';

      // Make the API call
      const data = await apiCall(endpoint, 'POST', { email, password });

      // Expecting the backend to return user data
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user as AuthenticatedUser);
        Alert.alert('Success', 'Login successful!');
      } else {
        throw new Error(data.message || 'Failed to log in.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log in.');
    }
  };

  /**
   * Handles user logout by communicating with the backend.
   */
  const logout = async () => {
    try {
      // Determine the logout endpoint based on userType
      const endpoint = user?.userType === 'farmer' ? '/farmer/logout' : '/buyer/logout';

      const response = await apiCall(endpoint, 'POST');

      if (response.success) {
        setIsAuthenticated(false);
        setUser(null);
        Alert.alert('Success', 'Logged out successfully.');
      } else {
        throw new Error(response.message || 'Failed to log out.');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred while logging out.');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
