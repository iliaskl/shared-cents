// scripts/seed-db.js
const { db } = require('../config/firebase');

async function seedData() {
    try {
        console.log('Starting database seeding...');

        // Create roommates document if it doesn't exist
        const roommatesRef = db.collection('roommates').doc('roommates');
        const roommatesDoc = await roommatesRef.get();

        if (!roommatesDoc.exists) {
            await roommatesRef.set({
                name: "Roommates",
                members: ["John", "Paul"]
            });
            console.log('Created roommates document');
        } else {
            console.log('Roommates document already exists');
        }

        // Add an expense if none exist
        const expensesSnapshot = await db.collection('expenses').get();

        if (expensesSnapshot.empty) {
            await db.collection('expenses').add({
                amount: 50,
                description: "Dinner",
                paidBy: "John",
                split: {
                    John: 0.5,
                    Paul: 0.5
                }
            });
            console.log('Added expense document');
        } else {
            console.log('Expenses already exist');
        }

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Run the seeding function
seedData();