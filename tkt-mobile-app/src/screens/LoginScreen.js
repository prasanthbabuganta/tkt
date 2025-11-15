import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    // Validation
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Invalid Input', 'Mobile number must be exactly 10 digits');
      return;
    }

    if (!pin || pin.length !== 6) {
      Alert.alert('Invalid Input', 'PIN must be exactly 6 digits');
      return;
    }

    dispatch(login({ mobileNumber, pin }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="number-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={true}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2B2B2B',
  },
  loginButton: {
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
