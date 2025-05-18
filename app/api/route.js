import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import serviceAccount from '@/firebase-credentials.json';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export async function GET() {
    try {
        const user = await admin.auth().getUser('some-uid'); // Replace with actual UID logic
        const profileData = {
            displayName: user.displayName,
            email: user.email,
            currency: 'USD', // Add custom fields if needed
        };
        return NextResponse.json(profileData);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
