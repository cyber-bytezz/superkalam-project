chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract_messages") {
        console.log("✅ Extracting messages from LinkedIn chat...");
        const messages = Array.from(document.querySelectorAll('.msg-s-message-list__event'))
            .map(msg => msg.innerText.trim())
            .filter(text => text.length > 0)
            .join(' ');

        sendResponse({ messages });
    }

    if (request.action === "hide_spam") {
        console.log("🚨 Hiding spam messages...");
        document.querySelectorAll('.msg-s-message-list__event').forEach(el => {
            if (el.innerText.toLowerCase().includes('sales') || el.innerText.toLowerCase().includes('marketing')) {
                el.style.display = 'none';
            }
        });
    }
});
