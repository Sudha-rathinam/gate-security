import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, TextInput,
  KeyboardAvoidingView, Platform, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, FONTS } from '../config/theme';
import { Car, Phone, FileText } from 'lucide-react-native';
import { retrieveEncryptedData, getInitials } from '../config/storage';
import { showToast } from '../utils/toast';
import axios from 'axios';
import { check_vehicle, base_url, submit_entry, exit } from '../config/constant';

function formatApiDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

function formatApiTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return '';
  }
}

export default function HomeScreen({ navigation }) {
  const [now, setNow] = useState(new Date());
  const isFocused = useIsFocused();

  const [currentName, setCurrentName] = useState('');
  const initials = getInitials(currentName);



  const [searchVehicle, setSearchVehicle] = useState('');
  const [verifiedVehicle, setVerifiedVehicle] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [entryType, setEntryType] = useState('Service');
  const [remarks, setRemarks] = useState('');
  const [activeGateEntry, setActiveGateEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const userStr = await retrieveEncryptedData('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.fullName) {
            setCurrentName(userObj.fullName);
            return;
          }
        } catch (e) {
          console.error('Failed to parse user object:', e);
        }
      }
      const name = await retrieveEncryptedData('fullName');
      setCurrentName(name || 'Bala');
    } catch (error) {
      console.error('Failed to load home data:', error);
      setCurrentName('Bala');
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleSearchVehicle = async () => {
    const cleanVehicle = searchVehicle.replace(/\s+/g, '').toUpperCase();
    if (!cleanVehicle) {
      showToast('Please enter a vehicle registration number.');
      return;
    }

    setVerifiedVehicle(cleanVehicle);
    setLoading(true);
    try {
      const token = await retrieveEncryptedData('token');
      const response = await axios.get(`${base_url}${check_vehicle}?registrationNumber=${cleanVehicle}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = response.data;

      if (result.success && result.data) {
        const vehicleData = result.data;
        if (vehicleData.isExistingVehicle) {
          setIsNewUser(false);
          const mobile = vehicleData.customer?.mobileNo || vehicleData.whatsappNumber || '';
          setWhatsappNumber(mobile);
          const activeEntry = vehicleData.activeGateEntry || {};
          const type = activeEntry.entryType || vehicleData.entryType || 'Service';
          const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
          setEntryType(capitalizedType);
          setRemarks(activeEntry.remarks || vehicleData.remarks || '');
          setActiveGateEntry(activeEntry);
          setFormVisible(true);
          showToast('Vehicle found. Ready for exit.');
        } else {
          setIsNewUser(true);
          setWhatsappNumber('');
          setEntryType('Service');
          setRemarks('');
          setActiveGateEntry(null);
          setFormVisible(true);
          showToast('New vehicle. Please fill in entry details.');
        }
      } else {
        setIsNewUser(true);
        setWhatsappNumber('');
        setEntryType('Service');
        setRemarks('');
        setActiveGateEntry(null);
        setFormVisible(true);
        showToast('New vehicle. Please fill in entry details.');
      }
    } catch (error) {
      console.error('Check vehicle API error:', error);
      setIsNewUser(true);
      setWhatsappNumber('');
      setEntryType('Service');
      setRemarks('');
      setActiveGateEntry(null);
      setFormVisible(true);
      showToast('Check vehicle failed or not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEntry = async () => {
    if (!whatsappNumber.trim()) {
      showToast('Please enter the WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const token = await retrieveEncryptedData('token');
      const response = await axios.post(`${base_url}${submit_entry}`, {
        registrationNumber: verifiedVehicle,
        whatsappNumber: whatsappNumber.trim(),
        entryType: entryType.toLowerCase(),
        remarks: remarks.trim(),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        showToast(`Entry registered successfully for vehicle ${verifiedVehicle}`);
      } else {
        showToast(response.data?.message || 'Failed to submit entry.');
      }
    } catch (error) {
      showToast('Failed to submit entry.');
      console.error('Submit Entry API error:', error);
    } finally {
      setLoading(false);
    }

    setSearchVehicle('');
    setVerifiedVehicle('');
    setWhatsappNumber('');
    setFormVisible(false);
  };

  const handleSubmitExit = async () => {
    setLoading(true);
    try {
      const token = await retrieveEncryptedData('token');
      let gateEntryId = activeGateEntry?.id;

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
        showToast(`Exit registered successfully for vehicle ${verifiedVehicle}`);
      } else {
        showToast(response.data?.message || 'Failed to submit exit.');
      }
    } catch (error) {
      showToast('Failed to submit exit.');
      console.error('Submit Exit API error:', error);
    } finally {
      setLoading(false);
    }

    setSearchVehicle('');
    setVerifiedVehicle('');
    setWhatsappNumber('');
    setFormVisible(false);
    setActiveGateEntry(null);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        >

          <View style={s.header}>
            <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.welcome}>Good day,</Text>
              <Text style={s.staffName}>{currentName}</Text>
            </View>
          </View>
          <View style={s.sectionHeader}>
            <Car size={16} color={COLORS.secondary} strokeWidth={2.5} />
            <Text style={s.sectionTitle}>Get Vehicle Number</Text>
          </View>

          <View style={s.searchCard}>
            <Text style={s.searchCardLabel}>VEHICLE REGISTRATION NUMBER</Text>
            <View style={s.phoneInputRow}>
              <View style={s.phoneInputWrapper}>
                <Car size={18} color={COLORS.muted} style={s.phoneIcon} />
                <TextInput
                  style={s.phoneInput}
                  placeholder="e.g. TN58AB1234"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="characters"
                  value={searchVehicle}
                  onChangeText={(text) => {
                    setSearchVehicle(text);
                    if (formVisible && text.toUpperCase() !== verifiedVehicle) {
                      setFormVisible(false);
                    }
                  }}
                />
              </View>
              <TouchableOpacity style={s.verifyBtn} onPress={handleSearchVehicle} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.verifyBtnText}>SUBMIT</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {formVisible && (
            <View style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formTitle}>
                  {isNewUser ? `NEW REGISTRATION (${verifiedVehicle})` : `VEHICLE PROFILE (${verifiedVehicle})`}
                </Text>
                <View style={[s.badge, { backgroundColor: isNewUser ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[s.badgeText, { color: isNewUser ? '#15803D' : '#D97706' }]}>
                    {isNewUser ? 'NEW USER' : 'ACTIVE VISITOR'}
                  </Text>
                </View>
              </View>

              {isNewUser ? (
                <View style={s.formFields}>
                  <View style={s.dtRow}>
                    <View style={s.dtItem}>
                      <Text style={s.dtLabel}>Today Date</Text>
                      <Text style={s.dtValue}>
                        {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={s.dtDivider} />
                    <View style={s.dtItem}>
                      <Text style={s.dtLabel}>Today Time</Text>
                      <Text style={[s.dtValue, { color: COLORS.primary }]}>
                        {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
                  </View>

                  <Text style={s.fieldLabel}>WhatsApp Number</Text>
                  <View style={[s.inputContainer, { marginBottom: 14 }]}>
                    <Phone size={16} color={COLORS.primary} style={s.inputIcon} />
                    <TextInput
                      style={s.textInputStyle}
                      value={whatsappNumber}
                      onChangeText={setWhatsappNumber}
                      placeholder="Enter WhatsApp number"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>

                  <Text style={s.fieldLabel}>Entry Type</Text>
                  <View style={s.typeSelectorRow}>
                    {['Service', 'Pickup', 'Enquiry'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[s.typeChip, entryType === type && s.typeChipActive]}
                        onPress={() => setEntryType(type)}
                      >
                        <Text style={[s.typeChipText, entryType === type && s.typeChipTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={s.fieldLabel}>Remarks (Optional)</Text>
                  <View style={[s.inputContainer, { marginBottom: 18 }]}>
                    <FileText size={16} color={COLORS.primary} style={s.inputIcon} />
                    <TextInput
                      style={s.textInputStyle}
                      value={remarks}
                      onChangeText={setRemarks}
                      placeholder="Any specific comments"
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>

                  <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.8 }]} onPress={handleSubmitEntry} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={s.submitBtnText}>SUBMIT ENTRY</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.formFields}>
                  <Text style={s.fieldLabel}>WhatsApp Number</Text>
                  <View style={s.nonEditableContainer}>
                    <Phone size={16} color={COLORS.muted} style={s.inputIcon} />
                    <Text style={s.nonEditableText}>{whatsappNumber}</Text>
                  </View>

                  <Text style={s.fieldLabel}>Entry Type</Text>
                  <View style={s.nonEditableContainer}>
                    <Text style={s.nonEditableText}>{entryType}</Text>
                  </View>

                  <Text style={s.fieldLabel}>Remarks</Text>
                  <View style={s.nonEditableContainer}>
                    <FileText size={16} color={COLORS.muted} style={s.inputIcon} />
                    <Text style={s.nonEditableText}>{remarks || 'No remarks provided'}</Text>
                  </View>

                  <View style={s.dtRow}>
                    <View style={s.dtItem}>
                      <Text style={s.dtLabel}>Entry Date</Text>
                      <Text style={s.dtValue}>
                        {activeGateEntry?.entryTime ? formatApiDate(activeGateEntry.entryTime) : 'N/A'}
                      </Text>
                    </View>
                    <View style={s.dtDivider} />
                    <View style={s.dtItem}>
                      <Text style={s.dtLabel}>Entry Time</Text>
                      <Text style={[s.dtValue, { color: COLORS.primary }]}>
                        {activeGateEntry?.entryTime ? formatApiTime(activeGateEntry.entryTime) : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={[s.dtRow, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                    <View style={s.dtItem}>
                      <Text style={[s.dtLabel, { color: '#B91C1C' }]}>Exit Date</Text>
                      <Text style={s.dtValue}>
                        {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={[s.dtDivider, { backgroundColor: '#FCA5A5' }]} />
                    <View style={s.dtItem}>
                      <Text style={[s.dtLabel, { color: '#B91C1C' }]}>Exit Time</Text>
                      <Text style={[s.dtValue, { color: '#EF4444' }]}>
                        {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#EF4444' }, loading && { opacity: 0.8 }]} onPress={handleSubmitExit} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={s.submitBtnText}>SUBMIT EXIT</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  welcome: { color: COLORS.muted, fontSize: 12, fontFamily: FONTS.inter },
  staffName: { color: COLORS.secondary, fontSize: 18, fontFamily: FONTS.inter },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: COLORS.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONTS.inter },

  searchCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  searchCardLabel: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.inter, letterSpacing: 0.5, marginBottom: 8 },
  phoneInputRow: { flexDirection: 'row', gap: 10 },
  phoneInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.background, paddingHorizontal: 12 },
  phoneIcon: { marginRight: 8 },
  phoneInput: { flex: 1, fontSize: 15, color: COLORS.secondary, fontFamily: FONTS.inter, paddingVertical: 8 },
  verifyBtn: { backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  verifyBtnText: { color: '#fff', fontSize: 13, fontFamily: FONTS.inter, letterSpacing: 0.5 },

  formCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 20 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12, marginBottom: 16 },
  formTitle: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.inter, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontFamily: FONTS.inter },
  formFields: { gap: 12 },

  fieldLabel: { color: COLORS.muted, fontSize: 11, fontFamily: FONTS.inter, marginBottom: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.background, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  textInputStyle: { flex: 1, color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.inter, paddingVertical: 9 },

  typeSelectorRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 12 },
  typeChip: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  typeChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  typeChipText: { fontSize: 12, color: COLORS.muted, fontFamily: FONTS.inter },
  typeChipTextActive: { color: COLORS.primary, fontFamily: FONTS.inter },

  dtRow: { flexDirection: 'row', backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderHeight: 1, borderColor: '#BAE6FD', borderWidth: 1, marginBottom: 12 },
  dtItem: { flex: 1, alignItems: 'center' },
  dtDivider: { width: 1, backgroundColor: '#BAE6FD' },
  dtLabel: { color: '#0369A1', fontSize: 10, fontFamily: FONTS.inter, marginBottom: 2 },
  dtValue: { color: COLORS.secondary, fontSize: 13, fontFamily: FONTS.inter },

  nonEditableContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  nonEditableText: { fontSize: 14, color: COLORS.muted, fontFamily: FONTS.inter },

  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.inter, letterSpacing: 0.5 },
});

