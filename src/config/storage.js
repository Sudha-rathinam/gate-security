import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../config/constant';

function encryptData(data, key) {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    let encryptvalue = CryptoJS.AES.encrypt(stringData, key);
    return encryptvalue;
}

function decryptData(encryptedData, key) {
    const decipher = CryptoJS.AES.decrypt(encryptedData.toString(), key);
    let decrypted = decipher.toString(CryptoJS.enc.Utf8);
    return decrypted;
}

export async function storeEncryptedData(key, data) {
    try {
        const encryptedData = encryptData(data, SECRET_KEY);
        await EncryptedStorage.setItem(key, encryptedData.toString());
    } catch (error) {
        console.error("Error storing encrypted data:", error);
    }
}

export async function retrieveEncryptedData(key) {
    try {
        const encryptedData = await EncryptedStorage.getItem(key);
        if (encryptedData) {
            const decryptedData = decryptData(encryptedData, SECRET_KEY);
            return decryptedData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error retrieving encrypted data:", error);
        return null;
    }
}

export async function removeEncryptedData(key) {
    try {
        await EncryptedStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing encrypted data:", error);
    }
}

export function getInitials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

