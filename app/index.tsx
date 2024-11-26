import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const Index: React.FC = () => {
  const router = useRouter();

  const handleBuyerPress = () => {
    router.push('/(buyer)/login'); 
  };

  const handleFarmerPress = () => {
    router.push('/(farmer)/login'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose the User</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleBuyerPress}>
          <Text style={styles.buttonText}>Buyer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleFarmerPress}>
          <Text style={styles.buttonText}>Farmer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1, 
    marginHorizontal: 5, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
