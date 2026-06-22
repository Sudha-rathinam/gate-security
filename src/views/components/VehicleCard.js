/**
 * Premium compact vehicle summary card for lists and search results.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import { Car, User, Clock, ChevronRight } from 'lucide-react-native';

export default function VehicleCard({ vehicleNumber, owner, status, entryType, meta }) {
  const isEntry = status === 'Inside' || status === 'Entry';
  const accentColor = isEntry ? COLORS.success : COLORS.warning;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.leftContent}>
        {/* Top Row: Plate Number + Entry Type Badge */}
        <View style={styles.headerRow}>
          <View style={styles.plateRow}>
            <Car size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
          </View>
          {entryType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{entryType.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Owner Info Row */}
        <View style={styles.infoRow}>
          <User size={13} color={COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={styles.ownerText}>{owner}</Text>
        </View>

        {/* Timestamp Info Row */}
        <View style={styles.infoRow}>
          <Clock size={13} color={COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={styles.metaText}>{meta}</Text>
        </View>
      </View>

      {/* Right chevron indicator */}
      <View style={styles.chevronWrap}>
        <ChevronRight size={18} color={COLORS.muted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leftContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleNumber: {
    color: COLORS.secondary,
    fontSize: 15,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ownerText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
  },
  typeBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  chevronWrap: {
    marginLeft: 12,
  },
});
