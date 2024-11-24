// app/farmer/products/index.tsx

import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  FlatList, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';

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
  farm_location: string;
  images: string[]; // URLs of images
}

const BASE_URL = 'https://farmermarketsystem-production.up.railway.app'; // Replace with your backend URL

const ProductsList: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');

  /**
   * Fetches the list of products from the backend.
   */
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/farmer/product/list-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products.');
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (err: any) {
      console.error('Fetch Products Error:', err);
      setError(err.message || 'An unexpected error occurred.');
      Alert.alert('Error', err.message || 'Failed to fetch products.');
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
      const response = await fetch(`${BASE_URL}/farmer/logout`, {
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

  /**
   * Navigates to the Add Product page.
   */
  const navigateToAddProduct = () => {
    router.push('/(farmer)/products/add');
  };

  /**
   * Navigates to the Edit Product page with the selected product's ID.
   */
  const navigateToEditProduct = (id: number) => {
    router.push(`/(farmer)/products/edit/${id}`);
  };

  /**
   * Renders each product item in the FlatList.
   */
  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity 
        style={styles.productContainer} 
        onPress={() => navigateToEditProduct(item.id)}
      >
        {/* Display Product Image */}
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>Price: ${item.price.toFixed(2)}</Text>
          <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          <Text style={styles.productStatus}>
            Status: {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Products</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Add Product Button */}
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddProduct} disabled={loading}>
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading Products...</Text>
        </View>
      )}

      {/* Error Message */}
      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Products List */}
      {!loading && products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        !loading && (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>No products available. Add some!</Text>
          </View>
        )
      )}
    </View>
  );
};

export default ProductsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 20,
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 5, // For iOS shadow
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  productDetails: {
    padding: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productStatus: {
    fontSize: 14,
    color: '#f44336',
  },
  noProductsContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 18,
    color: '#555',
  },
});
