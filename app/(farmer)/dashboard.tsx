import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

interface Product {
  id: number;
  farmer_id: number;
  name: string;
  category_id: number;
  price: number;
  quantity: number;
  description: string;
  is_active: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  images?: string[];
}

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
    is_active: boolean;
    created_at: string;
    updated_at: string;
    low_stock_products: Product[];
  } | null>(null);

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/farmer/dashboard', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/farmer/logout', { 
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
    const interval = setInterval(() => {
      fetchUserData();
    }, 10000); // Fetch updates every 10 seconds
  
    return () => clearInterval(interval); // Clear interval on component unmount
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farmer Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
  
      <View style={styles.user}>
        <Text style={styles.title}>Welcome, {user.first_name} {user.last_name}!</Text>
        <Text style={styles.infoText}>Email: {user.email}</Text>
        <Text style={styles.infoText}>Farm Name: {user.farm_name}</Text>
        <Text style={styles.infoText}>Farm Size: {user.farm_size}</Text>
        <Text style={styles.infoText}>Location: {user.location}</Text>
        <Text style={styles.infoText}>Status: {user.status}</Text>
  
        {/* Low-stock Notifications */}
        {user.low_stock_products && user.low_stock_products.length > 0 && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>Low Stock Alerts</Text>
            {user.low_stock_products.map((product) => (
              <View key={product.id} style={styles.notificationItem}>
                <Text style={styles.notificationText}>
                  Product "{product.name}" has low stock: {product.quantity} left.
                </Text>
              </View>
            ))}
          </View>
        )}
  
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/(farmer)/products')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>View Products</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  user: {
    paddingHorizontal: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50, // For status bar padding
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#f44336', 
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
  notificationContainer: {
    marginTop: 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  
  notificationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  notificationItem: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  
  notificationText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  
});
