// routes/groups.js
const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

/**
 * GET /api/groups/user/:userId
 * Get all groups for a specific user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // For now, let's just get all groups and filter manually
        const groupsSnapshot = await db.collection('groups').get();

        const groups = [];

        groupsSnapshot.forEach(doc => {
            const groupData = doc.data();

            // Check if the user is in the members array
            let isMember = false;
            let userBalance = 0;

            if (Array.isArray(groupData.members)) {
                // For simple string arrays like ["John", "Paul"]
                if (typeof groupData.members[0] === 'string') {
                    isMember = groupData.members.includes(userId);
                } else {
                    // For object arrays with userId property
                    const userMember = groupData.members.find(m => m.userId === userId);
                    isMember = !!userMember;
                    userBalance = userMember ? userMember.balance : 0;
                }
            }

            if (isMember) {
                groups.push({
                    id: doc.id,
                    name: groupData.name,
                    balance: userBalance,
                    creationDate: groupData.createdAt,
                    lastActivity: groupData.lastActivity,
                    archived: groupData.archived || false,
                    currency: groupData.currency || 'USD',
                    currencyLocale: groupData.currencyLocale || 'en-US',
                    currencySymbol: groupData.currencySymbol || '$'
                });
            }
        });

        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

/**
 * GET /api/groups/roommates
 * Fetches roommates data (for backward compatibility with view_groups page)
 * NOTE: This route must be defined BEFORE the /:groupId route to avoid conflicts
 */
router.get('/roommates', async (req, res) => {
    try {
        console.log('Using special roommates endpoint');
        // Find the roommates group in the groups collection, trying different case variations
        const namesToTry = ['roommates', 'Roommates', 'ROOMMATES'];
        let groupDoc = null;
        let found = false;

        for (const nameVariation of namesToTry) {
            console.log(`Trying to find roommates group with name: "${nameVariation}"`);
            const groupsSnapshot = await db.collection('groups')
                .where('name', '==', nameVariation)
                .limit(1)
                .get();

            if (!groupsSnapshot.empty) {
                groupDoc = groupsSnapshot.docs[0];
                found = true;
                console.log(`Found roommates group with name: "${nameVariation}"`);
                break;
            }
        }

        if (!found) {
            console.log('No roommates group found with any name variation');
            return res.status(404).json({ error: 'Roommates group not found' });
        }

        const groupData = groupDoc.data();
        console.log(`Found roommates group with ID: ${groupDoc.id}`);

        // Get expenses for the roommates group
        const expensesSnapshot = await db.collection('expenses').get();

        const expenses = [];
        expensesSnapshot.forEach(doc => {
            const expenseData = doc.data();

            // Convert split map to splits array format expected by frontend
            const splits = [];
            if (expenseData.split) {
                Object.entries(expenseData.split).forEach(([userId, percentage]) => {
                    splits.push({
                        userId,
                        percentage: percentage * 100, // Convert from decimal to percentage
                        amount: expenseData.amount * percentage
                    });
                });
            }

            expenses.push({
                id: doc.id,
                name: expenseData.description || 'Unnamed Expense',
                amount: expenseData.amount || 0,
                date: expenseData.date || new Date().toISOString(),
                paidBy: expenseData.paidBy || 'Unknown',
                splits: splits
            });
        });

        // Create member objects with calculated balances
        const members = groupData.members.map(member => {
            // Calculate balance based on expenses
            let balance = 0;

            expenses.forEach(expense => {
                // If this member paid the expense
                if (expense.paidBy === member.userId) {
                    // Add the amount others owe them
                    const memberSplit = expense.splits.find(split => split.userId === member.userId);
                    if (memberSplit) {
                        balance += expense.amount - memberSplit.amount;
                    }
                } else {
                    // Subtract the amount they owe others
                    const memberSplit = expense.splits.find(split => split.userId === member.userId);
                    if (memberSplit) {
                        balance -= memberSplit.amount;
                    }
                }
            });

            return {
                userId: member.userId,
                name: member.name || member.userId,
                balance,
                settled: balance === 0,
                isCreator: member.isCreator || false
            };
        });

        // Return the complete data in the format expected by frontend
        res.json({
            id: groupDoc.id,
            name: groupData.name || "Roommates",
            createdAt: groupData.createdAt || new Date().toISOString(),
            creatorId: groupData.createdBy || "user-1",
            members,
            expenses
        });
    } catch (error) {
        console.error('Error fetching roommates data:', error);
        res.status(500).json({ error: 'Failed to fetch roommates data' });
    }
});

/**
 * GET /api/groups/:groupId
 * Get details for a specific group (by ID or name)
 */
router.get('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        console.log(`Looking up group with ID/name: ${groupId}`);

        // First try direct document lookup (by ID)
        let groupDoc = await db.collection('groups').doc(groupId).get();

        // If not found by direct ID, try lookup by name with various case options
        if (!groupDoc.exists) {
            console.log(`Group not found by ID, trying to find by name with different cases`);

            // Case variations to try
            const namesToTry = [
                groupId,                     // Original as passed
                groupId.toLowerCase(),       // all lowercase
                groupId.toUpperCase(),       // ALL UPPERCASE
                groupId.charAt(0).toUpperCase() + groupId.slice(1).toLowerCase() // Capitalized
            ];

            let found = false;

            // Try each case variation
            for (const nameVariation of namesToTry) {
                console.log(`Trying name variation: "${nameVariation}"`);
                const groupsSnapshot = await db.collection('groups')
                    .where('name', '==', nameVariation)
                    .limit(1)
                    .get();

                if (!groupsSnapshot.empty) {
                    groupDoc = groupsSnapshot.docs[0];
                    found = true;
                    console.log(`Found group with name: "${nameVariation}", ID: ${groupDoc.id}`);
                    break;
                }
            }

            if (!found) {
                console.log(`No group found with any name variation for: ${groupId}`);
            }
        } else {
            console.log(`Found group by ID: ${groupId}`);
        }

        if (!groupDoc || !groupDoc.exists) {
            console.log(`No group found for: ${groupId}`);
            return res.status(404).json({ error: 'Group not found' });
        }

        const groupData = groupDoc.data();
        console.log(`Group data: ${JSON.stringify({
            id: groupDoc.id,
            name: groupData.name,
            // Include just a few fields to keep logs manageable
            createdAt: groupData.createdAt,
            createdBy: groupData.createdBy
        })}`);

        // Get all expenses for this group
        console.log(`Fetching expenses for group: ${groupDoc.id}`);
        let expensesSnapshot;
        try {
            expensesSnapshot = await db.collection('expenses')
                .where('groupId', '==', groupDoc.id)
                .orderBy('date', 'desc')
                .get();
        } catch (error) {
            console.log(`Error fetching expenses: ${error.message}`);
            // Fallback - if the query fails, try without the orderBy
            expensesSnapshot = await db.collection('expenses')
                .where('groupId', '==', groupDoc.id)
                .get();
        }

        const expenses = [];
        expensesSnapshot.forEach(doc => {
            expenses.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(`Found ${expenses.length} expenses for group`);

        res.json({
            id: groupDoc.id,
            ...groupData,
            expenses
        });
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ error: 'Failed to fetch group' });
    }
});

/**
 * PATCH /api/groups/:groupId
 * Update a group (archive/unarchive)
 */
router.patch('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const updates = req.body;

        // Add timestamp for tracking
        updates.lastActivity = new Date().toISOString();

        await db.collection('groups').doc(groupId).update(updates);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Failed to update group' });
    }
});

/**
 * POST /api/groups/roommates/expenses
 * Creates a new expense
 */
router.post('/roommates/expenses', async (req, res) => {
    try {
        const { name, amount, date, paidBy, splits } = req.body;

        // Convert splits array to split map
        const splitMap = {};
        if (Array.isArray(splits)) {
            splits.forEach(split => {
                splitMap[split.userId] = split.percentage / 100; // Convert percentage to decimal
            });
        }

        // Create the expense document
        const expenseData = {
            description: name || 'Unnamed Expense',
            amount: amount || 0,
            date: date || new Date().toISOString(),
            paidBy: paidBy || 'Unknown',
            split: splitMap
        };

        // Add the expense to Firestore
        const expenseRef = await db.collection('expenses').add(expenseData);

        // Return the created expense with its ID in the format expected by frontend
        res.status(201).json({
            id: expenseRef.id,
            name: expenseData.description,
            amount: expenseData.amount,
            date: expenseData.date,
            paidBy: expenseData.paidBy,
            splits: Array.isArray(splits) ? splits : []
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

/**
 * POST /api/groups
 * Create a new group
 */
router.post('/', async (req, res) => {
    try {
        const {
            name,
            currency,
            currencyLocale,
            currencySymbol,
            members,
            createdBy,
            createdAt,
            lastActivity,
            archived
        } = req.body;

        // Validate required fields
        if (!name || !currency || !members || !createdBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Extract member IDs for easy querying
        const memberIds = members.map(member => member.userId);

        // Create group document
        const groupRef = await db.collection('groups').add({
            name,
            currency,
            currencyLocale,
            currencySymbol,
            members: members.map(member => ({
                ...member,
                balance: 0 // Initialize balance to 0
            })),
            memberIds, // For easy querying
            createdBy,
            createdAt: createdAt || new Date().toISOString(),
            lastActivity: lastActivity || new Date().toISOString(),
            archived: archived || false,
            totalExpenses: 0,
            totalSettled: 0
        });

        // Get the created group with its ID
        const groupDoc = await groupRef.get();
        const groupData = groupDoc.data();

        res.status(201).json({
            id: groupRef.id,
            ...groupData
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

module.exports = router;