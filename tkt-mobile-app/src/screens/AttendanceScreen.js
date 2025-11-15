import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUnmarkedVehicles,
  markArrival,
  clearSuccess,
  clearError,
} from '../slices/attendanceSlice';
import { Ionicons } from '@expo/vector-icons';

const AttendanceScreen = () => {
  const dispatch = useDispatch();
  const { unmarkedVehicles, loading, error, successMessage } = useSelector(
    (state) => state.attendance
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchUnmarkedVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success', successMessage);
      dispatch(clearSuccess());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    console.log('Unmarked vehicles updated:', unmarkedVehicles.length, unmarkedVehicles);
  }, [unmarkedVehicles]);

  const handleMarkArrival = (vehicleNumber) => {
    Alert.alert(
      'Confirm Arrival',
      `Mark arrival for vehicle ${vehicleNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => dispatch(markArrival(vehicleNumber)),
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUnmarkedVehicles());
    setRefreshing(false);
  };

  // Filter vehicles based on search query
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) {
      console.log('No search query, showing all unmarked vehicles:', unmarkedVehicles.length);
      return unmarkedVehicles;
    }

    const query = searchQuery.toLowerCase();
    const filtered = unmarkedVehicles.filter(vehicle => {
      const vehicleNumber = (vehicle.vehicleNumber || '').toLowerCase();
      const ownerName = (vehicle.ownerName || '').toLowerCase();
      const ownerMobile = (vehicle.ownerMobile || '');

      return vehicleNumber.includes(query) ||
        ownerName.includes(query) ||
        ownerMobile.includes(query);
    });
    console.log(`Search query: "${searchQuery}", Found ${filtered.length} vehicles out of ${unmarkedVehicles.length}`,
      filtered.map(v => v.vehicleNumber));
    return filtered;
  }, [unmarkedVehicles, searchQuery]);

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
          <View
            style={[styles.badge, item.vehicleType === 'CAR' ? styles.carBadge : styles.bikeBadge]}
          >
            <Text style={styles.badgeText}>{item.vehicleType}</Text>
          </View>
        </View>
        <Text style={styles.ownerName}>{item.ownerName}</Text>
        <Text style={styles.ownerMobile}>{item.ownerMobile}</Text>
      </View>

      <TouchableOpacity
        style={styles.markButton}
        onPress={() => handleMarkArrival(item.vehicleNumber)}
      >
        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.markButtonText}>Mark</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>
          {searchQuery ? (
            `${filteredVehicles.length} of ${unmarkedVehicles.length} vehicle${unmarkedVehicles.length !== 1 ? 's' : ''}`
          ) : (
            `${unmarkedVehicles.length} vehicle${unmarkedVehicles.length !== 1 ? 's' : ''} pending`
          )}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vehicle number, owner name or mobile..."
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

      {loading && unmarkedVehicles.length === 0 ? (
        <ActivityIndicator size="large" color="#2B2B2B" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Results' : 'All Done!'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No vehicles found matching your search'
                  : 'All vehicles have been marked for today'}
              </Text>
            </View>
          }
        />
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
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
    marginLeft: 8,
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
  markButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
});

export default AttendanceScreen;
