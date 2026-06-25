import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { ArrowLeft, Car, Clock, CheckCircle, AlertCircle, Wrench, Phone } from 'lucide-react-native';
import { COLORS, FONTS } from '../config/theme';
import { showToast } from '../utils/toast';
import { base_url, exit } from '../config/constant';
import axios from 'axios';
import { retrieveEncryptedData } from '../config/storage';

export default function HistoryDetailScreen({ route, navigation }) {
  const { vehicleNumber, whatsappNumber, status, entryType, meta, date, rawItem } = route.params;
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);

  const isCompleted = status === 'Completed' || status === 'Exit';

  const statusColor = isCompleted ? '#22C55E' : '#F59E0B';
  const statusBg = isCompleted ? '#ECFDF5' : '#FEF3C7';
  const StatusIcon = isCompleted ? CheckCircle : AlertCircle;

  // Parse entry / exit from meta string (e.g. "Entered 08:45 AM • Exited 04:10 PM")
  const entryMatch = meta?.match(/Entered\s([\d:]+\s[AP]M)/i);
  const exitMatch = meta?.match(/Exited\s([\d:]+\s[AP]M)/i);

  const recordDate = date || '';
  const entryDateTime = entryMatch ? (recordDate ? `${recordDate} • ${entryMatch[1]}` : entryMatch[1]) : '-';
  const exitDateTime = exitMatch ? (recordDate ? `${recordDate} • ${exitMatch[1]}` : exitMatch[1]) : '-';

  const isEntryPhase = status === 'Entry' || status === 'Inside' || status === 'Pending';

  const handleSubmitExit = async () => {
    setLoading(true);
    try {
      const token = await retrieveEncryptedData('token');
      let gateEntryId = rawItem?.id || rawItem?._id;

      if (!gateEntryId) {
        showToast('No active gate entry found to exit.');
        return;
      }

      const response = await axios.put(`${base_url}${exit}/${gateEntryId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        showToast(`Exit registered successfully for vehicle ${vehicleNumber}`);
        navigation.goBack();
      } else {
        showToast(response.data?.message || 'Failed to submit exit.');
      }
    } catch (error) {
      showToast('Failed to submit exit.');
      console.error('Submit Exit API error:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.ownerName}>{whatsappNumber}</Text>
          {/* <Text style={styles.metaText}>{meta}</Text> */}
        </View>

        {/* Info rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <InfoRow icon={<Car size={16} color={COLORS.primary} />}
            label="Registration No." value={vehicleNumber} />
          <InfoRow icon={<Phone size={16} color={COLORS.primary} />}
            label="WhatsApp Number" value={whatsappNumber} />
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
            style={[styles.submitExitBtn, loading && { opacity: 0.8 }]}
            onPress={handleSubmitExit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitExitBtnText}>SUBMIT EXIT</Text>
            )}
          </TouchableOpacity>
        )}
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
