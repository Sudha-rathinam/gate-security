import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import styles from '../styles/VehicleExitScreenStyles.jsx';
import { COLORS } from '../config/theme';
import { showToast } from '../utils/toast';

export default function VehicleExitScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [dispatchTime, setDispatchTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDispatchTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (!searchQuery) {
      showToast('Please enter a vehicle number');
      return;
    }

    setLoading(true);
    setVehicleData(null);

    // Simulate data retrieval
    setTimeout(() => {
      setVehicleData({
        vehicleNumber: searchQuery.toUpperCase(),
        arrivalDate: '11 Jun 2026',
        arrivalTime: '10:30 AM',
        ownerName: 'Rahul Varma',
        mobile: '9822001122',
        serviceType: 'Full Detailing',
        remarks: 'Minor scratch on rear bumper noted on arrival.',
        photos: [
          { uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=60&w=200' },
          { uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=60&w=200' }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const formatDate = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

  const renderInfoItem = (label, value) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Vehicle Exit Control</Text>
          <Text style={styles.headerSubtitle}>Search for a vehicle to finalize dispatch and verify delivery condition.</Text>

          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="ENTER VEHICLE NUMBER"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="characters"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.searchButtonText}>🔍 SEARCH</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {vehicleData && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.dateTimeHeader}>
                <View style={styles.dateTimeBlock}>
                  <Text style={styles.dateTimeLabel}>Arrival Date</Text>
                  <Text style={styles.dateTimeValue}>{vehicleData.arrivalDate}</Text>
                </View>
                <View style={styles.dateTimeBlock}>
                  <Text style={styles.dateTimeLabel}>Arrival Time</Text>
                  <Text style={styles.dateTimeValue}>{vehicleData.arrivalTime}</Text>
                </View>
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Handover Verification</Text>
              {renderInfoItem('Vehicle No', vehicleData.vehicleNumber)}
              {renderInfoItem('Owner Name', vehicleData.ownerName)}
              {renderInfoItem('Mobile No', vehicleData.mobile)}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Condition on Arrival</Text>
              <View style={styles.photoGrid}>
                {vehicleData.photos.map((photo, i) => (
                  <View key={i} style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.entryPhoto} />
                  </View>
                ))}
              </View>
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>Initial Remarks:</Text>
                <Text style={styles.remarksText}>{vehicleData.remarks}</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
              <View style={styles.dispatchHeader}>
                <Text style={[styles.sectionTitle, { color: '#0369A1' }]}>Final Dispatch Confirmation</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>READY</Text>
                </View>
              </View>

              <View style={styles.dispatchTimeRow}>
                <View style={styles.dispatchItem}>
                  <Text style={styles.dispatchLabel}>Departure Date</Text>
                  <Text style={styles.dispatchValue}>{formatDate(dispatchTime)}</Text>
                </View>
                <View style={styles.dispatchItem}>
                  <Text style={styles.dispatchLabel}>Departure Time</Text>
                  <Text style={styles.dispatchValue}>{formatTime(dispatchTime)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => {
                showToast('Vehicle Exit Authorized! Timestamp: ' + formatTime(dispatchTime));
              }}>
                <Text style={styles.confirmButtonText}>AUTHORIZE VEHICLE EXIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setVehicleData(null)}>
                <Text style={styles.cancelButtonText}>Cancel Handover</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

