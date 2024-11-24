import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import Button from '../components/Button';
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
        <Button label="Buyer" onPress={handleBuyerPress} />
        <Button label="Farmer" onPress={handleFarmerPress} />
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
});
