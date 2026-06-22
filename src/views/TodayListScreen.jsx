/**
 * TodayListScreen — shows full list of today's entries OR exits.
 * Receives `type` ('entry' | 'exit') via route.params.
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { ArrowLeft, Car, User, Clock, LogOut } from 'lucide-react-native';
import { COLORS, FONTS } from '../config/theme';
import { entryRecords, exitRecords } from './HomeScreen';

/* ──────────────────────────────────────────────────────
   ROW COMPONENT
────────────────────────────────────────────────────── */
function VehicleRow({ item, isEntry, onPress }) {
  return (
    <TouchableOpacity
      style={[s.card, { borderLeftColor: isEntry ? COLORS.primary : '#F97316' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Top: plate + status */}
      <View style={s.cardTop}>
        <View style={s.plateRow}>
          <Car size={15} color={isEntry ? COLORS.primary : '#F97316'} />
          <Text style={[s.plateText, { color: isEntry ? COLORS.primary : '#C2410C' }]}>
            {item.vehicleNumber}
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#BAE6FD', borderWidth: 0.5 }]}>
          <Text style={[s.statusText, { color: COLORS.primary }]}>
            {(item.entryType || 'Service').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Meta: owner + model */}
      <View style={s.metaRow}>
        <View style={s.metaItem}>
          <User size={12} color={COLORS.muted} />
          <Text style={s.metaText}>{item.owner}</Text>
        </View>
        <View style={s.metaItem}>
          <Car size={12} color={COLORS.muted} />
          <Text style={s.metaText}>{item.model}</Text>
        </View>
      </View>

      {/* Time */}
      <View style={s.timeRow}>
        <Clock size={12} color={COLORS.muted} />
        <Text style={s.timeText}>
          {isEntry ? `Entered at ${item.entryTime}` : `Exited at ${item.exitTime}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function TodayListScreen({ route, navigation }) {
  const { type } = route.params;   // 'entry' | 'exit'
  const isEntry = type === 'entry';
  const records = isEntry ? entryRecords : exitRecords;
  const isFocused = useIsFocused();

  const accentColor = isEntry ? COLORS.primary : '#F97316';
  const title = isEntry ? "Today's Entries" : "Today's Exits";

  return (
    <SafeAreaView style={s.safe}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}

      {/* ── Header bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.topBarTitle}>{title}</Text>
          <Text style={s.topBarSub}>{records.length} record{records.length !== 1 ? 's' : ''} today</Text>
        </View>
        {/* <View style={[s.countBadge, { backgroundColor: isEntry ? '#EFF6FF' : '#FFF7ED' }]}>
          <Text style={[s.countBadgeText, { color: accentColor }]}>{records.length}</Text>
        </View> */}
      </View>

      {/* ── Accent bar ── */}
      <View style={[s.accentBar, { backgroundColor: accentColor }]} />

      {/* ── List ── */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {records.length === 0 ? (
          <View style={s.emptyBox}>
            <LogOut size={28} color={COLORS.muted} />
            <Text style={s.emptyTitle}>No records yet</Text>
            <Text style={s.emptyText}>
              {isEntry
                ? 'No vehicle entries recorded for today.'
                : 'No vehicle exits recorded for today.'}
            </Text>
          </View>
        ) : (
          records.map(item => (
            <VehicleRow
              key={item.id}
              item={item}
              isEntry={isEntry}
              onPress={() => {
                navigation.navigate('HistoryDetail', {
                  vehicleNumber: item.vehicleNumber,
                  owner: item.owner,
                  status: isEntry ? 'Entry' : 'Exit',
                  entryType: item.entryType,
                  meta: isEntry ? `Entered ${item.entryTime}` : `Exited ${item.exitTime}`,
                });
              }}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────
   STYLES
────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 36 },

  /* Top bar */
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { color: COLORS.secondary, fontSize: 16, fontFamily: FONTS.bold },
  topBarSub: { color: COLORS.muted, fontSize: 11, marginTop: 1, fontFamily: FONTS.medium },
  countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  countBadgeText: { fontSize: 16, fontWeight: '900' },

  /* Accent line */
  accentBar: { height: 3, width: '100%' },

  /* Card */
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  plateText: { fontSize: 16, letterSpacing: 1.2, fontFamily: FONTS.bold },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 10, fontFamily: FONTS.bold },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.medium },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  timeText: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.regular },

  /* Empty */
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { color: COLORS.secondary, fontSize: 16, fontWeight: '800', marginTop: 6 },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
