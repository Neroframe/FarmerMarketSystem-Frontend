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
  farm_location: string;
  images: string[]; // URLs of images
}

const BASE_URL = 'https://farmermarketsystem-production.up.railway.app'; 

const ProductsList: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/farmer/product/list-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products.');
      }

      const data = await response.json();
      setProducts(data.products || []); // Ensure products is always an array
    } catch (err: any) {
      console.error('Fetch Products Error:', err);
      setError(err.message || 'An unexpected error occurred.');
      Alert.alert('Error', err.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

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
      router.replace('/'); 
    } catch (error: any) {
      console.error('Logout Error:', error);
      Alert.alert('Error', error.message || 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddProduct = () => {
    router.push('/(farmer)/products/add');
  };

  const navigateToEditProduct = (id: number) => {
    router.push(`/(farmer)/products/edit/${id}`);
  };

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
        <Text style={styles.headerTitle}>Products</Text>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#b83027',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
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
