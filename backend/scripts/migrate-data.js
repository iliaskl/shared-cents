// scripts/migrate-data.js
const { db, admin } = require('../config/firebase');

async function migrateData() {
    try {
        console.log('Starting data migration...');

        // Create some sample users
        const users = [
            {
                id: 'user-1',
                name: 'Bill Moss',
                email: 'bill.moss@example.com',
                profileImage: '/images/bill.jpg',
                groups: [],
                createdAt: new Date().toISOString()
            },
            {
                id: 'user-2',
                name: 'Sarah Johnson',
                email: 'sarah.j@example.com',
                profileImage: '/images/sarah.jpg',
                groups: [],
                createdAt: new Date().toISOString()
            },
            {
                id: 'user-3',
                name: 'Mike Smith',
                email: 'mike.s@example.com',
                profileImage: '/images/mike.jpg',
                groups: [],
                createdAt: new Date().toISOString()
            },
            {
                id: 'user-4',
                name: 'Emma Wilson',
                email: 'emma.w@example.com',
                profileImage: '/images/emma.jpg',
                groups: [],
                createdAt: new Date().toISOString()
            }
        ];

        // Add users to Firestore
        for (const user of users) {
            const { id, ...userData } = user;
            await db.collection('users').doc(id).set(userData);
            console.log(`Created user: ${user.name}`);
        }

        // Create some sample groups
        const groups = [
            {
                name: 'Roommates',
                currency: 'USD',
                currencyLocale: 'en-US',
                currencySymbol: '$',
                createdBy: 'user-1',
                createdAt: new Date('2025-01-15').toISOString(),
                lastActivity: new Date().toISOString(),
                archived: false,
                totalExpenses: 150.00,
                totalSettled: 0,
                memberIds: ['user-1', 'user-2', 'user-3'],
                members: [
                    {
                        userId: 'user-1',
                        name: 'Bill Moss',
                        email: 'bill.moss@example.com',
                        profileImage: '/images/bill.jpg',
                        balance: -30.50,
                        isCreator: true
                    },
                    {
                        userId: 'user-2',
                        name: 'Sarah Johnson',
                        email: 'sarah.j@example.com',
                        profileImage: '/images/sarah.jpg',
                        balance: 15.25,
                        isCreator: false
                    },
                    {
                        userId: 'user-3',
                        name: 'Mike Smith',
                        email: 'mike.s@example.com',
                        profileImage: '/images/mike.jpg',
                        balance: 15.25,
                        isCreator: false
                    }
                ]
            },
            {
                name: 'Trip to Spain',
                currency: 'EUR',
                currencyLocale: 'de-DE',
                currencySymbol: '€',
                createdBy: 'user-2',
                createdAt: new Date('2025-02-10').toISOString(),
                lastActivity: new Date().toISOString(),
                archived: false,
                totalExpenses: 500.00,
                totalSettled: 0,
                memberIds: ['user-1', 'user-2', 'user-4'],
                members: [
                    {
                        userId: 'user-1',
                        name: 'Bill Moss',
                        email: 'bill.moss@example.com',
                        profileImage: '/images/bill.jpg',
                        balance: 45.75,
                        isCreator: false
                    },
                    {
                        userId: 'user-2',
                        name: 'Sarah Johnson',
                        email: 'sarah.j@example.com',
                        profileImage: '/images/sarah.jpg',
                        balance: -91.50,
                        isCreator: true
                    },
                    {
                        userId: 'user-4',
                        name: 'Emma Wilson',
                        email: 'emma.w@example.com',
                        profileImage: '/images/emma.jpg',
                        balance: 45.75,
                        isCreator: false
                    }
                ]
            }
        ];

        // Add groups to Firestore
        for (const group of groups) {
            const groupRef = await db.collection('groups').add(group);
            console.log(`Created group: ${group.name}`);

            // Update users with group references
            for (const memberId of group.memberIds) {
                await db.collection('users').doc(memberId).update({
                    groups: admin.firestore.FieldValue.arrayUnion(groupRef.id)
                });
            }
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run migration
migrateData().then(() => {
    console.log('Migration finished');
    process.exit(0);
});