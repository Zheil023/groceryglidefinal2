// ForgotPasswordScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebaseconfig"; // Import your Firebase configuration
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [emailForReset, setEmailForReset] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false); // To track if reset email is sent

  // Handle password reset
  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      setResetEmailSent(true);  // Mark that the reset email has been sent
      alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
      alert(error.message);  // Show error message if failed
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your email for password reset"
        value={emailForReset}
        onChangeText={setEmailForReset}
      />
      
      <Button title="Send Reset Link" onPress={handleForgotPassword} />

      {resetEmailSent && (
        <View style={styles.resetEmailContainer}>
          <Text style={styles.resetEmailText}>Password reset email has been sent!</Text>
        </View>
      )}

      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Back to Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  resetEmailContainer: {
    marginTop: 20,
    backgroundColor: '#d3ffd3',
    padding: 10,
    borderRadius: 5,
  },
  resetEmailText: {
    color: '#28a745',
    textAlign: 'center',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});
