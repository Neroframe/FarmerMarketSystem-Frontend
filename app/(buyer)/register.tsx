import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const BuyerRegister: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [contactless, setContactless] = useState<string>(''); // String representation of boolean
  const [preferredTime, setPreferredTime] = useState<string>(''); // Preferred time for delivery
  const router = useRouter();

  const handleRegister = async () => {
    if (
      email.trim() === '' ||
      password.trim() === '' ||
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      contactless.trim() === '' ||
      preferredTime.trim() === ''
    ) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const deliveryPrefs = {
      contactless: contactless.toLowerCase() === 'true',
      preferred_time: preferredTime,
    };

    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      delivery_preferences: deliveryPrefs,
    };

    console.log("Attempting to register with", payload);

    try {
      const response = await fetch(`https://farmermarketsystem-production.up.railway.app/buyer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Response body:", result);

      if (result.id && result.email) {
        Alert.alert("Success", "Registration successful!");
        router.push('/(buyer)/login');
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
        console.error("Register Error:", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
        console.error("Register Error:", error);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const navigateToLogin = () => {
    router.push('/(buyer)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer Register</Text>
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
      <TextInput 
        style={styles.input} 
        placeholder="First Name" 
        placeholderTextColor="#666" 
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Last Name" 
        placeholderTextColor="#666" 
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contactless Delivery (true/false)" 
        placeholderTextColor="#666" 
        value={contactless}
        onChangeText={setContactless}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Preferred Time (morning/afternoon/evening)" 
        placeholderTextColor="#666" 
        value={preferredTime}
        onChangeText={setPreferredTime}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account? </Text>
        <Text style={styles.link} onPress={navigateToLogin}>
          Login here
        </Text>
      </View>
    </View>
  );
};

export default BuyerRegister;

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
