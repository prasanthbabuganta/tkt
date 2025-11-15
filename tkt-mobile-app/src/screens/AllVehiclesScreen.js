import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { vehicleAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const AllVehiclesScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, CAR, BIKE

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  const fetchAllVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllVehicles();
    setRefreshing(false);
  };

  const getFilteredVehicles = () => {
    if (filter === 'ALL') {
      return vehicles;
    }
    return vehicles.filter((v) => v.vehicleType === filter);
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
        <View
          style={[
            styles.badge,
            item.vehicleType === 'CAR' ? styles.carBadge : styles.bikeBadge,
          ]}
        >
          <Text style={styles.badgeText}>{item.vehicleType}</Text>
        </View>
      </View>
      <Text style={styles.ownerName}>{item.ownerName}</Text>
      <Text style={styles.ownerMobile}>{item.ownerMobile}</Text>
      <View style={styles.registeredDate}>
        <Ionicons
          name="calendar"
          size={14}
          color="#9CA3AF"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.registeredDateText}>
          Registered: {new Date(item.createdAt).toLocaleDateString('en-IN')}
        </Text>
      </View>
    </View>
  );

  const filteredVehicles = getFilteredVehicles();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>All Registered Vehicles</Text>
          <Text style={styles.headerSubtitle}>
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'ALL' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('ALL')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'ALL' && styles.filterButtonTextActive,
            ]}
          >
            All ({vehicles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'CAR' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('CAR')}
        >
          <Ionicons
            name="car"
            size={16}
            color={filter === 'CAR' ? '#FFFFFF' : '#6B7280'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterButtonText,
              filter === 'CAR' && styles.filterButtonTextActive,
            ]}
          >
            Cars ({vehicles.filter((v) => v.vehicleType === 'CAR').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'BIKE' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('BIKE')}
        >
          <Ionicons
            name="bicycle"
            size={16}
            color={filter === 'BIKE' ? '#FFFFFF' : '#6B7280'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterButtonText,
              filter === 'BIKE' && styles.filterButtonTextActive,
            ]}
          >
            Bikes ({vehicles.filter((v) => v.vehicleType === 'BIKE').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vehicles List */}
      {loading && !vehicles.length ? (
        <ActivityIndicator
          size="large"
          color="#2B2B2B"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                No {filter !== 'ALL' ? filter.toLowerCase() + 's' : 'vehicles'} registered yet
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#2B2B2B',
    borderColor: '#2B2B2B',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
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
    marginBottom: 8,
  },
  registeredDate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  registeredDateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
});

export default AllVehiclesScreen;
