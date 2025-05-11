// scripts/test-firestore-connection.js
// Run this script to test your Firestore connection and permissions
// node scripts/test-firestore-connection.js

const { db } = require('../config/firebase');

async function testFirestoreOperations() {
    console.log('🔥 Testing Firestore connection and permissions...');

    try {
        // 1. Test connection with a read operation
        console.log('Testing READ operation...');
        const groupsSnapshot = await db.collection('groups').limit(1).get();

        if (groupsSnapshot.empty) {
            console.log('✅ Connection successful, but no groups found');
        } else {
            console.log(`✅ READ successful - found ${groupsSnapshot.size} group(s)`);

            // Get the first group's ID for testing updates
            const groupId = groupsSnapshot.docs[0].id;
            const groupData = groupsSnapshot.docs[0].data();
            console.log(`First group: ${groupId} (${groupData.name})`);

            // 2. Test update operation with lastActivity field
            console.log('\nTesting UPDATE operation...');
            console.log(`Attempting to update lastActivity for group ${groupId}...`);

            await db.collection('groups').doc(groupId).update({
                lastActivity: new Date().toISOString()
            });
            console.log('✅ UPDATE successful - lastActivity field updated');

            // 3. Test setting archived field specifically
            console.log('\nTesting ARCHIVE toggle operation...');
            const currentArchived = groupData.archived || false;
            console.log(`Current archived status: ${currentArchived}`);
            console.log(`Attempting to toggle archived status to: ${!currentArchived}...`);

            await db.collection('groups').doc(groupId).update({
                archived: !currentArchived
            });
            console.log(`✅ ARCHIVE toggle successful - set to ${!currentArchived}`);

            // 4. Toggle it back to original state
            console.log('\nReverting archive status back to original...');
            await db.collection('groups').doc(groupId).update({
                archived: currentArchived
            });
            console.log(`✅ Reverted archive status back to: ${currentArchived}`);
        }
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        console.error('\nThis likely indicates a permissions issue with your Firestore rules or service account credentials.');
        console.error('Make sure your service account has appropriate permissions and your Firestore rules allow these operations.');
    }
}

// Run the test
testFirestoreOperations();