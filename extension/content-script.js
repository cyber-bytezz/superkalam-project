// For basic testing (we'll expand this later)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractMessages') {
      const messages = Array.from(document.querySelectorAll('.msg-s-message-list__event'))
        .map(msg => msg.innerText);
      sendResponse({ messages });
    }
  });
  