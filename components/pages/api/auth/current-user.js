export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // For testing, return a user that matches your migration data
        const currentUser = {
            id: 'user-1',
            name: 'Bill Moss',
            email: 'bill.moss@example.com',
            profileImage: '/images/bill.jpg'
        };

        res.status(200).json(currentUser);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
}