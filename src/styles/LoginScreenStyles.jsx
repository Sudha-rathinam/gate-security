import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../config/theme';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: -28,
    right: -28,
    height: 200,
  },
  lottieContainer: {
    position: 'absolute',
    top: 145,
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  lottie: {
    width: 250,
    height: 160,
  },
  formContainer: {
    marginTop: 270,
  },
  titleContainer: {
    marginBottom: 28,
  },
  title: { color: COLORS.secondary, fontSize: 32, fontFamily: FONTS.bold },
  titleUnderline: { width: 50, height: 4, backgroundColor: COLORS.primary, marginTop: 6, borderRadius: 2 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontFamily: FONTS.semiBold, textAlign: 'right', marginTop: 4, marginBottom: 24 },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: { color: COLORS.muted, fontSize: 13, fontFamily: FONTS.regular },
  footerLink: { color: COLORS.primary, fontSize: 13, fontFamily: FONTS.bold },
});
