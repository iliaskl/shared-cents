// scripts/debug-firestore-data.js
// Run this script to examine and fix your Firestore data structure
// node scripts/debug-firestore-data.js

const { db } = require('../config/firebase');

async function debugFirestoreGroups() {
    console.log('🔎 Examining Firestore Groups Collection...');

    try {
        // Get all groups
        console.log('\nFetching all groups from Firestore...');
        const groupsSnapshot = await db.collection('groups').get();

        if (groupsSnapshot.empty) {
            console.log('❌ No groups found in the database!');
            console.log('Would you like to create a test group? Run this script with --create-test argument');
            return;
        }

        console.log(`✅ Found ${groupsSnapshot.size} group(s) in Firestore.`);

        // Analyze each group
        groupsSnapshot.forEach(doc => {
            const groupData = doc.data();

            console.log(`\n----- Group ID: ${doc.id} -----`);
            console.log(`Name: ${groupData.name}`);
            console.log(`Archived: ${groupData.archived || false}`);
            console.log(`Created At: ${groupData.createdAt || 'Not set'}`);
            console.log(`Last Activity: ${groupData.lastActivity || 'Not set'}`);

            if (groupData.members && Array.isArray(groupData.members)) {
                console.log(`Members: ${groupData.members.length}`);
                groupData.members.forEach((member, index) => {
                    if (typeof member === 'string') {
                        console.log(`  ${index + 1}. ${member} (simple string format)`);
                    } else {
                        console.log(`  ${index + 1}. ${member.userId || 'Unknown ID'} - Balance: ${member.balance || 0}`);
                    }
                });
            } else {
                console.log('❌ No members array found!');
            }

            // Check if document ID matches name (common issue)
            if (groupData.name && groupData.name.toLowerCase() === doc.id.toLowerCase()) {
                console.log(`✅ Document ID matches name (case-insensitive)`);
            } else if (groupData.name) {
                console.log(`⚠️ Document ID (${doc.id}) does not match group name (${groupData.name})`);
                console.log(`   This could cause issues with lookups. Run with --fix-ids to correct.`);
            }
        });

        // Handle create-test argument
        if (process.argv.includes('--create-test')) {
            await createTestGroup();
        }

        // Handle fix-ids argument
        if (process.argv.includes('--fix-ids')) {
            await fixGroupIds(groupsSnapshot);
        }

    } catch (error) {
        console.error('❌ Error examining Firestore groups:', error);
    }
}

async function createTestGroup() {
    console.log('\n📝 Creating a test roommates group in Firestore...');

    try {
        // Check if roommates group already exists
        const existingSnapshot = await db.collection('groups')
            .where('name', '==', 'Roommates')
            .get();

        if (!existingSnapshot.empty) {
            console.log('❌ Roommates group already exists!');
            return;
        }

        // Create a new test group with ID that matches the name (lowercase)
        const testGroupData = {
            name: 'Roommates',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            archived: false,
            members: [
                {
                    userId: 'John',
                    name: 'John',
                    balance: -253.08,
                    isCreator: true
                },
                {
                    userId: 'Jane',
                    name: 'Jane',
                    balance: 253.08,
                    isCreator: false
                }
            ],
            currency: 'USD',
            currencyLocale: 'en-US',
            currencySymbol: '$'
        };

        // Set with explicit ID to match the name
        await db.collection('groups').doc('roommates').set(testGroupData);

        console.log('✅ Test roommates group created successfully! ID: roommates');
    } catch (error) {
        console.error('❌ Error creating test group:', error);
    }
}

async function fixGroupIds(groupsSnapshot) {
    console.log('\n🔧 Fixing group IDs to match names (lowercase)...');

    try {
        const batch = db.batch();
        let fixCount = 0;

        for (const doc of groupsSnapshot.docs) {
            const groupData = doc.data();

            if (groupData.name && groupData.name.toLowerCase() !== doc.id.toLowerCase()) {
                const correctId = groupData.name.toLowerCase();
                console.log(`Fixing: ${doc.id} -> ${correctId}`);

                // Create new document with correct ID
                const newDocRef = db.collection('groups').doc(correctId);
                batch.set(newDocRef, groupData);

                // Delete old document
                batch.delete(doc.ref);

                fixCount++;
            }
        }

        if (fixCount > 0) {
            await batch.commit();
            console.log(`✅ Fixed ${fixCount} group ID(s) successfully!`);
        } else {
            console.log('✅ No group IDs needed fixing.');
        }
    } catch (error) {
        console.error('❌ Error fixing group IDs:', error);
    }
}

// Run the debug function
debugFirestoreGroups();