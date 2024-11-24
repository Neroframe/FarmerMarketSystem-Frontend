import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const BuyerLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Email and Password are required.');
      return;
    }
  
    console.log("Attempting to log in with", { email, password });
  
    try {
      const response = await fetch(`https://farmermarketsystem-production.up.railway.app/buyer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, retain the default error message
        }
        throw new Error(errorMessage);
      }
  
      const result = await response.json();
      console.log("Response body:", result);
  
      if (result.message === "Login successful") {
        Alert.alert("Success", result.message);
        router.push('/(buyer)/home');
      } else {
        Alert.alert("Error", result.message);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
        console.error("Login Error:", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
        console.error("Login Error:", error);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const navigateToRegister = () => {
    router.push('/(buyer)/register'); // Adjust the path if necessary
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer Login</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#666" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#666" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account? </Text>
        <Text style={styles.link} onPress={navigateToRegister}>
          Register here
        </Text>
      </View>
    </View>
  );
};

export default BuyerLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#25292e',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: '#000',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  linkText: {
    color: '#000',
    fontSize: 14,
  },
  link: {
    color: '#4CAF50',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});