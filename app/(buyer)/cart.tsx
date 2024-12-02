// Cart.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  // Add other product fields as needed
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface GetCartResponse {
  success: boolean;
  cart: CartItem[];
}

interface ActionResponse {
  success: boolean;
  message: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/cart', {
        method: 'GET',
        credentials: 'include',
      });

      const data: GetCartResponse = await response.json();

      if (response.ok && data.success) {
        setCartItems(data.cart);
      } else {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', error.message || 'Unable to fetch cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId: number) => {
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`https://farmermarketsystem-production.up.railway.app/cart/remove/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data: ActionResponse = await response.json();

      if (response.ok && data.success) {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        Alert.alert('Success', data.message);
      } else {
        throw new Error(data.message || `Failed to remove item: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error removing item:', error);
      Alert.alert('Error', error.message || 'Unable to remove item. Please try again later.');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/cart/update', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data: ActionResponse = await response.json();

      if (response.ok && data.success) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        );
        Alert.alert('Success', data.message);
      } else {
        throw new Error(data.message || `Failed to update quantity: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', error.message || 'Unable to update quantity. Please try again later.');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/checkout', {
        method: 'POST',
        credentials: 'include',
      });
  
      const data: ActionResponse = await response.json();
  
      if (response.ok && data.success) {
        setCartItems([]); // Clear the cart items from the state
        // Navigate to the Checkout success page
        router.push('/(buyer)/checkout');
      } else {
        throw new Error(data.message || `Checkout failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', error.message || 'Unable to complete checkout. Please try again later.');
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  
  const renderCartItem = ({ item }: { item: CartItem }) => {
    const firstImageUrl = item.product.images && item.product.images.length > 0 ? item.product.images[0] : null;
    const isActionLoading = actionLoading[item.product.id] || false;

    return (
      <View style={styles.cartItem}>
        {firstImageUrl ? (
          <Image
            source={{ uri: firstImageUrl }}
            style={styles.cartItemImage}
            resizeMode="cover"
            onError={() => {
              Alert.alert('Error', `Failed to load image for ${item.product.name}`);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{item.product.name}</Text>
          <Text style={styles.cartItemPrice}>${item.product.price.toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => {
                if (item.quantity > 1) {
                  handleUpdateQuantity(item.product.id, item.quantity - 1);
                }
              }}
              style={styles.quantityButton}
              accessibilityLabel={`Decrease quantity of ${item.product.name}`}
              accessibilityRole="button"
              disabled={isActionLoading}
            >
              <Ionicons 
                name="remove-circle-outline" 
                size={24} 
                color={item.quantity > 1 ? "#4CAF50" : "#ccc"} 
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
              style={styles.quantityButton}
              accessibilityLabel={`Increase quantity of ${item.product.name}`}
              accessibilityRole="button"
              disabled={isActionLoading}
            >
              <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item.product.id)}
            style={styles.removeButton}
            accessibilityLabel={`Remove ${item.product.name} from cart`}
            accessibilityRole="button"
            disabled={isActionLoading}
          >
            <Ionicons name="trash-outline" size={20} color="#ff5252" />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
        {isActionLoading && (
          <View >
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>

      {/* Cart Items */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(buyer)/home')}
            accessibilityLabel="Shop now"
            accessibilityRole="button"
          >
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ${getTotalPrice().toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              accessibilityLabel="Proceed to checkout"
              accessibilityRole="button"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              )}
            </TouchableOpacity>

          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    backgroundColor: '#eaeaea',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  cartItemInfo: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  removeButtonText: {
    marginLeft: 5,
    color: '#ff5252',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
