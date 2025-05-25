import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/backend/config/firebase';
import { NextResponse } from 'next/server';

const db = getFirestore(app);
const auth = getAuth(app);

// POST: Update profile
export async function POST(req) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { displayName, currency, password } = await req.json();

        const userRef = doc(db, 'users', user.uid);

        await updateDoc(userRef, {
            displayName,
            currency,
        });

        // Optionally update password
        if (password) {
            await user.updatePassword(password);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
