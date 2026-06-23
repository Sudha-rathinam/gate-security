import { getSecureItem, setSecureItem } from '../config/storage';

const DEFAULT_ACTIVE_ENTRIES = [
  { id: 1, vehicleNumber: 'TN58AB1234', whatsappNumber: '9876543210', entryType: 'Service', entryTime: '08:45 AM', entryDate: '22 Jun 2026', remarks: 'Needs wheel alignment' },
  { id: 2, vehicleNumber: 'TN58CA5678', whatsappNumber: '9876543211', entryType: 'Pickup', entryTime: '10:15 AM', entryDate: '22 Jun 2026', remarks: '' },
  { id: 3, vehicleNumber: 'TN58MN4321', whatsappNumber: '9876543212', entryType: 'Service', entryTime: '10:30 AM', entryDate: '22 Jun 2026', remarks: 'Check oil leak' },
  { id: 4, vehicleNumber: 'TN58EG1212', whatsappNumber: '9876543213', entryType: 'Enquiry', entryTime: '11:00 AM', entryDate: '22 Jun 2026', remarks: 'Body wash pricing' },
];

const DEFAULT_HISTORY_LOGS = [
  { id: 1, vehicleNumber: 'TN58AB1234', whatsappNumber: '9876543210', status: 'Exit', entryType: 'Service', date: '19 Jun 2026', meta: 'Entered 08:45 AM • Exited 04:10 PM' },
  { id: 2, vehicleNumber: 'TN58MN4321', whatsappNumber: '9876543212', status: 'Entry', entryType: 'Service', date: '19 Jun 2026', meta: 'Entered 10:30 AM' },
  { id: 3, vehicleNumber: 'TN58CA5678', whatsappNumber: '9876543211', status: 'Exit', entryType: 'Pickup', date: '19 Jun 2026', meta: 'Entered 10:15 AM • Exited 01:30 PM' },
  { id: 4, vehicleNumber: 'TN58EG1212', whatsappNumber: '9876543213', status: 'Entry', entryType: 'Enquiry', date: '19 Jun 2026', meta: 'Entered 11:00 AM' },
];

export async function getActiveEntries() {
  try {
    const data = await getSecureItem('activeEntries');
    if (!data) {
      await setSecureItem('activeEntries', DEFAULT_ACTIVE_ENTRIES);
      return DEFAULT_ACTIVE_ENTRIES;
    }
    return data;
  } catch (error) {
    console.error('Error loading active entries:', error);
    return DEFAULT_ACTIVE_ENTRIES;
  }
}

export async function saveActiveEntries(entries) {
  return await setSecureItem('activeEntries', entries);
}

export async function getHistoryLogs() {
  try {
    const data = await getSecureItem('historyLogs');
    if (!data) {
      await setSecureItem('historyLogs', DEFAULT_HISTORY_LOGS);
      return DEFAULT_HISTORY_LOGS;
    }
    return data;
  } catch (error) {
    console.error('Error loading history logs:', error);
    return DEFAULT_HISTORY_LOGS;
  }
}

export async function saveHistoryLogs(logs) {
  return await setSecureItem('historyLogs', logs);
}

export async function registerEntry(vehicleNumber, whatsappNumber, entryType, remarks = '') {
  const active = await getActiveEntries();
  const history = await getHistoryLogs();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const newActive = {
    id: Date.now(),
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    whatsappNumber: whatsappNumber.trim(),
    entryType,
    entryTime: timeStr,
    entryDate: dateStr,
    remarks: remarks.trim(),
  };

  const updatedActive = [...active, newActive];
  await saveActiveEntries(updatedActive);

  const newHistory = {
    id: Date.now() + 1,
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    whatsappNumber: whatsappNumber.trim(),
    status: 'Entry',
    entryType,
    date: dateStr,
    meta: `Entered ${timeStr}`,
  };

  const updatedHistory = [newHistory, ...history];
  await saveHistoryLogs(updatedHistory);

  return { active: updatedActive, history: updatedHistory };
}

export async function registerExit(vehicleNumber) {
  const active = await getActiveEntries();
  const history = await getHistoryLogs();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const upperVehicle = vehicleNumber.trim().toUpperCase();
  const vehicle = active.find(v => v.vehicleNumber.replace(/\s+/g, '') === upperVehicle.replace(/\s+/g, ''));

  if (!vehicle) {
    return { active, history };
  }

  const updatedActive = active.filter(v => v.vehicleNumber.replace(/\s+/g, '') !== upperVehicle.replace(/\s+/g, ''));
  await saveActiveEntries(updatedActive);

  const newHistory = {
    id: Date.now(),
    vehicleNumber: vehicle.vehicleNumber,
    whatsappNumber: vehicle.whatsappNumber,
    status: 'Exit',
    entryType: vehicle.entryType,
    date: dateStr,
    meta: `Entered ${vehicle.entryTime} • Exited ${timeStr}`,
  };

  const updatedHistory = [newHistory, ...history];
  await saveHistoryLogs(updatedHistory);

  return { active: updatedActive, history: updatedHistory };
}
