import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../services/api';

const UserManagementScreen = ({ hideHeader = false }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('STAFF');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Invalid Input', 'Mobile number must be exactly 10 digits');
      return false;
    }

    if (!pin || pin.length !== 6) {
      Alert.alert('Invalid Input', 'PIN must be exactly 6 digits');
      return false;
    }

    if (!/^\d+$/.test(mobileNumber)) {
      Alert.alert('Invalid Input', 'Mobile number must contain only digits');
      return false;
    }

    if (!/^\d+$/.test(pin)) {
      Alert.alert('Invalid Input', 'PIN must contain only digits');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Creating user:', { mobileNumber, role });
      const response = await userAPI.create({
        mobileNumber,
        pin,
        role,
      });

      console.log('Create user response:', response);

      if (response && response.success) {
        Alert.alert('Success', `${role} user created successfully`, [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setMobileNumber('');
              setPin('');
              setRole('STAFF');
            },
          },
        ]);
      } else {
        // Handle case where API returns 200 but success is false
        const errorMessage = response?.message || 'Failed to create user. Please try again.';
        console.error('Create user failed:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create user. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {!hideHeader && <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!hideHeader && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>Create new staff or admin users</Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Mobile Number */}
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

          {/* PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              editable={!loading}
            />
            <Text style={styles.hint}>6-digit PIN for user login</Text>
          </View>

          {/* Role Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Role</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  role === 'STAFF' && styles.typeButtonActive,
                ]}
                onPress={() => setRole('STAFF')}
                disabled={loading}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={role === 'STAFF' ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    role === 'STAFF' && styles.typeButtonTextActive,
                  ]}
                >
                  Staff
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  role === 'ADMIN' && styles.typeButtonActive,
                ]}
                onPress={() => setRole('ADMIN')}
                disabled={loading}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={role === 'ADMIN' ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    role === 'ADMIN' && styles.typeButtonTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              {role === 'STAFF'
                ? 'Staff can manage vehicles and attendance'
                : 'Admin can create users and manage everything'}
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.createButtonText}>Create User</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#2B2B2B',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  form: {
    padding: 20,
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
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 6,
  },
  typeButtonActive: {
    backgroundColor: '#2B2B2B',
    borderColor: '#2B2B2B',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserManagementScreen;
