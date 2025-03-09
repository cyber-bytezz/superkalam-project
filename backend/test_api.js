require('dotenv').config();
const fetch = require('node-fetch');

async function testOpenRouter() {
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
                { role: "user", content: "Hello, how are you?" }
            ]
        })
    });

    const data = await response.json();
    console.log("✅ Full API Response:", data);
}

testOpenRouter();
