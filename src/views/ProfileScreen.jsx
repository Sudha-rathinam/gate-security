/**
 * Profile screen — enhanced UI with stats, gradient header, and polished menu.
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import {
  User, LogOut, ChevronRight, Bell,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../config/theme';
import { getUserName, getInitials } from '../utils/userState';

/* ──────────────────────────────────────────────────────
   MENU ITEM ROW
────────────────────────────────────────────────────── */
function MenuItem({ icon: Icon, label, iconBg, iconColor, onPress, danger, last }) {
  return (
    <TouchableOpacity style={[s.menuItem, last && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.menuIcon, { backgroundColor: iconBg || '#EFF6FF' }]}>
        <Icon size={18} color={iconColor || COLORS.primary} strokeWidth={2.2} />
      </View>
      <Text style={[s.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      <ChevronRight size={16} color={danger ? '#FCA5A5' : COLORS.muted} />
    </TouchableOpacity>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function ProfileScreen({ navigation }) {
  const isFocused = useIsFocused();
  const currentName = getUserName();
  const initials = getInitials(currentName);

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
      {isFocused && <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Blue gradient header band ── */}
        <View style={s.headerBand}>
          <Text style={s.headerTitle}>My Profile</Text>

          {/* Avatar + name */}
          <View style={s.profileRow}>
            <View style={s.avatarWrap}>
              <Text style={s.avatarText}>{initials}</Text>
              <View style={s.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.nameText}>{currentName}</Text>
              <Text style={s.idText}>Employee ID: V360-1042</Text>
              <View style={s.activeBadge}>
                <View style={s.activeDot} />
                <Text style={s.activeBadgeText}>Active Duty</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.body}>
          {/* ── Account Settings ── */}
          <Text style={s.sectionTitle}>Account Settings</Text>
          <View style={s.menuCard}>
            <MenuItem icon={User} label="Personal Details" iconBg="#EFF6FF" iconColor={COLORS.primary} />
            <MenuItem icon={Bell} label="Notifications" iconBg="#FFF7ED" iconColor="#EA580C" />
            <MenuItem icon={LogOut} label="Logout Session" iconBg="#FEF2F2" iconColor="#EF4444" danger last onPress={() => navigation.replace('Login')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────
   STYLES
────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* ── Header band ── */
  headerBand: {
    backgroundColor: COLORS.primary,
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: FONTS.bold, marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  avatarWrap: { width: 80, height: 80, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  avatarText: { color: COLORS.primary, fontSize: 26, fontFamily: FONTS.bold },
  onlineDot: { position: 'absolute', bottom: -3, right: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22C55E', borderWidth: 3, borderColor: '#fff' },

  nameText: { color: '#fff', fontSize: 20, fontFamily: FONTS.bold },
  idText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3, fontFamily: FONTS.medium },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  activeBadgeText: { color: '#fff', fontSize: 10, textTransform: 'uppercase', fontFamily: FONTS.bold },

  /* ── Body ── */
  body: { padding: 20, paddingTop: 24 },

  /* Section title */
  sectionTitle: { color: COLORS.secondary, fontSize: 12, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 2 },

  /* Menu card */
  menuCard: { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 22, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.semiBold },

  /* Version */
  versionText: { textAlign: 'center', color: COLORS.muted, fontSize: 11, fontFamily: FONTS.medium, marginTop: 10, marginBottom: 32 },
});
