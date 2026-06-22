/**
 * Home dashboard — overview of today's vehicle entries only.
 * No tabs. Shows KPIs and entry activity feed.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardCard from './components/DashboardCard';
import { COLORS } from '../config/theme';
import { PlusSquare, Car, User, Clock } from 'lucide-react-native';

/* ──────────────────────────────────────────────────────
   MOCK DATA — only entry records
────────────────────────────────────────────────────── */
const entryRecords = [
  { id: 1, vehicleNumber: 'TN58AB1234', owner: 'Amit Sharma',  time: '08:45 AM', model: 'Honda City',     status: 'Ready' },
  { id: 2, vehicleNumber: 'TN58CA5678', owner: 'John Doe',     time: '10:15 AM', model: 'Maruti Swift',   status: 'In Service' },
  { id: 3, vehicleNumber: 'TN58MN4321', owner: 'Naina Rao',   time: '10:30 AM', model: 'Toyota Innova',  status: 'Pending' },
  { id: 4, vehicleNumber: 'TN58EG1212', owner: 'S. Reddy',    time: '11:00 AM', model: 'Hyundai Creta',  status: 'Pending' },
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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const readyCount     = entryRecords.filter(r => r.status === 'Ready').length;
  const inServiceCount = entryRecords.filter(r => r.status === 'In Service').length;
  const pendingCount   = entryRecords.filter(r => r.status === 'Pending').length;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.avatar}><Text style={s.avatarText}>GS</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.welcome}>Good day,</Text>
            <Text style={s.staffName}>Gate Supervisor</Text>
          </View>
        </View>

        {/* ── Date strip ── */}
        <View style={s.dateStrip}>
          <Clock size={14} color={COLORS.primary} />
          <Text style={s.dateStripText}>{fmtDate(now)}</Text>
        </View>

        {/* ── KPI cards ── */}
        <View style={s.kpiRow}>
          <View style={[s.kpiCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={s.kpiValue}>{entryRecords.length}</Text>
            <Text style={s.kpiLabel}>Total Entries</Text>
          </View>
          <View style={[s.kpiCard, { borderLeftColor: '#22C55E' }]}>
            <Text style={[s.kpiValue, { color: '#15803D' }]}>{readyCount}</Text>
            <Text style={s.kpiLabel}>Ready</Text>
          </View>
          <View style={[s.kpiCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={[s.kpiValue, { color: '#92400E' }]}>{pendingCount}</Text>
            <Text style={s.kpiLabel}>Pending</Text>
          </View>
        </View>

        {/* ── Vehicle Entry button ── */}
        <TouchableOpacity style={s.entryBtn} onPress={() => navigation.navigate('Entry')}>
          <View style={s.entryIconBox}>
            <PlusSquare color="#fff" size={26} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={s.entryBtnTitle}>VEHICLE ENTRY</Text>
            <Text style={s.entryBtnSub}>Register new arrival</Text>
          </View>
        </TouchableOpacity>

        {/* ── Today's entry list ── */}
        <Text style={s.sectionTitle}>Today's Vehicle Entries</Text>

        {entryRecords.map(item => (
          <View key={item.id} style={s.card}>
            {/* Plate + status */}
            <View style={s.cardTop}>
              <View style={s.plateRow}>
                <Car size={15} color={COLORS.primary} />
                <Text style={s.plateText}>{item.vehicleNumber}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: statusBg(item.status) }]}>
                <Text style={[s.statusText, { color: statusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Owner + model */}
            <View style={s.cardMeta}>
              <View style={s.metaItem}>
                <User size={12} color={COLORS.muted} />
                <Text style={s.metaText}>{item.owner}</Text>
              </View>
              <View style={s.metaItem}>
                <Car size={12} color={COLORS.muted} />
                <Text style={s.metaText}>{item.model}</Text>
              </View>
            </View>

            {/* Entry time */}
            <View style={s.timeRow}>
              <Clock size={12} color={COLORS.muted} />
              <Text style={s.timeText}>Entered at {item.time}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────
   STYLES
────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 36 },

  /* Header */
  header:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  welcome:    { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  staffName:  { color: COLORS.secondary, fontSize: 18, fontWeight: '800' },

  /* Date strip */
  dateStrip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 16 },
  dateStripText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  /* KPI row */
  kpiRow:  { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderLeftWidth: 4, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderTopColor: COLORS.border, borderRightColor: COLORS.border, borderBottomColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  kpiValue:{ color: COLORS.primary, fontSize: 26, fontWeight: '900' },
  kpiLabel:{ color: COLORS.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },

  /* Entry CTA button */
  entryBtn:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 24, elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  entryIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  entryBtnTitle:{ color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  entryBtnSub:  { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 2 },

  /* Section title */
  sectionTitle: { color: COLORS.secondary, fontSize: 14, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Entry card */
  card:       { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  plateRow:   { flexDirection: 'row', alignItems: 'center', gap: 7 },
  plateText:  { color: COLORS.primary, fontSize: 16, fontWeight: '900', letterSpacing: 1.2 },
  statusBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardMeta:   { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:   { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  timeRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  timeText:   { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
});
