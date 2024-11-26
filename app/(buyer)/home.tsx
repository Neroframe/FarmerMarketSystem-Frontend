import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  images: string[];  
};

const BuyerHome: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://farmermarketsystem-production.up.railway.app/buyer/home');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Unable to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => {
    const getFirstImageUrl = (images: string[]): string | null => {
      if (!images || images.length === 0) return null;
      // Return the first non-empty, trimmed URL
      for (let image of images) {
        const trimmedImage = image.trim();
        if (trimmedImage) {
          return trimmedImage;
        }
      }
      return null;
    };

    const firstImageUrl = getFirstImageUrl(item.images);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          router.push({
            pathname: '/(buyer)/product/[id]',
            params: { id: item.id.toString() },
          })
        }
        accessibilityLabel={`View details for ${item.name}`}
        accessibilityRole="button"
      >
        {firstImageUrl ? (
          <Image
            source={{ uri: firstImageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              // Handle image load error by showing placeholder
              Alert.alert('Error', `Failed to load image for ${item.name}`);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleLogout = () => {
    // TODO
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyer Home</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          accessibilityLabel="Logout" 
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>Available Products</Text>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available at the moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default BuyerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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
  title: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#25292e',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: '#eaeaea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  productInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});
