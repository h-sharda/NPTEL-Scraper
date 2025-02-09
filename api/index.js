const { processUser } = require("../fetch");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { email, dob } = req.body;

    try {
        const results = await processUser({ email, dob });
        return res.json({ results });
    } catch (error) {
        return res.json({ error: error.message });
    }
};
