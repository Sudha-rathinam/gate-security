import { StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 250, height: 250, marginBottom: 20 },
  title: { color: COLORS.secondary, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: COLORS.text, fontSize: 14, textAlign: 'center', marginBottom: 16, paddingHorizontal: 32 },
  version: { color: COLORS.secondary, fontSize: 12, marginTop: 8 },
});
