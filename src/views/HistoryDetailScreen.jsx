/**
 * Detailed view for a single vehicle history record.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { ArrowLeft, Car, User, Clock, CheckCircle, AlertCircle, Wrench, FileText } from 'lucide-react-native';
import { COLORS, FONTS } from '../config/theme';
import { showToast } from '../utils/toast';

export default function HistoryDetailScreen({ route, navigation }) {
  const { vehicleNumber, owner, status, entryType, meta } = route.params;
  const isFocused = useIsFocused();

  const isCompleted = status === 'Completed' || status === 'Exit';

  const statusColor = isCompleted ? '#22C55E' : '#F59E0B';
  const statusBg = isCompleted ? '#ECFDF5' : '#FEF3C7';
  const StatusIcon = isCompleted ? CheckCircle : AlertCircle;

  // Parse entry / exit from meta string (e.g. "Entered 08:45 AM • Exited 04:10 PM")
  const entryMatch = meta?.match(/Entered\s([\d:]+\s[AP]M)/i);
  const exitMatch = meta?.match(/Exited\s([\d:]+\s[AP]M)/i);
  
  const now = new Date();
  const currentTodayDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTodayTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const todayDateTime = `${currentTodayDate} • ${currentTodayTime}`;

  const isEntryPhase = status === 'Entry' || status === 'Inside' || status === 'Pending';

  const todayStr = "19 Jun 2026";
  const entryDateTime = entryMatch ? `${todayStr} • ${entryMatch[1]}` : '—';
  const exitDateTime = isEntryPhase ? todayDateTime : (exitMatch ? `${todayStr} • ${exitMatch[1]}` : '—');

  return (
    <SafeAreaView style={styles.safe}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.vehiclePlate}>
              <Car size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.plateText}>{vehicleNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <StatusIcon size={13} color={statusColor} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.ownerName}>{owner}</Text>
          {/* <Text style={styles.metaText}>{meta}</Text> */}
        </View>

        {/* Info rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <InfoRow icon={<Car size={16} color={COLORS.primary} />}
            label="Registration No." value={vehicleNumber} />
          <InfoRow icon={<User size={16} color={COLORS.primary} />}
            label="Owner" value={owner} />
          {entryType && (
            <InfoRow icon={<Wrench size={16} color={COLORS.primary} />}
              label="Entry Type" value={entryType} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log History</Text>

          <InfoRow icon={<Clock size={16} color={COLORS.success} />}
            label="Entry Date & Time" value={entryDateTime} />
          <InfoRow icon={<Clock size={16} color={COLORS.warning} />}
            label="Exit Date & Time" value={exitDateTime} />
        </View>

        {isEntryPhase && (
          <TouchableOpacity
            style={styles.submitExitBtn}
            onPress={() => {
              showToast(`Vehicle ${vehicleNumber} exit recorded successfully.`);
              navigation.goBack();
            }}
          >
            <Text style={styles.submitExitBtnText}>SUBMIT EXIT</Text>
          </TouchableOpacity>
        )}

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <InfoRow icon={<Wrench size={16} color={COLORS.primary} />}
            label="Service Type" value="General Inspection" />
          <InfoRow icon={<FileText size={16} color={COLORS.primary} />}
            label="Remarks" value="No visible damage reported." />
        </View> */}

        {/* Status timeline */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <TimelineStep done label="Vehicle Arrived" time={entryTime} />
          <TimelineStep done label="Inspection Done" time="10:30 AM" />
          <TimelineStep done={isCompleted} label="Work Completed" time={isCompleted ? exitTime : '—'} />
          <TimelineStep done={isCompleted} label="Vehicle Exited" time={isCompleted ? exitTime : 'Pending'} last />
        </View> */}

        {/* <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>← Back to History</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Sub-components ──────────────────────────────────── */

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineStep({ done, label, time, last }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, done && styles.timelineDotDone]} />
        {!last && <View style={[styles.timelineLine, done && styles.timelineLineDone]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{label}</Text>
        <Text style={styles.timelineTime}>{time}</Text>
      </View>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.secondary, fontSize: 16, fontFamily: FONTS.bold },

  container: { padding: 14, paddingBottom: 32 },

  /* Hero */
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  vehiclePlate: { flexDirection: 'row', alignItems: 'center' },
  plateText: { color: COLORS.primary, fontSize: 18, fontFamily: FONTS.bold, letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontFamily: FONTS.bold },
  ownerName: { color: COLORS.secondary, fontSize: 15, fontFamily: FONTS.bold, marginBottom: 4 },
  metaText: { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.medium },

  /* Section */
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.bold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Info row */
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  infoLabel: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.medium, marginBottom: 2 },
  infoValue: { color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.bold },

  /* Timeline */
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border, borderWidth: 2, borderColor: COLORS.border, marginTop: 2 },
  timelineDotDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  timelineLineDone: { backgroundColor: COLORS.primary },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 14 },
  timelineLabel: { color: COLORS.muted, fontSize: 13, fontFamily: FONTS.bold },
  timelineLabelDone: { color: COLORS.secondary },
  timelineTime: { color: COLORS.muted, fontSize: 11, marginTop: 2, fontFamily: FONTS.regular },

  /* Back button */
  goBackBtn: { alignItems: 'center', paddingVertical: 14 },
  goBackText: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.bold },
  submitExitBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitExitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
});
