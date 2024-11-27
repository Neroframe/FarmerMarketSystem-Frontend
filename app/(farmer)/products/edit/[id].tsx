import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
  images: string[]; // URLs of images
}

const BASE_URL = 'https://farmermarketsystem-production.up.railway.app'; 

const EditProduct: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Retrieves the product ID from the route
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string>(''); // Comma-separated URLs
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const fetchProduct = async () => {
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
      const foundProduct = data.products.find((p: Product) => p.id === parseInt(id as string, 10));

      if (!foundProduct) {
        throw new Error('Product not found.');
      }

      setProduct(foundProduct);
      // Pre-fill the form fields
      setName(foundProduct.name);
      setCategoryId(foundProduct.category_id.toString());
      setPrice(foundProduct.price.toString());
      setQuantity(foundProduct.quantity.toString());
      setDescription(foundProduct.description || '');
      setImages(foundProduct.images.join(', '));
      setIsActive(foundProduct.is_active);
    } catch (err: any) {
      console.error('Fetch Product Error:', err);
      Alert.alert('Error', err.message || 'Failed to fetch product details.');
      router.replace('/(farmer)/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (submitLoading) return;

    if (
      name.trim() === '' ||
      categoryId.trim() === '' ||
      price.trim() === '' ||
      quantity.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const categoryIdNum = parseInt(categoryId, 10);
    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(categoryIdNum) || isNaN(priceNum) || isNaN(quantityNum)) {
      Alert.alert('Error', 'Please enter valid numerical values for Category ID, Price, and Quantity.');
      return;
    }

    // Process images
    const imagesArray = images.split(',').map(img => img.trim()).filter(img => img !== '');

    setSubmitLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/farmer/product/edit-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include',
        body: JSON.stringify({
          id: product?.id,
          name,
          category_id: categoryIdNum,
          price: priceNum,
          quantity: quantityNum,
          description,
          is_active: isActive,
          images: imagesArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product.');
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Product updated successfully!');
        router.replace('/(farmer)/products'); 
      } else {
        throw new Error(data.message || 'Failed to update product.');
      }
    } catch (error: any) {
      console.error('Update Product Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (submitLoading) return;

    setSubmitLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/farmer/product/delete-product`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include', 
        body: JSON.stringify({
          id: product?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product.');
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Product deleted successfully!');
        router.replace('/(farmer)/products'); 
      } else {
        throw new Error(data.message || 'Failed to delete product.');
      }
    } catch (error: any) {
      console.error('Delete Product Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      Alert.alert('Error', 'Invalid product ID.');
      router.replace('/(farmer)/products');
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(farmer)/products')}>
          <Text style={styles.buttonText}>Go to Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

      {/* Product Name */}
      <TextInput
        style={styles.input}
        placeholder="Product Name *"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      {/* Category ID */}
      <TextInput
        style={styles.input}
        placeholder="Category ID *"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={categoryId}
        onChangeText={setCategoryId}
      />

      {/* Price */}
      <TextInput
        style={styles.input}
        placeholder="Price (e.g., 19.99) *"
        placeholderTextColor="#666"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />

      {/* Quantity */}
      <TextInput
        style={styles.input}
        placeholder="Quantity *"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      {/* Description */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#666"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Images */}
      <TextInput
        style={styles.input}
        placeholder="Image URLs (comma-separated)"
        placeholderTextColor="#666"
        value={images}
        onChangeText={setImages}
      />

      {/* Active Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Active:</Text>
        <TouchableOpacity 
          style={[styles.statusButton, isActive ? styles.active : styles.inactive]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.statusButtonText}>{isActive ? 'Yes' : 'No'}</Text>
        </TouchableOpacity>
      </View>

      {/* Update Product Button */}
      <TouchableOpacity style={styles.button} onPress={handleUpdateProduct} disabled={submitLoading}>
        {submitLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Product</Text>}
      </TouchableOpacity>

      {/* Delete Product Button */}
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteProduct}
        disabled={submitLoading}
      >
        {submitLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Delete Product</Text>
        )}
      </TouchableOpacity>

      {/* Back to Products Link */}
      <TouchableOpacity style={styles.backContainer} onPress={() => router.replace('/(farmer)/products')}>
        <Text style={styles.backText}>Back to Products</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProduct;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // For Android to align text at the top
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  active: {
    backgroundColor: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#f44336',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336', // Red color for delete action
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backText: {
    color: '#2196F3',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
  errorText: {
    fontSize: 20,
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
});
