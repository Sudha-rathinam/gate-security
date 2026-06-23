import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, FONTS } from '../config/theme';
import { Search, ArrowLeft, CheckCircle, User, Calendar, Clock, LogOut, Car, Wrench, Tag } from 'lucide-react-native';
import { showToast } from '../utils/toast';

/* Mock customer database containing known customers and their mock arrival details */
const customerDB = [
  { vehicleNumber: 'TN58AB1234', whatsappNumber: '9876543210', arrivalDate: '19 Jun 2026', arrivalTime: '08:45 AM', entryType: 'Service' },
  { vehicleNumber: 'TN58CA5678', whatsappNumber: '9876543211', arrivalDate: '19 Jun 2026', arrivalTime: '10:15 AM', entryType: 'Pickup' },
  { vehicleNumber: 'TN58MN4321', whatsappNumber: '9876543212', arrivalDate: '19 Jun 2026', arrivalTime: '10:30 AM', entryType: 'Service' },
  { vehicleNumber: 'TN58EG1212', whatsappNumber: '9876543213', arrivalDate: '19 Jun 2026', arrivalTime: '11:00 AM', entryType: 'Enquiry' },
];

/* ──────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────── */
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function VehicleEntryScreen({ navigation }) {
  const [parkedVehicles, setParkedVehicles] = useState(customerDB);
  const isFocused = useIsFocused();

  /* Navigation/Phase states */
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [phase, setPhase] = useState(null); // null = input number, 'ready' = show form

  /* Entry/Exit state details */
  const [isCurrentlyParked, setIsCurrentlyParked] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [entryType, setEntryType] = useState('Service'); // 'Service' | 'Pickup' | 'Enquiry'
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitTime, setExitTime] = useState('');

  const [todayDate, setTodayDate] = useState('');
  const [todayTime, setTodayTime] = useState('');

  /* ── Search Vehicle ── */
  const handleSearch = () => {
    const q = vehicleNumber.trim().toUpperCase();
    if (!q) {
      showToast('Please enter a vehicle registration number.');
      return;
    }

    setSearching(true);

    setTimeout(() => {
      const now = new Date();
      const currentTodayDate = fmtDate(now);
      const currentTodayTime = fmtTime(now);

      // Check if this vehicle is in the database (returning/parked)
      const customerMatch = parkedVehicles.find(v => v.vehicleNumber === q);

      if (customerMatch) {
        // Returning/existing customer -> Prepare for exit flow
        setIsCurrentlyParked(true);
        setWhatsappNumber(customerMatch.whatsappNumber);
        setEntryType(customerMatch.entryType || 'Service');
        setArrivalDate(customerMatch.arrivalDate);
        setArrivalTime(customerMatch.arrivalTime);
        setExitDate(currentTodayDate);
        setExitTime(currentTodayTime);
      } else {
        // New entry flow
        setIsCurrentlyParked(false);
        setWhatsappNumber('');
        setEntryType('Service');
        setTodayDate(currentTodayDate);
        setTodayTime(currentTodayTime);
      }

      setVehicleNumber(q);
      setPhase('ready');
      setSearching(false);
    }, 600);
  };

  /* ── Reset state ── */
  const handleReset = () => {
    setVehicleNumber('');
    setWhatsappNumber('');
    setEntryType('Service');
    setArrivalDate('');
    setArrivalTime('');
    setExitDate('');
    setExitTime('');
    setTodayDate('');
    setTodayTime('');
    setIsCurrentlyParked(false);
    setPhase(null);
  };

  /* ── Submit Entry ── */
  const handleSubmitEntry = () => {
    if (!whatsappNumber.trim()) {
      showToast('Please enter the WhatsApp number.');
      return;
    }

    const newVehicle = {
      vehicleNumber: vehicleNumber,
      whatsappNumber: whatsappNumber.trim(),
      arrivalDate: todayDate,
      arrivalTime: todayTime,
      entryType: entryType,
    };

    setParkedVehicles(prev => [...prev, newVehicle]);

    showToast(`Vehicle ${vehicleNumber} entry recorded successfully.`);
    handleReset();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  /* ── Submit Exit ── */
  const handleSubmitExit = () => {
    setParkedVehicles(prev => prev.filter(v => v.vehicleNumber !== vehicleNumber));

    showToast(`Vehicle ${vehicleNumber} exit recorded successfully.`);
    handleReset();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  /* ─────────────────────── PHASE 1: Vehicle Number Input ─────────────────────── */
  if (phase === null) {
    return (
      <SafeAreaView style={s.safe}>
        {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={s.phase1Wrap}>
              {/* Header */}
              <View style={s.phase1Header}>
                <Car size={44} color={COLORS.primary} />
                <Text style={s.phase1Title}>Vehicle Entry / Exit</Text>
                <Text style={s.phase1Sub}>Enter the vehicle registration number to proceed</Text>
              </View>

              {/* Registration Input Card */}
              <View style={s.regCard}>
                <Text style={s.regLabel}>REGISTRATION NUMBER</Text>
                <View style={s.inputWrapper}>
                  <TextInput
                    style={s.regInput}
                    autoCapitalize="characters"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                    placeholder="e.g. TN58AB1234"
                    placeholderTextColor={COLORS.muted}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[s.searchBtn, !vehicleNumber.trim() && s.searchBtnDisabled]}
                  onPress={handleSearch}
                  disabled={!vehicleNumber.trim() || searching}
                >
                  {searching ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Search color="#fff" size={18} strokeWidth={2.5} />
                      <Text style={s.searchBtnText}>PROCEED</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ─────────────────────── PHASE 2: Form Details ─────────────────────── */
  return (
    <SafeAreaView style={s.safe}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Top Navigation Bar */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={handleReset}>
              <ArrowLeft size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <Text style={s.topBarTitle}>
              {isCurrentlyParked ? 'Finalize Exit' : 'Register Entry'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Vehicle Registration Badge - Only show for new entries */}
          {!isCurrentlyParked && (
            <View style={[s.bannerCard, s.bannerNew]}>
              <View style={s.bannerLeft}>
                <Text style={s.bannerPlate}>{vehicleNumber}</Text>
                <Text style={s.bannerSub}>New vehicle entry</Text>
              </View>
              <View style={[s.bannerBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[s.bannerBadgeText, { color: '#15803D' }]}>★ NEW ENTRY</Text>
              </View>
            </View>
          )}

          {/* ──────────────── NEW VEHICLE ENTRY FLOW ──────────────── */}
          {!isCurrentlyParked ? (
            <>
              {/* Today Date & Time Row */}
              <View style={s.dtRow}>
                <View style={s.dtItem}>
                  <Text style={s.dtLabel}>Today Date</Text>
                  <Text style={s.dtValue}>{todayDate}</Text>
                </View>
                <View style={s.dtDivider} />
                <View style={s.dtItem}>
                  <Text style={s.dtLabel}>Today Time</Text>
                  <Text style={[s.dtValue, { color: COLORS.primary }]}>{todayTime}</Text>
                </View>
              </View>

              {/* Input fields */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Entry Details</Text>
                <Text style={s.fieldLabel}>Owner Name</Text>
                <View style={[s.inputContainer, { marginBottom: 16 }]}>
                  <User size={16} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.textInputStyle}
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="Enter owner's full name"
                    placeholderTextColor={COLORS.muted}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={s.fieldLabel}>Entry Type</Text>
                <View style={s.typeSelectorRow}>
                  {['Service', 'Pickup', 'Enquiry'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[s.typeChip, entryType === type && s.typeChipActive]}
                      onPress={() => setEntryType(type)}
                    >
                      <Text style={[s.typeChipText, entryType === type && s.typeChipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmitEntry}>
                <CheckCircle size={20} color="#fff" />
                <Text style={s.submitBtnText}>SUBMIT ENTRY</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ──────────────── VEHICLE ALREADY EXISTS (EXIT FLOW) ──────────────── */
            <>
              {/* Today Date & Time Row (representing Exit Time) */}
              <View style={[s.dtRow, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                <View style={s.dtItem}>
                  <Text style={[s.dtLabel, { color: '#EF4444' }]}>Today Date</Text>
                  <Text style={s.dtValue}>{exitDate}</Text>
                </View>
                <View style={[s.dtDivider, { backgroundColor: '#FCA5A5' }]} />
                <View style={s.dtItem}>
                  <Text style={[s.dtLabel, { color: '#EF4444' }]}>Today Time</Text>
                  <Text style={[s.dtValue, { color: '#EF4444' }]}>{exitTime}</Text>
                </View>
              </View>

              {/* Show details: owner name, arrival date & time */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Vehicle Parked Details</Text>

                {/* Owner Name */}
                <View style={[s.fieldWrap, s.fieldBorder]}>
                  <View style={s.iconBox}>
                    <User size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Owner Name</Text>
                    <Text style={s.fieldValueText}>{ownerName}</Text>
                  </View>
                </View>

                {/* Arrival Date & Time */}
                <View style={[s.fieldWrap, s.fieldBorder]}>
                  <View style={s.iconBox}>
                    <Calendar size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Arrival Date & Time</Text>
                    <Text style={s.fieldValueText}>{arrivalDate} • {arrivalTime}</Text>
                  </View>
                </View>

                {/* Entry Type */}
                <View style={s.fieldWrap}>
                  <View style={s.iconBox}>
                    <Tag size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Entry Type</Text>
                    <Text style={s.fieldValueText}>{entryType}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#EF4444' }]} onPress={handleSubmitExit}>
                <LogOut size={20} color="#fff" />
                <Text style={s.submitBtnText}>SUBMIT EXIT</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Start Over Button */}
          {/* <TouchableOpacity style={s.cancelBtn} onPress={handleReset}>
          <Text style={s.cancelBtnText}>Cancel & Go Back</Text>
        </TouchableOpacity> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40 },

  /* ── Phase 1 ── */
  phase1Wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  phase1Header: { alignItems: 'center', marginBottom: 28 },
  phase1Title: { color: COLORS.secondary, fontSize: 24, marginTop: 12, marginBottom: 6, fontFamily: FONTS.bold },
  phase1Sub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 18, fontFamily: FONTS.regular },

  regCard: { width: '100%', backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  regLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 8, fontFamily: FONTS.bold, letterSpacing: 0.5 },
  inputWrapper: { width: '100%', marginBottom: 16 },
  regInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, color: COLORS.secondary, backgroundColor: COLORS.background, textAlign: 'center', fontFamily: FONTS.semiBold },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14 },
  searchBtnDisabled: { backgroundColor: '#94A3B8' },
  searchBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold },

  /* ── Phase 2 ── */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { color: COLORS.secondary, fontSize: 18, fontFamily: FONTS.bold },

  /* Banner */
  bannerCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  bannerExisting: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  bannerNew: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  bannerLeft: { flex: 1 },
  bannerPlate: { color: COLORS.secondary, fontSize: 20, fontFamily: FONTS.bold, letterSpacing: 1 },
  bannerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2, fontFamily: FONTS.regular },
  bannerBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  bannerBadgeText: { fontSize: 10, fontFamily: FONTS.bold },

  /* Date/time */
  dtRow: { flexDirection: 'row', backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  dtItem: { flex: 1, alignItems: 'center' },
  dtDivider: { width: 1, backgroundColor: '#BAE6FD' },
  dtLabel: { color: '#0369A1', fontSize: 10, fontFamily: FONTS.bold, marginBottom: 2 },
  dtValue: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.bold },

  /* Cards */
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
  cardTitle: { color: COLORS.secondary, fontSize: 12, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

  /* Fields */
  fieldWrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 2, fontFamily: FONTS.medium },
  fieldInput: { color: COLORS.secondary, fontSize: 15, padding: 0, fontFamily: FONTS.medium },
  fieldValueText: { color: COLORS.secondary, fontSize: 15, fontFamily: FONTS.semiBold },

  /* Buttons */
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, elevation: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, marginBottom: 10 },
  submitBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold, letterSpacing: 0.5 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.bold },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputStyle: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 15,
    paddingVertical: 10,
    fontFamily: FONTS.medium,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.semiBold,
  },
  typeChipTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
