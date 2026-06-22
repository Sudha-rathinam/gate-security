import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../config/theme';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  fixedHeader: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, backgroundColor: COLORS.background },
  scrollContainer: { paddingHorizontal: 14, paddingBottom: 24 },
  title: { color: COLORS.secondary, fontSize: 20, fontFamily: FONTS.bold },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1.5, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  searchInput: { flex: 1, color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.medium, paddingVertical: 0 },
  searchIconSymbol: { fontSize: 16, marginLeft: 6 },
  calendarBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  listSection: { marginTop: 16 },
  sectionTitle: { color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.bold, marginBottom: 8 },
});
