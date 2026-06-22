/**
 * Search screen for locating vehicle records by number and reviewing entry status.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import styles from '../styles/VehicleSearchScreenStyles.jsx';

export default function VehicleSearchScreen() {
  const [vehicleNumber, setVehicleNumber] = useState('MH12AB1234');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Search Vehicle</Text>
          <Text style={styles.subtitle}>Find a vehicle by registration number to review entry data and status.</Text>
          <CustomInput label="Vehicle Number" value={vehicleNumber} onChangeText={setVehicleNumber} />
          <CustomButton title="Search" onPress={() => { }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Vehicle Information</Text>
          <View style={styles.resultRow}><Text style={styles.label}>Vehicle Number</Text><Text style={styles.value}>{vehicleNumber}</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Owner</Text><Text style={styles.value}>Amit Sharma</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Entry Status</Text><Text style={styles.value}>Inside Workshop</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Service Type</Text><Text style={styles.value}>Engine Check</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
