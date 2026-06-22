import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import VehicleCard from './components/VehicleCard';
import styles from '../styles/HistoryScreenStyles.jsx';
import { COLORS, FONTS } from '../config/theme';

const allRecords = [
  { vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma', status: 'Exit', entryType: 'Service', date: '19 Jun 2026', meta: 'Entered 08:45 AM • Exited 04:10 PM' },
  { vehicleNumber: 'TN58MN4321', owner: 'Naina Rao', status: 'Entry', entryType: 'Service', date: '19 Jun 2026', meta: 'Entered 10:30 AM' },
  { vehicleNumber: 'TN58CA5678', owner: 'John Doe', status: 'Exit', entryType: 'Pickup', date: '19 Jun 2026', meta: 'Entered 10:15 AM • Exited 01:30 PM' },
  { vehicleNumber: 'TN58EG1212', owner: 'S. Reddy', status: 'Entry', entryType: 'Enquiry', date: '19 Jun 2026', meta: 'Entered 11:00 AM' },
];

export default function HistoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date(2026, 5, 19)); // Default to 19 June 2026 to match mock data
  const [activeTab, setActiveTab] = useState('Entry'); // 'Entry' | 'Exit'
  const isFocused = useIsFocused();

  const handleDateChange = (event, selectedDate) => {
    setShowCalendar(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const fmtDate = (d) => {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const selectedDateStr = fmtDate(date);

  // Filter based on search query, selected date, and active tab
  const filteredRecords = allRecords.filter(item => {
    const matchesSearch = item.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = item.date === selectedDateStr;
    const matchesTab = item.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesDate && matchesTab;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      {/* Fixed Top Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.title}>History Log</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by vehicle or owner..."
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={styles.searchIconSymbol}>🔍</Text>
          </View>
          <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(true)}>
            <CalendarIcon size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Selected date filter chip */}
        <View style={localStyles.filterChipRow}>
          <View style={localStyles.chip}>
            <Text style={localStyles.chipText}>Date: {selectedDateStr}</Text>
            {selectedDateStr !== '19 Jun 2026' && (
              <TouchableOpacity onPress={() => setDate(new Date(2026, 5, 19))} style={localStyles.chipCloseBtn}>
                <X size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={localStyles.tabContainer}>
          <TouchableOpacity 
            style={[localStyles.tabButton, activeTab === 'Entry' && localStyles.activeTabButton]} 
            onPress={() => setActiveTab('Entry')}
            activeOpacity={0.8}
          >
            <Text style={[localStyles.tabText, activeTab === 'Entry' && localStyles.activeTabText]}>Entries</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[localStyles.tabButton, activeTab === 'Exit' && localStyles.activeTabButton]} 
            onPress={() => setActiveTab('Exit')}
            activeOpacity={0.8}
          >
            <Text style={[localStyles.tabText, activeTab === 'Exit' && localStyles.activeTabText]}>Exits</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrolling Content List */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          {filteredRecords.length === 0 ? (
            <View style={localStyles.emptyContainer}>
              <Text style={localStyles.emptyText}>No {activeTab.toLowerCase() === 'entry' ? 'entries' : 'exits'} found for {selectedDateStr}</Text>
            </View>
          ) : (
            filteredRecords.map((item) => (
              <TouchableOpacity
                key={item.vehicleNumber}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('HistoryDetail', item)}
              >
                <VehicleCard
                  vehicleNumber={item.vehicleNumber}
                  owner={item.owner}
                  status={item.status}
                  entryType={item.entryType}
                  meta={item.meta}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* OS Built-in Calendar Picker */}
      {showCalendar && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  filterChipRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  chipCloseBtn: {
    marginLeft: 6,
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONTS.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.medium,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
