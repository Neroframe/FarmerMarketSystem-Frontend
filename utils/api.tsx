import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const BASE_URL = 'https://farmermarketsystem-production.up.railway.app'; // Update this based on your environment

/**
 * Custom hook to handle API calls.
 *
 * @returns { apiCall } - Function to make API requests.
 */
export const useApi = () => {
  const { isAuthenticated } = useContext(AuthContext);

  /**
   * Makes an API call to the specified endpoint with the given method and payload.
   *
   * @param endpoint - The API endpoint (e.g., '/farmer/login')
   * @param method - The HTTP method ('GET', 'POST', 'PUT', 'DELETE')
   * @param body - The request payload as an object or FormData
   * @param headers - Additional headers as key-value pairs
   * @returns The response data parsed as JSON or text
   * @throws An error if the response is not OK
   */
  const apiCall = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: Record<string, any> | FormData,
    headers?: Record<string, string>
  ) => {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {},
        credentials: 'include', // Ensure cookies are included in requests
      };

      if (body instanceof FormData) {
        options.body = body;
        options.headers = { ...headers }; // Let the browser set 'Content-Type' for FormData
      } else if (body) {
        options.body = JSON.stringify(body);
        options.headers = { 'Content-Type': 'application/json', ...headers };
      } else {
        options.headers = { ...headers };
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMessage = 'Something went wrong';
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Error on ${method} ${endpoint}:`, error);
      throw error;
    }
  };

  return { apiCall };
};
