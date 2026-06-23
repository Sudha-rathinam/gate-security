import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, FONTS } from '../config/theme';
import { PlusSquare, Car, User, Clock, Activity, ChevronRight, Phone, FileText } from 'lucide-react-native';
import { getUserName, getInitials } from '../utils/userState';
import { showToast } from '../utils/toast';

/* ──────────────────────────────────────────────────────
   SHARED DATA (exported so TodayListScreen can import)
   ────────────────────────────────────────────────────── */
export const entryRecords = [
  { id: 1, vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma', entryTime: '08:45 AM', model: 'Honda City',    entryType: 'Service' },
  { id: 2, vehicleNumber: 'TN58CA5678', owner: 'John Doe',    entryTime: '10:15 AM', model: 'Maruti Swift',  entryType: 'Pickup' },
  { id: 3, vehicleNumber: 'TN58MN4321', owner: 'Naina Rao',  entryTime: '10:30 AM', model: 'Toyota Innova', entryType: 'Service' },
  { id: 4, vehicleNumber: 'TN58EG1212', owner: 'S. Reddy',   entryTime: '11:00 AM', model: 'Hyundai Creta', entryType: 'Enquiry' },
];

export const exitRecords = [
  { id: 1, vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma', exitTime: '04:10 PM', model: 'Honda City',    entryType: 'Service' },
  { id: 2, vehicleNumber: 'TN58CA5678', owner: 'Ravi Patel',  exitTime: '01:30 PM', model: 'Tata Nexon',     entryType: 'Service' },
];

/* ──────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────── */
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}

/* ══════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════ */
export default function HomeScreen({ navigation }) {
  const [now, setNow] = useState(new Date());
  const isFocused = useIsFocused();
  
  const currentName = getUserName();
  const initials = getInitials(currentName);

  // Dynamic state for active entries inside the shop
  const [activeEntries, setActiveEntries] = useState([
    { id: 1, vehicleNumber: 'TN58AB1234', ownerName: 'Amit Sharma', entryType: 'Service', entryTime: '08:45 AM', entryDate: '22 Jun 2026', remarks: 'Needs wheel alignment' },
    { id: 2, vehicleNumber: 'TN58CA5678', ownerName: 'John Doe',    entryType: 'Pickup',  entryTime: '10:15 AM', entryDate: '22 Jun 2026', remarks: '' },
    { id: 3, vehicleNumber: 'TN58MN4321', ownerName: 'Naina Rao',   entryType: 'Service', entryTime: '10:30 AM', entryDate: '22 Jun 2026', remarks: 'Check oil leak' },
    { id: 4, vehicleNumber: 'TN58EG1212', ownerName: 'S. Reddy',    entryType: 'Enquiry', entryTime: '11:00 AM', entryDate: '22 Jun 2026', remarks: 'Body wash pricing' },
  ]);



  // Vehicle search state
  const [searchVehicle, setSearchVehicle] = useState('');
  const [verifiedVehicle, setVerifiedVehicle] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // Form inputs state
  const [ownerName, setOwnerName] = useState('');
  const [entryType, setEntryType] = useState('Service'); // 'Service' | 'Pickup' | 'Enquiry'
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleSearchVehicle = () => {
    const cleanVehicle = searchVehicle.replace(/\s+/g, '').toUpperCase();
    if (!cleanVehicle) {
      showToast('Please enter a vehicle registration number.');
      return;
    }

    const existing = activeEntries.find(
      item => (item.vehicleNumber || '').replace(/\s+/g, '').toUpperCase() === cleanVehicle
    );
    setVerifiedVehicle(cleanVehicle);
    
    if (existing) {
      setIsNewUser(false);
      setOwnerName(existing.ownerName);
      setEntryType(existing.entryType);
      setRemarks(existing.remarks || '');
      setFormVisible(true);
      showToast('Vehicle found. Ready for exit.');
    } else {
      setIsNewUser(true);
      setOwnerName('');
      setEntryType('Service');
      setRemarks('');
      setFormVisible(true);
      showToast('New vehicle. Please fill in entry details.');
    }
  };

  const handleSubmitEntry = () => {
    if (!ownerName.trim()) {
      showToast('Please enter the owner\'s name.');
      return;
    }

    const newRecord = {
      id: Date.now(),
      vehicleNumber: verifiedVehicle,
      ownerName: ownerName.trim(),
      entryType: entryType,
      entryTime: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }),
      entryDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      remarks: remarks.trim(),
    };

    setActiveEntries(prev => [...prev, newRecord]);
    showToast(`Entry registered successfully for vehicle ${verifiedVehicle}`);
    
    // Reset Form
    setSearchVehicle('');
    setVerifiedVehicle('');
    setFormVisible(false);
  };

  const handleSubmitExit = () => {
    // Remove from active entries
    setActiveEntries(prev => prev.filter(
      item => (item.vehicleNumber || '').replace(/\s+/g, '').toUpperCase() !== verifiedVehicle.replace(/\s+/g, '').toUpperCase()
    ));
    showToast(`Exit registered successfully for vehicle ${verifiedVehicle}`);

    // Reset Form
    setSearchVehicle('');
    setVerifiedVehicle('');
    setFormVisible(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.welcome}>Good day,</Text>
            <Text style={s.staffName}>{currentName}</Text>
          </View>
        </View>

        {/* ── Date strip ── */}
        <View style={s.dateStrip}>
          <Clock size={14} color={COLORS.primary} />
          <Text style={s.dateStripText}>{fmtDate(now)}</Text>
        </View>



        {/* ── Vehicle Entry CTA ── */}
        {/* <TouchableOpacity style={s.entryBtn} onPress={() => navigation.navigate('Entry')}>
          <View style={s.entryIconBox}>
            <PlusSquare color="#fff" size={24} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={s.entryBtnTitle}>VEHICLE ENTRY/EXIT</Text>
            <Text style={s.entryBtnSub}>Record entry or exit</Text>
          </View>
        </TouchableOpacity> */}

        {/* ── Vehicle Search Section ── */}
        <View style={s.sectionHeader}>
          <Car size={16} color={COLORS.secondary} strokeWidth={2.5} />
          <Text style={s.sectionTitle}>Get Vehicle Number</Text>
        </View>

        <View style={s.searchCard}>
          <Text style={s.searchCardLabel}>VEHICLE REGISTRATION NUMBER</Text>
          <View style={s.phoneInputRow}>
            <View style={s.phoneInputWrapper}>
              <Car size={18} color={COLORS.muted} style={s.phoneIcon} />
              <TextInput
                style={s.phoneInput}
                placeholder="e.g. TN58AB1234"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
                value={searchVehicle}
                onChangeText={(text) => {
                  setSearchVehicle(text);
                  if (formVisible && text.toUpperCase() !== verifiedVehicle) {
                    setFormVisible(false);
                  }
                }}
              />
            </View>
            <TouchableOpacity style={s.verifyBtn} onPress={handleSearchVehicle}>
              <Text style={s.verifyBtnText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Conditional Entry/Exit Form ── */}
        {formVisible && (
          <View style={s.formCard}>
            <View style={s.formHeader}>
              <Text style={s.formTitle}>
                {isNewUser ? `NEW REGISTRATION (${verifiedVehicle})` : `VEHICLE PROFILE (${verifiedVehicle})`}
              </Text>
              <View style={[s.badge, { backgroundColor: isNewUser ? '#DCFCE7' : '#FEF3C7' }]}>
                <Text style={[s.badgeText, { color: isNewUser ? '#15803D' : '#D97706' }]}>
                  {isNewUser ? 'NEW USER' : 'ACTIVE VISITOR'}
                </Text>
              </View>
            </View>

            {isNewUser ? (
              /* NEW USER FORM */
              <View style={s.formFields}>
                <View style={s.dtRow}>
                  <View style={s.dtItem}>
                    <Text style={s.dtLabel}>Today Date</Text>
                    <Text style={s.dtValue}>
                      {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={s.dtDivider} />
                  <View style={s.dtItem}>
                    <Text style={s.dtLabel}>Today Time</Text>
                    <Text style={[s.dtValue, { color: COLORS.primary }]}>
                      {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                  </View>
                </View>

                <Text style={s.fieldLabel}>Owner Name</Text>
                <View style={[s.inputContainer, { marginBottom: 14 }]}>
                  <User size={16} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.textInputStyle}
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="Enter owner's name"
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

                <Text style={s.fieldLabel}>Remarks (Optional)</Text>
                <View style={[s.inputContainer, { marginBottom: 18 }]}>
                  <FileText size={16} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.textInputStyle}
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Any specific comments"
                    placeholderTextColor={COLORS.muted}
                  />
                </View>

                <TouchableOpacity style={s.submitBtn} onPress={handleSubmitEntry}>
                  <Text style={s.submitBtnText}>SUBMIT ENTRY</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* EXISTING USER DETAILS (NON-EDITABLE) */
              <View style={s.formFields}>
                <Text style={s.fieldLabel}>Owner Name</Text>
                <View style={s.nonEditableContainer}>
                  <User size={16} color={COLORS.muted} style={s.inputIcon} />
                  <Text style={s.nonEditableText}>{ownerName}</Text>
                </View>

                <Text style={s.fieldLabel}>Entry Type</Text>
                <View style={s.nonEditableContainer}>
                  <Text style={s.nonEditableText}>{entryType}</Text>
                </View>

                <Text style={s.fieldLabel}>Remarks</Text>
                <View style={s.nonEditableContainer}>
                  <FileText size={16} color={COLORS.muted} style={s.inputIcon} />
                  <Text style={s.nonEditableText}>{remarks || 'No remarks provided'}</Text>
                </View>

                <View style={s.dtRow}>
                  <View style={s.dtItem}>
                    <Text style={s.dtLabel}>Entry Date</Text>
                    <Text style={s.dtValue}>
                      {activeEntries.find(item => (item.vehicleNumber || '').replace(/\s+/g, '').toUpperCase() === verifiedVehicle)?.entryDate || 'N/A'}
                    </Text>
                  </View>
                  <View style={s.dtDivider} />
                  <View style={s.dtItem}>
                    <Text style={s.dtLabel}>Entry Time</Text>
                    <Text style={[s.dtValue, { color: COLORS.primary }]}>
                      {activeEntries.find(item => (item.vehicleNumber || '').replace(/\s+/g, '').toUpperCase() === verifiedVehicle)?.entryTime || 'N/A'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#EF4444' }]} onPress={handleSubmitExit}>
                  <Text style={s.submitBtnText}>SUBMIT EXIT</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },

  header:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  welcome:    { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.medium },
  staffName:  { color: COLORS.secondary, fontSize: 18, fontFamily: FONTS.bold },

  dateStrip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 16 },
  dateStripText: { color: COLORS.primary, fontSize: 12, fontFamily: FONTS.semiBold },

  /* KPI */
  kpiRow:  { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderLeftWidth: 4, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderTopColor: COLORS.border, borderRightColor: COLORS.border, borderBottomColor: COLORS.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  kpiValue:{ color: COLORS.primary, fontSize: 26, fontFamily: FONTS.bold },
  kpiLabel:{ color: COLORS.muted, fontSize: 10, fontFamily: FONTS.semiBold },

  /* Entry CTA */
  entryBtn:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18, marginBottom: 24, elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  entryIconBox:  { width: 46, height: 46, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  entryBtnTitle: { color: '#fff', fontSize: 15, letterSpacing: 0.5, fontFamily: FONTS.bold },
  entryBtnSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2, fontFamily: FONTS.medium },

  /* Section */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle:  { color: COLORS.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONTS.bold },

  /* Search Card */
  searchCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  searchCardLabel: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.bold, letterSpacing: 0.5, marginBottom: 8 },
  phoneInputRow: { flexDirection: 'row', gap: 10 },
  phoneInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.background, paddingHorizontal: 12 },
  phoneIcon: { marginRight: 8 },
  phoneInput: { flex: 1, fontSize: 15, color: COLORS.secondary, fontFamily: FONTS.medium, paddingVertical: 8 },
  verifyBtn: { backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  verifyBtnText: { color: '#fff', fontSize: 13, fontFamily: FONTS.bold, letterSpacing: 0.5 },

  /* Form Card */
  formCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 20 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12, marginBottom: 16 },
  formTitle: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.bold, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontFamily: FONTS.bold },
  formFields: { gap: 12 },

  /* Input fields */
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.semiBold, marginBottom: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.background, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  textInputStyle: { flex: 1, color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.medium, paddingVertical: 9 },

  /* Type selector */
  typeSelectorRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 12 },
  typeChip: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  typeChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  typeChipText: { fontSize: 12, color: COLORS.muted, fontFamily: FONTS.semiBold },
  typeChipTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },

  /* Date / Time Row */
  dtRow: { flexDirection: 'row', backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderHeight: 1, borderColor: '#BAE6FD', borderWidth: 1, marginBottom: 12 },
  dtItem: { flex: 1, alignItems: 'center' },
  dtDivider: { width: 1, backgroundColor: '#BAE6FD' },
  dtLabel: { color: '#0369A1', fontSize: 10, fontFamily: FONTS.bold, marginBottom: 2 },
  dtValue: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.bold },

  /* Non-editable container */
  nonEditableContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  nonEditableText: { fontSize: 14, color: COLORS.muted, fontFamily: FONTS.medium },

  /* Button */
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold, letterSpacing: 0.5 },
});

