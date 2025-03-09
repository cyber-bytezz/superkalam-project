document.addEventListener('DOMContentLoaded', function () {
    const classifyBtn = document.getElementById('classify-btn');
    const resultsDiv = document.getElementById('results');
    const settingsBtn = document.getElementById('openSettings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const autoHideCheckbox = document.getElementById('autoHide');

    if (!classifyBtn || !resultsDiv || !settingsBtn || !saveSettingsBtn || !autoHideCheckbox) {
        console.error('❌ Elements not found! Ensure popup.html has the correct elements.');
        return;
    }

    // Load saved settings
    autoHideCheckbox.checked = JSON.parse(localStorage.getItem('autoHideLowPriority') || 'false');

    classifyBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];

            if (!currentTab || !currentTab.url.includes("https://www.linkedin.com/messaging/")) {
                resultsDiv.innerHTML = '⚠️ Please open LinkedIn Messages page first!';
                return;
            }

            // Send message to content script
            chrome.tabs.sendMessage(currentTab.id, { action: "extract_messages" }, async (response) => {
                if (chrome.runtime.lastError || !response) {
                    console.error("❌ Content script not injected!", chrome.runtime.lastError);
                    resultsDiv.innerHTML = "❌ Extension not injected! Reload LinkedIn Messaging page.";
                    return;
                }

                if (!response.messages) {
                    resultsDiv.innerHTML = '⚠️ No messages detected!';
                    return;
                }

                const messages = response.messages;

                try {
                    const apiResponse = await fetch('http://localhost:5000/api/classify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: messages })
                    });

                    const data = await apiResponse.json();
                    resultsDiv.classList.remove('high', 'low');

                    if (data.priority === 'HIGH') {
                        resultsDiv.innerHTML = `🚨 Priority: <b style="color:red;">${data.priority}</b>`;
                        resultsDiv.classList.add('high');
                    } else {
                        resultsDiv.innerHTML = `✅ Priority: <b style="color:green;">${data.priority}</b>`;
                        resultsDiv.classList.add('low');

                        // Auto-hide spam if enabled
                        if (localStorage.getItem('autoHideLowPriority') === 'true') {
                            resultsDiv.innerHTML = '✅ LOW priority (Spam) auto-hidden.';
                            chrome.tabs.sendMessage(currentTab.id, { action: "hide_spam" });
                        }
                    }
                } catch (error) {
                    console.error('❌ API Request Failed:', error);
                    resultsDiv.innerHTML = '❌ Error processing request.';
                }
            });
        });
    });

    // Toggle Settings
    settingsBtn.addEventListener('click', () => {
        document.getElementById('settings').classList.toggle('hidden');
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
        localStorage.setItem('autoHideLowPriority', autoHideCheckbox.checked);
        document.getElementById('settings').classList.add('hidden');
    });
});
