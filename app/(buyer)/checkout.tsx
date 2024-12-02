// Checkout.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Checkout: React.FC = () => {
  const router = useRouter();

  const handleContinueShopping = () => {
    // Navigate back to the home page or product listing
    router.push('/(buyer)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#4CAF50" />
        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.message}>
          Thank you for your purchase. Your order has been placed successfully.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinueShopping}
          accessibilityLabel="Continue shopping"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
    