/**
 * Home dashboard — KPI cards (tappable) + Recent Activity feed.
 * Clicking "Today Entries" or "Today Exits" navigates to TodayListScreen.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, FONTS } from '../config/theme';
import { PlusSquare, Car, User, Clock, LogOut, LogIn, Activity, ChevronRight } from 'lucide-react-native';
import { getUserName, getInitials } from '../utils/userState';

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

/* Recent activity = merge entries + exits, sorted by time desc */
const recentActivity = [
  { id: 'e1', type: 'entry', vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma', entryType: 'Service', time: '08:45 AM' },
  { id: 'e2', type: 'entry', vehicleNumber: 'TN58CA5678', owner: 'John Doe',    entryType: 'Pickup',  time: '10:15 AM' },
  { id: 'x1', type: 'exit',  vehicleNumber: 'TN58CA5678', owner: 'Ravi Patel',  entryType: 'Service', time: '01:30 PM' },
  { id: 'e3', type: 'entry', vehicleNumber: 'TN58MN4321', owner: 'Naina Rao',  entryType: 'Service', time: '10:30 AM' },
  { id: 'x2', type: 'exit',  vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma', entryType: 'Service', time: '04:10 PM' },
];

/* ──────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────── */
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}
function statusColor(s) {
  if (s === 'Ready')      return '#15803D';
  if (s === 'In Service') return '#1D4ED8';
  return '#92400E';
}
function statusBg(s) {
  if (s === 'Ready')      return '#DCFCE7';
  if (s === 'In Service') return '#DBEAFE';
  return '#FEF3C7';
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function HomeScreen({ navigation }) {
  const [now, setNow] = useState(new Date());
  const isFocused = useIsFocused();
  
  const currentName = getUserName();
  const initials = getInitials(currentName);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

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

        {/* ── KPI row — tappable ── */}
        <View style={s.kpiRow}>
          <TouchableOpacity
            style={[s.kpiCard, { borderLeftColor: COLORS.primary }]}
            onPress={() => navigation.navigate('TodayList', { type: 'entry' })}
            activeOpacity={0.75}
          >
            <View style={s.kpiHeader}>
              <Text style={s.kpiValue}>{entryRecords.length}</Text>
              <View style={[s.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                <LogIn size={16} color={COLORS.primary} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={s.kpiLabel}>Today Entries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.kpiCard, { borderLeftColor: '#F97316' }]}
            onPress={() => navigation.navigate('TodayList', { type: 'exit' })}
            activeOpacity={0.75}
          >
            <View style={s.kpiHeader}>
              <Text style={[s.kpiValue, { color: '#C2410C' }]}>{exitRecords.length}</Text>
              <View style={[s.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                <LogOut size={16} color="#F97316" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={s.kpiLabel}>Today Exits</Text>
          </TouchableOpacity>
        </View>

        {/* ── Vehicle Entry CTA ── */}
        <TouchableOpacity style={s.entryBtn} onPress={() => navigation.navigate('Entry')}>
          <View style={s.entryIconBox}>
            <PlusSquare color="#fff" size={24} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={s.entryBtnTitle}>VEHICLE ENTRY/EXIT</Text>
            <Text style={s.entryBtnSub}>Record entry or exit</Text>
          </View>
        </TouchableOpacity>

        {/* ── Recent Activity ── */}
        <View style={s.sectionHeader}>
          <Activity size={16} color={COLORS.secondary} strokeWidth={2.5} />
          <Text style={s.sectionTitle}>Recent Activity</Text>
        </View>

        {recentActivity.slice(0, 4).map(item => {
          const isEntry = item.type === 'entry';
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => {
                navigation.navigate('HistoryDetail', {
                  vehicleNumber: item.vehicleNumber,
                  owner: item.owner,
                  status: isEntry ? 'Entry' : 'Exit',
                  entryType: item.entryType,
                  meta: isEntry ? `Entered ${item.time}` : `Exited ${item.time}`,
                });
              }}
            >
              <View style={[s.actCard, { borderLeftColor: isEntry ? COLORS.success : COLORS.warning }]}>
                {/* type badge */}
                <View style={[s.typeBadge, { backgroundColor: isEntry ? '#EFF6FF' : '#FEF2F2' }]}>
                  {isEntry ? (
                    <LogIn size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : (
                    <LogOut size={16} color="#EF4444" strokeWidth={2.5} />
                  )}
                </View>

                {/* info */}
                <View style={{ flex: 1 }}>
                  <View style={s.actTop}>
                    <Text style={[s.actPlate, { color: isEntry ? COLORS.success : '#C2410C' }]}>
                      {item.vehicleNumber}
                    </Text>
                    <View style={[s.statusBadge, { backgroundColor: isEntry ? '#ECFDF5' : '#FFF7ED' }]}>
                      <Text style={[s.statusText, { color: isEntry ? COLORS.success : '#C2410C' }]}>
                        {isEntry ? 'ENTRY' : 'EXIT'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.actOwner}>{item.owner} • {item.entryType}</Text>
                  <View style={s.actTimeRow}>
                    <Clock size={11} color={COLORS.muted} />
                    <Text style={s.actTime}>
                      {isEntry ? `Entered at ${item.time}` : `Exited at ${item.time}`}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

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
  sectionDot:    { width: 8, height: 8, borderRadius: 4 },
  sectionTitle:  { color: COLORS.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONTS.bold },

  /* Activity card */
  actCard:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 9, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, gap: 12 },
  typeBadge:   { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeIcon:    { fontSize: 17 },
  actTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  actPlate:    { fontSize: 14, letterSpacing: 1, fontFamily: FONTS.bold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusText:  { fontSize: 9, fontFamily: FONTS.bold },
  actOwner:    { color: COLORS.muted, fontSize: 12, marginBottom: 4, fontFamily: FONTS.medium },
  actTimeRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actTime:     { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.regular },
});
