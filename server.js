const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read from the database
const readDB = () => {
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data);
};

// Helper function to write to the database
const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- API Endpoints ---

// GET /api/points - Fetch all department points
app.get('/api/points', (req, res) => {
    try {
        const db = readDB();
        res.json(db.departments);
    } catch (error) {
        res.status(500).json({ message: 'Error reading from database.' });
    }
});

// GET /api/data - Fetch all initial data (departments and events)
app.get('/api/data', (req, res) => {
     try {
        const db = readDB();
        res.json({ departments: db.departments, events: db.events });
    } catch (error) {
        res.status(500).json({ message: 'Error reading from database.' });
    }
});

// POST /api/points/update - Update points for a department
app.post('/api/points/update', (req, res) => {
    const { department, points, event } = req.body;

    if (!department || typeof points !== 'number') {
        return res.status(400).json({ message: 'Invalid request: department and points are required.' });
    }

    try {
        const db = readDB();
        const deptIndex = db.departments.findIndex(d => d.name.toLowerCase() === department.toLowerCase());

        if (deptIndex === -1) {
            return res.status(404).json({ message: `Department '${department}' not found.` });
        }

        db.departments[deptIndex].points += points;
        writeDB(db);
        
        console.log(`Updated points: ${department.toUpperCase()} | Points: ${points > 0 ? '+' : ''}${points} | New Total: ${db.departments[deptIndex].points} | Event: ${event || 'N/A'}`);

        res.json({
            message: 'Points updated successfully!',
            department: db.departments[deptIndex]
        });

    } catch (error) {
        res.status(500).json({ message: 'Error updating database.' });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});