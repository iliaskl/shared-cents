const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Define routes
const groupsRouter = require('./routes/groups');
const usersRouter = require('./routes/users');

app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'SharedCents API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH'],
}));