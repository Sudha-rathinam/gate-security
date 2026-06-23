import { getSecureItem, setSecureItem, getInitials } from '../config/storage';

let currentUserName = '';

export function getUserName() {
    return currentUserName;
}

export async function setUserName(name) {
    currentUserName = name;
    try {
        await setSecureItem('userName', name);
    } catch (error) {
        console.error('Error setting userName:', error);
    }
}

export async function initUserState() {
    try {
        const name = await getSecureItem('userName');
        if (name) {
            currentUserName = name;
        }
    } catch (error) {
        console.error('Error initializing user state:', error);
    }
}

export { getInitials };
