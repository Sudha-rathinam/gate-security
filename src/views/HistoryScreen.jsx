import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import VehicleCard from '../components/VehicleCard';
import styles from '../styles/HistoryScreenStyles.jsx';
import { COLORS, FONTS } from '../config/theme';
import axios from 'axios';
import { base_url, get_history } from '../config/constant';
import { getSecureItem } from '../config/storage';
import { showToast } from '../utils/toast';

export default function HistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(null); // Default to null (shows all records)
  const [activeTab, setActiveTab] = useState('Entry'); // 'Entry' | 'Exit'
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();

  const handleDateChange = (event, selectedDate) => {
    setShowCalendar(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatISODate = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = fmtDate(date);

  const loadData = useCallback(async (pageNum, isLoadMore = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await getSecureItem('token');
      let url = `${base_url}${get_history}?page=${pageNum}&limit=10`;

      if (searchQuery.trim()) {
        url += `&registrationNumber=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (date) {
        const formattedDate = formatISODate(date);
        url += `&fromDate=${formattedDate}&toDate=${formattedDate}`;
      }
      
      // Filter status by mapping 'Entry' / 'Exit' tab to status query
      url += `&status=${activeTab.toLowerCase()}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = response.data;
      if (result && result.success && Array.isArray(result.data)) {
        const mapped = result.data.map(item => {
          const entryTime = item.entryTime || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');
          const exitTime = item.exitTime ? new Date(item.exitTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
          const metaStr = item.meta || `Entered ${entryTime}${exitTime ? ` • Exited ${exitTime}` : ''}`;
          
          return {
            vehicleNumber: item.registrationNumber || item.vehicleNumber || '',
            whatsappNumber: item.whatsappNumber || '',
            status: item.status || (item.exitTime ? 'Exit' : 'Entry'),
            entryType: item.entryType || '',
            date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
            meta: metaStr,
            rawItem: item,
          };
        });

        // Backend returns status-filtered entries directly. In case backend doesn't support status param,
        // we can still locally filter as a fallback safety measure:
        const localFiltered = mapped.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());

        if (isLoadMore) {
          setRecords(prev => [...prev, ...localFiltered]);
        } else {
          setRecords(localFiltered);
        }

        if (result.pagination) {
          setHasMore(pageNum < result.pagination.pages);
        } else {
          setHasMore(result.data.length === 10);
        }
      } else {
        if (!isLoadMore) setRecords([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
      showToast('Failed to fetch history.');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, date, activeTab]);

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      loadData(1, false);
    }
  }, [isFocused, searchQuery, date, activeTab, loadData]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, true);
    }
  };

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
              placeholder="Search by vehicle or phone..."
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
        {date && (
          <View style={localStyles.filterChipRow}>
            <View style={localStyles.chip}>
              <Text style={localStyles.chipText}>Date: {selectedDateStr}</Text>
              <TouchableOpacity onPress={() => setDate(null)} style={localStyles.chipCloseBtn}>
                <X size={12} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

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

      {/* Scrolling Content List using FlatList for infinite pagination */}
      {loading && page === 1 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.vehicleNumber}_${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('HistoryDetail', item)}
            >
              <VehicleCard
                vehicleNumber={item.vehicleNumber}
                whatsappNumber={item.whatsappNumber}
                status={item.status}
                entryType={item.entryType}
                meta={item.meta}
              />
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Recent Records</Text>
          }
          ListEmptyComponent={
            <View style={localStyles.emptyContainer}>
              <Text style={localStyles.emptyText}>
                No {activeTab.toLowerCase() === 'entry' ? 'entries' : 'exits'} found{date ? ` for ${selectedDateStr}` : ''}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      )}

      {/* OS Built-in Calendar Picker */}
      {showCalendar && (
        <DateTimePicker
          value={date || new Date()}
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
