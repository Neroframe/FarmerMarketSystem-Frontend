import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  Image, 
  TextInput, 
  ScrollView, 
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

type Product = {
  id: number;
  farmer_id: number;
  name: string;
  category_id: number;
  price: number;
  quantity: number;
  description: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  images: string[];
};

const AVAILABLE_CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Seeds'];
const CATEGORY_MAP: { [key: number]: string } = {
  1: 'Vegetables',
  2: 'Fruits',
  3: 'Seeds',
};
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Date: Newest First', value: 'date_desc' },
  { label: 'Date: Oldest First', value: 'date_asc' },
];

const BuyerHome: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('price_asc');
  const [isSortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://farmermarketsystem-production.up.railway.app/buyer/home');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        // Map the data to adjust date fields if necessary
        const productsWithDates = data.map((product: any) => ({
          ...product,
          created_at: new Date(product.created_at).toISOString(),
          updated_at: new Date(product.updated_at).toISOString(),
        }));

        setProducts(productsWithDates);
        setFilteredProducts(productsWithDates);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Unable to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Effect to handle filtering, searching, and sorting
  useEffect(() => {
    let updatedProducts = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      updatedProducts = updatedProducts.filter((product) => {
        const categoryName = CATEGORY_MAP[product.category_id];
        return categoryName && categoryName.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Search by name and category
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      updatedProducts = updatedProducts.filter((product) => {
        const categoryName = CATEGORY_MAP[product.category_id]?.toLowerCase() || '';
        return (
          product.name.toLowerCase().includes(query) ||
          categoryName.includes(query)
        );
      });
    }

    // Sort products
    switch (selectedSort) {
      case 'price_asc':
        updatedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        updatedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'date_desc':
        updatedProducts.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'date_asc':
        updatedProducts.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredProducts(updatedProducts);
  }, [products, selectedCategory, searchQuery, selectedSort]);

  const renderProduct = ({ item }: { item: Product }) => {
    // Function to get the first valid image URL
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
    const categoryName = CATEGORY_MAP[item.category_id] || 'Unknown';

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
          <Text style={styles.productCategory}>Category: {categoryName}</Text>
          {/* TODO */}
          {/* <Text style={styles.productLocation}>Location: {item.farmLocation}</Text> */}
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

      {/* Categories Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {AVAILABLE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              accessibilityLabel={`Filter by ${category}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or category"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          accessibilityLabel="Search products"
        />
      </View>

      {/* Sorting Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          accessibilityLabel="Sort products"
          accessibilityRole="button"
        >
          <Ionicons name="swap-vertical-outline" size={20} color="#4CAF50" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Sorting Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedSort === option.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedSort(option.value);
                  setSortModalVisible(false);
                }}
                accessibilityLabel={`Sort by ${option.label}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedSort === option.value && styles.modalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setSortModalVisible(false)}
              accessibilityLabel="Close sorting options"
              accessibilityRole="button"
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Title */}
      <Text style={styles.title}>Available Products</Text>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButtonText: {
    marginLeft: 5,
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionActive: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOptionTextActive: {
    color: '#fff',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    marginTop: 10,
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
  productCategory: {
    fontSize: 14,
    color: '#555',
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