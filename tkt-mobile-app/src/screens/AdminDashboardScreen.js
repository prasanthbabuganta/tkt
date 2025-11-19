import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminDashboardAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AdminDashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Format date in local timezone to avoid timezone offset issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
      console.log('Fetching dashboard data for date:', dateString);
      const response = await adminDashboardAPI.getMultiCampusDashboard(dateString);
      console.log('Dashboard API response:', response);
      console.log('Response data:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch data when selectedDate changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleDateChange = (event, date) => {
    // Close the picker on Android immediately
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    // Update the date if user selected one (not dismissed)
    if (date && event.type !== 'dismissed') {
      setSelectedDate(date);
      // Close the picker on iOS after selection
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed' && Platform.OS === 'ios') {
      // Close the picker on iOS if dismissed
      setShowDatePicker(false);
    }
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const renderCampusCard = (campusKey, campusData) => {
    if (!campusData) return null;

    // Define colors for each campus
    const campusColors = {
      east: { primary: '#3B82F6', light: '#DBEAFE' },
      west: { primary: '#10B981', light: '#D1FAE5' },
      north: { primary: '#F59E0B', light: '#FEF3C7' },
      south: { primary: '#8B5CF6', light: '#EDE9FE' },
    };

    const colors = campusColors[campusKey] || campusColors.east;

    return (
      <View
        key={campusKey}
        style={[styles.campusCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}
      >
        {/* Campus Header */}
        <View style={styles.campusHeader}>
          <Text style={styles.campusName}>{campusData.campusName}</Text>
          <View style={[styles.totalBadge, { backgroundColor: colors.light }]}>
            <Text style={[styles.totalBadgeText, { color: colors.primary }]}>
              {campusData.totalCount} Total
            </Text>
          </View>
        </View>

        {/* Vehicle Counts */}
        <View style={styles.countsContainer}>
          <View style={styles.countItem}>
            <Ionicons name="car" size={24} color="#3B82F6" />
            <View style={styles.countTextContainer}>
              <Text style={styles.countNumber}>{campusData.carsCount}</Text>
              <Text style={styles.countLabel}>Cars</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.countItem}>
            <Ionicons name="bicycle" size={24} color="#F59E0B" />
            <View style={styles.countTextContainer}>
              <Text style={styles.countNumber}>{campusData.bikesCount}</Text>
              <Text style={styles.countLabel}>Bikes</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Multi-Campus Vehicle Arrivals</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateSelectorButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={20} color="#2B2B2B" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {!isToday() && (
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setSelectedDate(new Date())}
              activeOpacity={0.7}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Loading State */}
        {loading && !dashboardData ? (
          <ActivityIndicator size="large" color="#2B2B2B" style={styles.loader} />
        ) : dashboardData ? (
          <View style={styles.dashboardContent}>
            {/* Campus Cards Grid */}
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {renderCampusCard('east', dashboardData.campusStats.east)}
                {renderCampusCard('west', dashboardData.campusStats.west)}
              </View>
              <View style={styles.gridRow}>
                {renderCampusCard('north', dashboardData.campusStats.north)}
                {renderCampusCard('south', dashboardData.campusStats.south)}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dateSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2B2B',
    marginLeft: 12,
  },
  todayButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loader: {
    marginTop: 40,
  },
  dashboardContent: {
    padding: 16,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  campusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  campusName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  totalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  countTextContainer: {
    marginLeft: 8,
  },
  countNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  countLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});

export default AdminDashboardScreen;
