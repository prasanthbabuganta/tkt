import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../slices/authSlice';

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Try to restore session
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    // Navigate based on auth status once loading is complete
    if (!loading) {
      setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      }, 1500); // Show splash for at least 1.5 seconds
    }
  }, [loading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        onError={(error) => console.log('Image load error:', error)}
        onLoad={() => console.log('Image loaded successfully')}
      />

      <Text style={styles.title}>The King's Temple</Text>
      <Text style={styles.subtitle}>Vehicle Management</Text>

      <View style={styles.verse}>
        <Text style={styles.verseText}>
          "For where two or three gather{'\n'}in my name, there am I{'\n'}with them."
        </Text>
        <Text style={styles.reference}>- Matthew 18:20</Text>
      </View>

      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 60,
    textAlign: 'center',
  },
  verse: {
    marginBottom: 60,
    paddingHorizontal: 30,
  },
  verseText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  reference: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
