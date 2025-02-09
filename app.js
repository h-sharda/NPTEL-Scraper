const express = require('express');
const path = require('path');
const { processUser } = require('./fetch.js'); 

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
        const results = await processUser({ email, dob });
        res.json({ results });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.listen(PORT, () => { console.log(`Server is running at http://localhost:${PORT}`); });
