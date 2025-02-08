const express = require('express');
const { processUser } = require('./fetch.js');  // Import the function from dataFetcher.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());  // Express already includes body-parser functionality
app.use(express.static('public')); // For serving the HTML file

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve index.html from the public folder
});

app.post('/process-user', async (req, res) => {
    const { email, dob } = req.body;
    
    try {
        const results = await processUser({ email, dob });
        res.json({ results });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
