// routes/users.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * GET /api/users
 * Get all users (for searching when creating groups)
 */
router.get('/', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/users/:id
 * Get a specific user
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: userDoc.id,
            ...userDoc.data()
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, profileImage } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if user with email already exists
        const existingUserSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!existingUserSnapshot.empty) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const userData = {
            name,
            email,
            profileImage: profileImage || null,
            groups: [],
            createdAt: new Date().toISOString()
        };

        const userRef = await db.collection('users').add(userData);

        res.status(201).json({
            id: userRef.id,
            ...userData
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;