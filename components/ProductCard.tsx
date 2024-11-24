import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: string[];
};

type ProductCardProps = {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      {product.images.length > 0 && (
        <Image source={{ uri: product.images[0] }} style={styles.image} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.details}>Category: {product.category}</Text>
        <Text style={styles.details}>Price: ${product.price.toFixed(2)}</Text>
        <Text style={styles.details}>Quantity: {product.quantity}</Text>
        <Text style={styles.details}>Description: {product.description}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25292e',
    marginBottom: 5,
  },
  details: {
    fontSize: 16,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  editButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f44336',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
  },
});
