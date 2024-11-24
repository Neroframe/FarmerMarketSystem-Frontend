// app/farmer/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    farm_name: string;
    farm_size: string;
    location: string;
    status: string;
  } | null>(null);

  /**
   * Fetches authenticated farmer's data from the backend.
   */
  const fetchUserData = async () => {
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/farmer/dashboard', { // Replace with your backend URL
        method: 'GET',
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Session invalid or expired.');
      }

      const data = await response.json();
      setUser(data);
    } catch (error: any) {
      console.error('Dashboard Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch user data.');
      router.replace('/(farmer)/login'); // Redirect to Login on failure
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the logout process.
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/farmer/logout', { // Replace with your backend URL
        method: 'POST',
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed.');
      }

      Alert.alert('Success', 'Logged out successfully!');
      router.replace('/'); // Redirect to Login after logout
    } catch (error: any) {
      console.error('Logout Error:', error);
      Alert.alert('Error', error.message || 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(farmer)/login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, [{user.id}] {user.first_name} {user.last_name}!</Text>
      <Text style={styles.infoText}>Email: {user.email}</Text>
      <Text style={styles.infoText}>Farm Name: {user.farm_name}</Text>
      <Text style={styles.infoText}>Farm Size: {user.farm_size}</Text>
      <Text style={styles.infoText}>Location: {user.location}</Text>
      <Text style={styles.infoText}>Status: {user.status}</Text>


      {/* Add more farmer-specific functionalities here */}
      {/* Example: Manage Products, Track Sales, etc. */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(farmer)/products')}
        disabled={loading}
        >
        <Text style={styles.buttonText}>View Products</Text>
        </TouchableOpacity>
      {/* Logout Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Logout</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  errorText: {
    fontSize: 20,
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f44336', // Red color for logout
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
