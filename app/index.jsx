import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "../config/firebaseconfig"; // Import your Firebase configuration
import { useNavigation } from '@react-navigation/native';

export default function Index() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailForReset, setEmailForReset] = useState(''); // For password reset
  const [resetEmailSent, setResetEmailSent] = useState(false); // To track if reset email is sent
  const [showResetForm, setShowResetForm] = useState(false); // State to show/hide reset form
  const [sessionStartTime, setSessionStartTime] = useState(null); // Session start time
  const [isSessionExpired, setIsSessionExpired] = useState(false); // To check if session expired

  // Set session timeout (30 minutes = 1800000 milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Handle login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      // Set session start time and expiration check
      setSessionStartTime(new Date().getTime());
      setIsSessionExpired(false); // Reset session expiration status
      navigation.replace('(tabs)'); // Navigate to your main screen after login
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      setResetEmailSent(true);  // Mark that the reset email has been sent
      alert('Password reset email sent! Please check your inbox.');
      setShowResetForm(false); // Hide the reset form after email is sent
    } catch (error) {
      alert(error.message);  // Show error message if failed
    }
  };

  // Check if session expired every minute
  useEffect(() => {
    if (sessionStartTime) {
      const checkSession = setInterval(() => {
        const currentTime = new Date().getTime();
        if (currentTime - sessionStartTime > SESSION_TIMEOUT) {
          setIsSessionExpired(true);
          signOut(auth);  // Sign out the user if session expired
          alert('Your session has expired. Please log in again.');
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkSession); // Cleanup interval on unmount
    }
  }, [sessionStartTime]);

  // Handle session expired
  useEffect(() => {
    if (isSessionExpired) {
      // Handle session expired state, like redirecting to the login screen
      navigation.replace('LoginScreen');
    }
  }, [isSessionExpired]);

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image
        source={require('../assets/images/icon.png')} // Replace with the path to your icon
        style={styles.appIcon}
      />
      
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      
      {/* Forgot Password Link */}
      <TouchableOpacity 
        onPress={() => setShowResetForm(true)} 
        style={styles.linkContainer}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Reset Password Form */}
      {showResetForm && !resetEmailSent && (
        <View style={styles.resetPasswordForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email for password reset"
            value={emailForReset}
            onChangeText={setEmailForReset}
          />
          <Button title="Send Reset Link" onPress={handleForgotPassword} />
        </View>
      )}

      {/* Message when reset email is sent */}
      {resetEmailSent && (
        <View style={styles.resetEmailContainer}>
          <Text style={styles.resetEmailText}>Password reset email has been sent!</Text>
        </View>
      )}

      <Text style={styles.link} onPress={() => navigation.navigate('SignupScreen')}>
        Don't have an account? Sign up
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
  appIcon: {
    width: 100,   // Adjust the width and height based on your icon's size
    height: 100,  // Make sure the icon fits well
    marginBottom: 20,  // Space between the icon and the title
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
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
  linkContainer: {
    marginTop: 10,
  },
  resetPasswordForm: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
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
});
