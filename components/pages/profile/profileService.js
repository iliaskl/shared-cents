// components/pages/profile/profileService.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/backend/config/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export async function fetchUserProfile() {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}