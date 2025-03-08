document.addEventListener('DOMContentLoaded', function () {
    const classifyBtn = document.getElementById('classify-btn');
    const resultsDiv = document.getElementById('results');
    const settingsBtn = document.getElementById('openSettings');
    const saveSettingsBtn = document.getElementById('saveSettings');

    if (!classifyBtn || !resultsDiv || !settingsBtn || !saveSettingsBtn) {
        console.error('❌ Elements not found! Ensure that popup.html contains the correct elements.');
        return;
    }

    classifyBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];

            if (!currentTab.url.includes("https://www.linkedin.com/messaging/")) {
                resultsDiv.innerHTML = '⚠️ Please open LinkedIn Messages page first!';
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                function: extractMessages
            }, async (injectionResults) => {
                const messages = injectionResults[0]?.result || '';

                if (!messages) {
                    resultsDiv.innerHTML = '⚠️ No messages detected!';
                    return;
                }

                try {
                    const response = await fetch('http://localhost:5000/api/classify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: messages })
                    });

                    const data = await response.json();
                    resultsDiv.classList.remove('high', 'low');

                    if (data.priority === 'HIGH') {
                        resultsDiv.innerHTML = `Priority: <b style="color:red;">${data.priority}</b>`;
                        resultsDiv.classList.add('high');
                    } else {
                        resultsDiv.innerHTML = `Priority: <b style="color:green;">${data.priority}</b>`;
                        resultsDiv.classList.add('low');

                        // Auto-hide spam if enabled
                        if (localStorage.getItem('autoHideLowPriority') === 'true') {
                            resultsDiv.innerHTML = '✅ LOW priority (Spam) auto-hidden.';
                            chrome.scripting.executeScript({
                                target: { tabId: currentTab.id },
                                function: hideLowPriorityMessages
                            });
                        }
                    }
                } catch (error) {
                    console.error('API Request Failed:', error);
                    resultsDiv.innerHTML = '❌ Error processing request.';
                }
            });
        });
    });

    // Settings Button
    settingsBtn.addEventListener('click', () => {
        const settingsDiv = document.getElementById('settings');
        settingsDiv.classList.toggle('hidden');
        document.getElementById('autoHide').checked = JSON.parse(localStorage.getItem('autoHideLowPriority') || 'false');
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
        localStorage.setItem('autoHideLowPriority', document.getElementById('autoHide').checked);
        document.getElementById('settings').classList.add('hidden');
    });

    // Function to extract messages from the LinkedIn chat
    function extractMessages() {
        return Array.from(document.querySelectorAll('.msg-s-message-list__event'))
            .map(msg => msg.innerText)
            .join(' ');
    }

    // Function to hide spam messages
    function hideLowPriorityMessages() {
        document.querySelectorAll('.msg-s-message-list__event').forEach(el => {
            if (el.innerText.toLowerCase().includes('sales') || el.innerText.toLowerCase().includes('marketing')) {
                el.style.display = 'none';
            }
        });
    }
});
