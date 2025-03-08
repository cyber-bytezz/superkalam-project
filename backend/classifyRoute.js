const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/classify', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message field is required!" });
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
                    { role: "system", content: "Classify LinkedIn DM as HIGH or LOW priority based on importance." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        console.log("🔍 Full API Response:", JSON.stringify(data, null, 2));

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        // ✅ **Check if `choices` exists before accessing**
        const classification = data.choices?.[0]?.message?.content?.toUpperCase();

        if (!classification) {
            return res.status(400).json({ error: "Invalid AI response format!" });
        }

        res.json({ priority: classification.includes("LOW") ? "LOW" : "HIGH" });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
