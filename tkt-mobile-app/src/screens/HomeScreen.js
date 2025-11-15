import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { searchVehicles, clearSearchResults } from '../slices/vehicleSlice';
import { markArrival } from '../slices/attendanceSlice';
import { reportsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(null);
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.vehicle);

  useFocusEffect(
    useCallback(() => {
      fetchTodayStats();
    }, [])
  );

  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        dispatch(searchVehicles(searchQuery));
      } else {
        dispatch(clearSearchResults());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const fetchTodayStats = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getDailyReport();
      setTodayStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayStats();
    setRefreshing(false);
  };

  const handleMarkAttendance = (vehicleNumber) => {
    Alert.alert(
      'Mark Attendance',
      `Are you sure you want to mark arrival for ${vehicleNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Arrival',
          onPress: async () => {
            setMarkingAttendance(vehicleNumber);
            try {
              await dispatch(markArrival(vehicleNumber)).unwrap();
              Alert.alert('Success', 'Attendance marked successfully!');
              // Refresh stats to update the counts
              await fetchTodayStats();
            } catch (error) {
              Alert.alert('Error', error?.message || 'Failed to mark attendance');
            } finally {
              setMarkingAttendance(null);
            }
          },
        },
      ]
    );
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
        <View style={[styles.badge, item.vehicleType === 'CAR' ? styles.carBadge : styles.bikeBadge]}>
          <Text style={styles.badgeText}>{item.vehicleType}</Text>
        </View>
      </View>
      <Text style={styles.ownerName}>{item.ownerName}</Text>
      <Text style={styles.ownerMobile}>{item.ownerMobile}</Text>

      {/* Car and Key Images */}
      {(item.carImageUrl || item.keyImageUrl) && (
        <View style={styles.imagesContainer}>
          {item.carImageUrl && (
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Car Image</Text>
              <Image
                source={{ uri: item.carImageUrl }}
                style={styles.vehicleImage}
                resizeMode="cover"
              />
            </View>
          )}
          {item.keyImageUrl && (
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Key Image</Text>
              <Image
                source={{ uri: item.keyImageUrl }}
                style={styles.vehicleImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      )}

      {/* Mark Attendance Button */}
      <TouchableOpacity
        style={[
          styles.markAttendanceButton,
          markingAttendance === item.vehicleNumber && styles.markAttendanceButtonDisabled,
        ]}
        onPress={() => handleMarkAttendance(item.vehicleNumber)}
        disabled={markingAttendance === item.vehicleNumber}
        activeOpacity={0.8}
      >
        {markingAttendance === item.vehicleNumber ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.markAttendanceButtonText}>Mark Attendance</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>The King's Temple</Text>
        <Text style={styles.headerSubtitle}>Vehicle Management</Text>
      </View>

      {/* Stats Cards */}
      {loading && !todayStats ? (
        <ActivityIndicator size="large" color="#2B2B2B" style={styles.loader} />
      ) : todayStats ? (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.statNumber}>{todayStats.totalArrivals}</Text>
            <Text style={styles.statLabel}>Today's Arrivals</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('AllVehicles')}
            activeOpacity={0.7}
          >
            <Ionicons name="car" size={32} color="#2B2B2B" />
            <Text style={styles.statNumber}>{todayStats.totalRegisteredVehicles}</Text>
            <Text style={styles.statLabel}>Total Vehicles</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#F59E0B" />
            <Text style={styles.statNumber}>{todayStats.unmarkedCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      ) : null}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vehicle number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <FlatList
          data={searchResults}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No vehicles found</Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {searchQuery.length < 2 && (
        <View style={styles.placeholderContainer}>
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text style={styles.placeholderText}>
            Search for vehicles by number
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    alignItems: 'center',
  },
  headerLogo: {
    width: 130,
    height: 95,
    marginBottom: 0,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2B2B2B',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  carBadge: {
    backgroundColor: '#DBEAFE',
  },
  bikeBadge: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  ownerName: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  ownerMobile: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  loader: {
    marginTop: 40,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  imageWrapper: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  vehicleImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  markAttendanceButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markAttendanceButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  markAttendanceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;
