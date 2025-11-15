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
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerVehicle, clearSuccess, clearError } from '../slices/vehicleSlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const RegisterVehicleScreen = () => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [carImage, setCarImage] = useState(null);
  const [keyImage, setKeyImage] = useState(null);

  const dispatch = useDispatch();
  const { loading, error, successMessage} = useSelector((state) => state.vehicle);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            // Clear form
            setOwnerName('');
            setOwnerMobile('');
            setVehicleNumber('');
            setVehicleType('CAR');
            setCarImage(null);
            setKeyImage(null);
            dispatch(clearSuccess());
          },
        },
      ]);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const pickImageFromLibrary = async (imageType) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Validate file size (10MB limit)
        const fileSize = selectedImage.fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Image size must be less than 10MB');
          return;
        }

        if (imageType === 'car') {
          setCarImage(selectedImage);
        } else {
          setKeyImage(selectedImage);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async (imageType) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Validate file size (10MB limit)
        const fileSize = selectedImage.fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Image size must be less than 10MB');
          return;
        }

        if (imageType === 'car') {
          setCarImage(selectedImage);
        } else {
          setKeyImage(selectedImage);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const pickImage = (imageType) => {
    Alert.alert(
      'Select Image',
      'Choose an option to add an image',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(imageType),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImageFromLibrary(imageType),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const validateForm = () => {
    if (!ownerName || ownerName.trim().length < 2) {
      Alert.alert('Invalid Input', 'Owner name must be at least 2 characters');
      return false;
    }

    if (!ownerMobile || ownerMobile.length !== 10) {
      Alert.alert('Invalid Input', 'Mobile number must be exactly 10 digits');
      return false;
    }

    // Indian vehicle number format validation
    const vehiclePattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
    if (!vehicleNumber || !vehiclePattern.test(vehicleNumber)) {
      Alert.alert(
        'Invalid Input',
        'Vehicle number must follow Indian format (e.g., KA01AB1234)'
      );
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    dispatch(
      registerVehicle({
        ownerName: ownerName.trim(),
        ownerMobile,
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType,
        carImage,
        keyImage,
      })
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Register Vehicle</Text>
          <Text style={styles.headerSubtitle}>Add a new vehicle to the system</Text>
        </View>

        <View style={styles.form}>
          {/* Owner Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter owner's full name"
              value={ownerName}
              onChangeText={setOwnerName}
              editable={!loading}
            />
          </View>

          {/* Owner Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              value={ownerMobile}
              onChangeText={setOwnerMobile}
              keyboardType="number-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>

          {/* Vehicle Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., KA01AB1234"
              value={vehicleNumber}
              onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={12}
              editable={!loading}
            />
            <Text style={styles.hint}>Format: KA01AB1234</Text>
          </View>

          {/* Vehicle Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  vehicleType === 'CAR' && styles.typeButtonActive,
                ]}
                onPress={() => setVehicleType('CAR')}
                disabled={loading}
              >
                <Ionicons
                  name="car"
                  size={24}
                  color={vehicleType === 'CAR' ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    vehicleType === 'CAR' && styles.typeButtonTextActive,
                  ]}
                >
                  Car
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  vehicleType === 'BIKE' && styles.typeButtonActive,
                ]}
                onPress={() => setVehicleType('BIKE')}
                disabled={loading}
              >
                <Ionicons
                  name="bicycle"
                  size={24}
                  color={vehicleType === 'BIKE' ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    vehicleType === 'BIKE' && styles.typeButtonTextActive,
                  ]}
                >
                  Bike
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Car Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Car Image (Optional)</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={() => pickImage('car')}
              disabled={loading}
            >
              {carImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: carImage.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setCarImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera" size={32} color="#6B7280" />
                  <Text style={styles.placeholderText}>Tap to take photo or select from library</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Key Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Key Image (Optional)</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={() => pickImage('key')}
              disabled={loading}
            >
              {keyImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: keyImage.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setKeyImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="key" size={32} color="#6B7280" />
                  <Text style={styles.placeholderText}>Tap to take photo or select from library</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.registerButtonText}>Register Vehicle</Text>
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
    paddingBottom: 100,
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
  registerButton: {
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  imagePreviewContainer: {
    width: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default RegisterVehicleScreen;
