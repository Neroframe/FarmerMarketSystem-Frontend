import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  images: string[];
  farm_location: string;
};

const ProductDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://farmermarketsystem-production.up.railway.app/buyer/product/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product details: ${response.status}`);
        }

        const data: Product = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <ScrollView horizontal>
        {product.images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </ScrollView>
      <Text style={styles.price}>Price: ${product.price.toFixed(2)}</Text>
      <Text style={styles.quantity}>Quantity: {product.quantity}</Text>
      <Text style={styles.farm}>Farm: {product.farm_location}</Text>
      <Text style={styles.description}>{product.description}</Text>
    </ScrollView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#25292e',
  },
  image: {
    width: 200,
    height: 200,
    marginRight: 10,
    borderRadius: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 10,
  },
  quantity: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
  farm: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginVertical: 10,
    textAlign: 'center',
  },
});
