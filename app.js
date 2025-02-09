const express = require('express');
const path = require('path');

// Debugging: Try to import fetch.js
let processUser;
try {
    ({ processUser } = require('./fetch.js'));
    console.log('✅ fetch.js imported successfully.');
} catch (error) {
    console.error('❌ Error importing fetch.js:', error.message);
}

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/process-user', async (req, res) => {
    const { email, dob } = req.body;
    try {
        if (!processUser) throw new Error('processUser function is not available');

        const results = await processUser({ email, dob });
        res.json({ results });
    } catch (error) {
        console.error('❌ Error in /process-user:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
