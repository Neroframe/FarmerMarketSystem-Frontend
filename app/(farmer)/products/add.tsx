import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';
const CLOUDINARY_CLOUD_NAME = 'dvnezwrbt'; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
const BASE_URL = 'https://farmermarketsystem-production.up.railway.app'; 

const AddProduct: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<{ uri: string, base64: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const pickImages = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true, // Enable base64 encoding
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64 || '', // Handle cases where base64 might be undefined
      }));
      setImages([...images, ...selectedImages]);
    }
  };

  const uploadImageToCloudinary = async (image: { uri: string, base64: string }): Promise<string> => {
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${image.base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('Uploading image with Base64:', image.uri);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        // **Do NOT set the 'Content-Type' header manually**
      });

      const data = await response.json();
      console.log('Cloudinary Response:', data);

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Failed to upload image.');
      }
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      throw error;
    }
  };

  const uploadImagesToCloudinary = async (): Promise<string[]> => {
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        images.map(image => uploadImageToCloudinary(image))
      );
      return uploadedUrls;
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Failed to upload images. Please try again.');
      return [];
    } finally {
      setUploading(false);
    }
  };


  const handleAddProduct = async () => {
    if (loading || uploading) return;

    if (
      name.trim() === '' ||
      categoryId.trim() === '' ||
      price.trim() === '' ||
      quantity.trim() === ''
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const categoryIdNum = parseInt(categoryId, 10);
    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(categoryIdNum) || isNaN(priceNum) || isNaN(quantityNum)) {
      Alert.alert('Validation Error', 'Please enter valid numerical values for Category ID, Price, and Quantity.');
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadImagesToCloudinary();
        if (uploadedImageUrls.length === 0) {
          throw new Error('Image upload failed.');
        }
      }

      const response = await fetch(`${BASE_URL}/farmer/product/add-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          name,
          category_id: categoryIdNum,
          price: priceNum,
          quantity: quantityNum,
          description,
          images: uploadedImageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product.');
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Product added successfully!');
        router.replace('/(farmer)/products');
      } else {
        throw new Error(data.message || 'Failed to add product.');
      }
    } catch (error: any) {
      console.error('Add Product Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setImages([]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

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

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        <Text style={styles.imagePickerText}>Pick Images</Text>
      </TouchableOpacity>

      {/* Display Selected Images */}
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </View>

      {/* Add Product Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAddProduct} 
        disabled={loading || uploading}
      >
        {loading || uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Product</Text>
        )}
      </TouchableOpacity>

      {/* Back to Products Link */}
      <TouchableOpacity 
        style={styles.backContainer} 
        onPress={() => router.replace('/(farmer)/products')}
      >
        <Text style={styles.backText}>Back to Products</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddProduct;

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
  imagePicker: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    color: '#4CAF50',
    fontSize: 16,
  },
});
