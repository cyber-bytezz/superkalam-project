require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/classify', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message field is required!" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Server misconfiguration: API key is missing." });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Classify LinkedIn DM as HIGH or LOW." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        console.log("✅ Full API Response:", data);

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        const classification = data.choices?.[0]?.message?.content || "UNKNOWN";
        res.json({ priority: classification });

    } catch (error) {
        console.error("❌ API Request Failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
