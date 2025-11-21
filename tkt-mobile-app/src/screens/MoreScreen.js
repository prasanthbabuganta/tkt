import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import HistoryScreen from './HistoryScreen';
import UserManagementScreen from './UserManagementScreen';
import ProfileScreen from './ProfileScreen';

const { width } = Dimensions.get('window');

const MoreScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  // Default to 'History' or 'Profile' depending on admin status
  const [activeTab, setActiveTab] = useState('History');

  const tabs = [
    { key: 'History', title: 'History', icon: 'calendar' },
    ...(isAdmin ? [{ key: 'Users', title: 'Users', icon: 'people' }] : []),
    { key: 'Profile', title: 'Profile', icon: 'person' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'History':
        return <HistoryScreen hideHeader={true} />;
      case 'Users':
        return isAdmin ? <UserManagementScreen hideHeader={true} /> : null;
      case 'Profile':
        return <ProfileScreen hideHeader={true} />;
      default:
        return <HistoryScreen hideHeader={true} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B2B" />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === tab.key ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={activeTab === tab.key ? '#2B2B2B' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.title}
            </Text>
            {activeTab === tab.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabButtonActive: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#2B2B2B',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2B2B2B',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  content: {
    flex: 1,
  },
});

export default MoreScreen;
