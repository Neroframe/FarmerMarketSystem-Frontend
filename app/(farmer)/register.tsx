import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const Register: React.FC = () => {
  const [first_name, setFirstName] = useState<string>('');
  const [last_name, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [farm_name, setFarmName] = useState<string>('');
  const [farm_size, setFarmSize] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm_password, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (loading) return;

    if (
      first_name.trim() === '' ||
      last_name.trim() === '' ||
      email.trim() === '' ||
      farm_name.trim() === '' ||
      farm_size.trim() === '' ||
      location.trim() === '' ||
      password.trim() === '' ||
      confirm_password.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirm_password) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://farmermarketsystem-production.up.railway.app/farmer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          farm_name,
          farm_size,
          location,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Registration successful! Please login.');
        router.replace('/(farmer)/login');
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Register</Text>

      {/* First Name Input */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#666"
        autoCapitalize="words"
        value={first_name}
        onChangeText={setFirstName}
      />

      {/* Last Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#666"
        autoCapitalize="words"
        value={last_name}
        onChangeText={setLastName}
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
      />

      {/* Farm Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Farm Name"
        placeholderTextColor="#666"
        value={farm_name}
        onChangeText={setFarmName}
      />

      {/* Farm Size Input */}
      <TextInput
        style={styles.input}
        placeholder="Farm Size (e.g., 50 acres)"
        placeholderTextColor="#666"
        value={farm_size}
        onChangeText={setFarmSize}
      />

      {/* Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#666"
        value={location}
        onChangeText={setLocation}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        textContentType="password"
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#666"
        secureTextEntry
        textContentType="password"
        value={confirm_password}
        onChangeText={setConfirmPassword}
      />

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      {/* Back to Login Link */}
      <TouchableOpacity style={styles.loginContainer} onPress={() => router.replace('/(farmer)/login')}>
        <Text style={styles.loginText}>Already have an account? Login here.</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 50,
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
  loginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});
