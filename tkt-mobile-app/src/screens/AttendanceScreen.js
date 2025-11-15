import React, { useEffect } from 'react';
import {
  View,
  Text,
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
          {unmarkedVehicles.length} vehicle{unmarkedVehicles.length !== 1 ? 's' : ''} pending
        </Text>
      </View>

      {loading && unmarkedVehicles.length === 0 ? (
        <ActivityIndicator size="large" color="#2B2B2B" style={styles.loader} />
      ) : (
        <FlatList
          data={unmarkedVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
              <Text style={styles.emptyTitle}>All Done!</Text>
              <Text style={styles.emptyText}>
                All vehicles have been marked for today
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
