import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Platform, UIManager, RefreshControl, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import {
  Calendar as CalendarIcon,
  X,
  SlidersHorizontal,
  ChevronRight,
  Car,
  Phone,
  Clock,
  Inbox,
  Search,
  ArrowDownLeft,
  LogOut
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/HistoryScreenStyles.jsx';
import { COLORS, FONTS } from '../config/theme';
import axios from 'axios';
import { base_url, get_history } from '../config/constant';
import { showToast } from '../utils/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalEntries: 0, totalExits: 0, currentlyInside: 0, totalLogs: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [entryTypeFilter, setEntryTypeFilter] = useState('All');
  const [activePicker, setActivePicker] = useState(null); // 'from' | 'to' | null
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Entry' | 'Exit'
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();

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

  const formatDateHeader = (dateStr) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (dateStr === todayStr) {
      return `Today, ${dateStr}`;
    } else if (dateStr === yesterdayStr) {
      return `Yesterday, ${dateStr}`;
    }
    return dateStr;
  };



  const loadData = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setRecords([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const { retrieveEncryptedData } = require('../config/storage');
      const token = await retrieveEncryptedData('token');
      let url = `${base_url}${get_history}?page=${pageNum}&limit=10`;

      if (searchQuery.trim()) {
        url += `&registrationNumber=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (fromDate && !toDate) {
        const formattedDate = formatISODate(fromDate);
        url += `&fromDate=${formattedDate}&toDate=${formattedDate}`;
      } else if (toDate && !fromDate) {
        const formattedDate = formatISODate(toDate);
        url += `&fromDate=${formattedDate}&toDate=${formattedDate}`;
      } else {
        if (fromDate) {
          url += `&fromDate=${formatISODate(fromDate)}`;
        }
        if (toDate) {
          url += `&toDate=${formatISODate(toDate)}`;
        }
      }
      if (entryTypeFilter && entryTypeFilter !== 'All') {
        url += `&entryType=${entryTypeFilter.toLowerCase()}`;
      }

      if (activeTab && activeTab !== 'All') {
        url += `&status=${activeTab.toLowerCase()}`;
      }

      console.log('Token:', token);
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API Response:', response.data);
      const result = response.data;
      if (result && result.success && result.data && Array.isArray(result.data.entries)) {
        if (result.data.summary) {
          setSummary(result.data.summary);
        }
        const mapped = result.data.entries.map(item => {
          const entryTime = item.entryTime ? new Date(item.entryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
          const exitTime = item.exitTime ? new Date(item.exitTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
          const metaStr = item.meta || `Entered ${entryTime}${exitTime ? ` • Exited ${exitTime}` : ''}`;

          return {
            vehicleNumber: item.vehicle?.registrationNumber || item.registrationNumber || item.vehicleNumber || '',
            whatsappNumber: item.customer?.mobileNo || item.whatsappNumber || '',
            status: item.status || (item.exitTime ? 'Exit' : 'Entry'),
            entryType: item.entryType || 'Service',
            date: item.date || (item.entryTime ? new Date(item.entryTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
            meta: metaStr,
            entryTime,
            exitTime,
            entryTimestamp: item.entryTime || null,
            exitTimestamp: item.exitTime || null,
            rawItem: item,
          };
        });

        // Filter locally in case backend does not respect status parameters
        const localFiltered = activeTab === 'All'
          ? mapped
          : mapped.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());

        if (isLoadMore) {
          setRecords(prev => [...prev, ...localFiltered]);
        } else {
          setRecords(localFiltered);
        }

        if (result.meta) {
          setHasMore(pageNum < result.meta.totalPages);
        } else {
          setHasMore(result.data.entries.length === 10);
        }
      } else {
        if (!isLoadMore) setRecords([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
      showToast(error?.message || 'Failed to fetch history');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, fromDate, toDate, entryTypeFilter, activeTab]);

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      loadData(1, false);
    }
  }, [isFocused, searchQuery, fromDate, toDate, entryTypeFilter, activeTab, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadData(1, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, true);
    }
  };

  // Grouping Transformations
  const processedData = useMemo(() => {
    if (records.length === 0) {
      return [];
    }

    const grouped = [];
    const groups = {};
    records.forEach(item => {
      const d = item.date || 'Unknown Date';
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(item);
    });

    Object.keys(groups).forEach(date => {
      grouped.push({ isHeader: true, title: date, count: groups[date].length });
      grouped.push(...groups[date]);
    });
    return grouped;
  }, [records]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      totalEntries: summary.totalEntries || 0,
      totalExits: summary.totalExits || 0,
      currentlyInside: summary.currentlyInside || 0,
    };
  }, [summary]);

  const renderItem = ({ item }) => {
    if (item.isHeader) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{formatDateHeader(item.title)}</Text>
          <View style={styles.sectionHeaderBadge}>
            <Text style={styles.sectionHeaderBadgeText}>{item.count} Logs</Text>
          </View>
        </View>
      );
    }

    const isEntry = item.status?.toLowerCase() === 'inside' || item.status?.toLowerCase() === 'entry';
    const statusColor = isEntry ? '#10B981' : '#EF4444'; // Emerald for entry, Rose/Red for exit

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => navigation.navigate('HistoryDetail', item)}
        style={[styles.card, { borderLeftColor: statusColor }]}
      >
        {/* Left Circle Badge "IN" or "OUT" */}
        <View style={[styles.cardLeftCircle, { borderColor: statusColor }]}>
          <Text style={[styles.cardLeftCircleText, { color: statusColor }]}>
            {isEntry ? 'IN' : 'OUT'}
          </Text>
        </View>

        {/* Middle Content */}
        <View style={styles.cardMiddle}>
          {/* Top Row: Plate + Type Tag */}
          <View style={styles.cardRow1}>
            <Car size={13} color="#3b82f6" style={{ marginRight: 2 }} />
            <Text style={styles.cardPlateNumber}>{item.vehicleNumber}</Text>

            {item.entryType && (
              <View style={item.entryType.toLowerCase() === 'service' ? styles.badgeService : styles.badgeVisitor}>
                <Text style={item.entryType.toLowerCase() === 'service' ? styles.badgeServiceText : styles.badgeVisitorText}>
                  {item.entryType.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* WhatsApp / Phone Row */}
          <View style={styles.cardInfoRow}>
            <Phone size={12} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.cardInfoText}>{item.whatsappNumber || 'N/A'}</Text>
          </View>

          {/* Time Row */}
          <View style={styles.cardSubInfoRow}>
            <Clock size={12} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.cardSubInfoText}>
              {isEntry ? item.entryTime : item.exitTime || item.entryTime}
            </Text>
          </View>
        </View>

        {/* Right Chevron */}
        <View style={styles.cardRightChevron}>
          <ChevronRight size={16} color="#64748B" />
        </View>

        {/* Absolute Top-Right Badge for ENTRY/EXIT */}
        <View style={[isEntry ? styles.badgeEntry : styles.badgeExit, { position: 'absolute', top: 10, right: 12 }]}>
          <Text style={isEntry ? styles.badgeEntryText : styles.badgeExitText}>
            {isEntry ? 'ENTRY' : 'EXIT'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />}

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>History Log</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerActionBtn, showSearch && { borderColor: '#3b82f6' }]}
            onPress={() => setShowSearch(prev => !prev)}
          >
            <Search size={18} color={showSearch ? '#3b82f6' : '#64748B'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerActionBtn, showFilters && { borderColor: '#3b82f6' }]}
            onPress={() => setShowFilters(prev => !prev)}
          >
            <SlidersHorizontal size={18} color={showFilters ? '#3b82f6' : '#64748B'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* FlatList container wrapping all contents to scroll properly */}
      <FlatList
        data={processedData}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.isHeader ? `header_${item.title}_${index}` : `${item.vehicleNumber}_${index}`}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Search Input Container */}
            {showSearch && (
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Search size={18} color="#64748B" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by vehicle or phone..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={16} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}



            {/* Stats Cards Row */}
            <View style={styles.statsCardRow}>
              {/* Total Entries */}
              <View style={styles.statsCardSingle}>
                {/* Row 1: Header */}
                <Text style={styles.statsCardLabel}>Total Entries</Text>

                {/* Row 2: Icon + Count */}
                <View style={styles.statsCardMiddleRow}>
                  <View style={[styles.statsCardIconContainer, { backgroundColor: '#E6F4EA' }]}>
                    <ArrowDownLeft size={16} color="#10B981" />
                  </View>
                  <Text style={[styles.statsCardValue, { color: '#10B981' }]}>{stats.totalEntries}</Text>
                </View>

                {/* Row 3: Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.statsCardLinkBtn}
                  onPress={() => setActiveTab('All')}
                >
                  <Text style={styles.statsCardLinkText}>View all</Text>
                  <ChevronRight size={10} color="#1A73E8" />
                </TouchableOpacity>
              </View>

              {/* Total Exits */}
              <View style={styles.statsCardSingle}>
                {/* Row 1: Header */}
                <Text style={styles.statsCardLabel}>Total Exits</Text>

                {/* Row 2: Icon + Count */}
                <View style={styles.statsCardMiddleRow}>
                  <View style={[styles.statsCardIconContainer, { backgroundColor: '#FCE8E6' }]}>
                    <LogOut size={14} color="#EF4444" />
                  </View>
                  <Text style={[styles.statsCardValue, { color: '#EF4444' }]}>{stats.totalExits}</Text>
                </View>

                {/* Row 3: Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.statsCardLinkBtn}
                  onPress={() => setActiveTab(activeTab === 'Exit' ? 'All' : 'Exit')}
                >
                  <Text style={styles.statsCardLinkText}>View all</Text>
                  <ChevronRight size={10} color="#1A73E8" />
                </TouchableOpacity>
              </View>

              {/* Currently Inside */}
              <View style={styles.statsCardSingle}>
                {/* Row 1: Header */}
                <Text style={styles.statsCardLabel}>Currently Inside</Text>

                {/* Row 2: Icon + Count */}
                <View style={styles.statsCardMiddleRow}>
                  <View style={[styles.statsCardIconContainer, { backgroundColor: '#E8F0FE' }]}>
                    <Car size={16} color="#1A73E8" />
                  </View>
                  <Text style={[styles.statsCardValue, { color: '#1A73E8' }]}>{stats.currentlyInside}</Text>
                </View>

                {/* Row 3: Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.statsCardLinkBtn}
                  onPress={() => setActiveTab(activeTab === 'Entry' ? 'All' : 'Entry')}
                >
                  <Text style={styles.statsCardLinkText}>View all</Text>
                  <ChevronRight size={10} color="#1A73E8" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 60, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13, fontWeight: '500', fontFamily: FONTS.inter }}>Loading logs...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Inbox size={40} color="#64748B" style={{ marginBottom: 12, opacity: 0.5 }} />
              <Text style={styles.emptyText}>
                No records found matching your filters
              </Text>
            </View>
          )
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

      {/* OS Built-in Calendar Picker */}
      {activePicker === 'from' && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setActivePicker(null);
            if (selectedDate) {
              setFromDate(selectedDate);
            }
          }}
        />
      )}
      {activePicker === 'to' && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setActivePicker(null);
            if (selectedDate) {
              setToDate(selectedDate);
            }
          }}
        />
      )}
      {/* Filters Bottom Sheet */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContainer}>
                {/* Header of bottom sheet */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Filter Options</Text>
                  <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.sheetCloseBtn}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Date Picker Range Box */}
                <View style={[styles.dateFilterContainer, { paddingHorizontal: 0 }]}>
                  <TouchableOpacity
                    style={[styles.dateCard, activePicker === 'from' && styles.dateCardActive]}
                    onPress={() => setActivePicker('from')}
                  >
                    <CalendarIcon size={15} color="#3b82f6" style={styles.dateIconContainer} />
                    <View style={styles.dateLabelContainer}>
                      <Text style={styles.dateLabel}>From Date</Text>
                      <Text style={styles.dateValue}>
                        {fromDate ? fmtDate(fromDate) : 'Select Date'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.dateSeparatorText}>to</Text>

                  <TouchableOpacity
                    style={[styles.dateCard, activePicker === 'to' && styles.dateCardActive]}
                    onPress={() => setActivePicker('to')}
                  >
                    <CalendarIcon size={15} color="#3b82f6" style={styles.dateIconContainer} />
                    <View style={styles.dateLabelContainer}>
                      <Text style={styles.dateLabel}>To Date</Text>
                      <Text style={styles.dateValue}>
                        {toDate ? fmtDate(toDate) : 'Select Date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Entry Type Chips Container */}
                <View style={[styles.typeContainer, { paddingHorizontal: 0 }]}>
                  <Text style={styles.typeLabel}>Service / Entry Type</Text>
                  <View style={styles.typeChipRow}>
                    {['All', 'Service', 'Visitor'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeChip,
                          entryTypeFilter === type && styles.typeChipActive
                        ]}
                        onPress={() => setEntryTypeFilter(type)}
                      >
                        <Text
                          style={[
                            styles.typeChipText,
                            entryTypeFilter === type && styles.typeChipTextActive
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}