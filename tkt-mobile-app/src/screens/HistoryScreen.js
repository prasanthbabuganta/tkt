import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { reportsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const HistoryScreen = ({ hideHeader = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      const response = isToday
        ? await reportsAPI.getDailyReport()
        : await reportsAPI.getDailyReportByDate(dateStr);

      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReport();
    setRefreshing(false);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderVisitItem = ({ item }) => (
    <View style={styles.visitCard}>
      <View style={styles.visitHeader}>
        <View style={styles.visitInfo}>
          <Text style={styles.vehicleNumber}>{item.vehicle.vehicleNumber}</Text>
          <View
            style={[
              styles.badge,
              item.vehicle.vehicleType === 'CAR' ? styles.carBadge : styles.bikeBadge,
            ]}
          >
            <Text style={styles.badgeText}>{item.vehicle.vehicleType}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={16} color="#6B7280" style={{ marginRight: 4 }} />
          <Text style={styles.timeText}>{formatTime(item.arrivedAt)}</Text>
        </View>
      </View>

      <Text style={styles.ownerName}>{item.vehicle.ownerName}</Text>
      <Text style={styles.ownerMobile}>{item.vehicle.ownerMobile}</Text>

      <View style={styles.markedBy}>
        <Ionicons name="person" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
        <Text style={styles.markedByText}>Marked by: {item.markedByMobile}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!hideHeader && <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />}
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily History</Text>
          <Text style={styles.headerSubtitle}>View attendance records</Text>
        </View>
      )}

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={20} color="#2B2B2B" style={{ marginRight: 12 }} />
          <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
          <Ionicons name="chevron-down" size={20} color="#2B2B2B" style={{ marginLeft: 12 }} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Stats Summary */}
      {reportData && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{reportData.totalArrivals}</Text>
            <Text style={styles.summaryLabel}>Arrivals</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{reportData.totalRegisteredVehicles}</Text>
            <Text style={styles.summaryLabel}>Total Vehicles</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{reportData.unmarkedCount}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
        </View>
      )}

      {/* Visits List */}
      {loading && !reportData ? (
        <ActivityIndicator size="large" color="#2B2B2B" style={styles.loader} />
      ) : (
        <FlatList
          data={reportData?.visits || []}
          renderItem={renderVisitItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No visits recorded for this date</Text>
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
  dateSelector: {
    padding: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  visitCard: {
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
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
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
  markedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  markedByText: {
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

export default HistoryScreen;
