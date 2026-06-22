import { StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 16, paddingBottom: 28 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 14 },
  title: { color: COLORS.secondary, fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  label: { color: COLORS.secondary, fontSize: 13, fontWeight: '700' },
  value: { color: COLORS.muted, fontSize: 13 },
});
