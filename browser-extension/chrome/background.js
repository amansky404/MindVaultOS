// Background service worker for MindVault AutoFill extension
const API_BASE = 'http://127.0.0.1:37405/api';

// Listen for AutoFill command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-autofill') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerAutoFill' });
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCredentials') {
    fetchCredentials(request.domain)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'checkConnection') {
    checkAPIConnection()
      .then(sendResponse)
      .catch(error => sendResponse({ connected: false }));
    return true;
  }
});

// Fetch credentials from local API
async function fetchCredentials(domain) {
  try {
    const response = await fetch(`${API_BASE}/credentials/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credentials');
    }

    const data = await response.json();
    return { credentials: data.credentials || [] };
  } catch (error) {
    console.error('[MindVault] Error fetching credentials:', error);
    return { error: error.message };
  }
}

// Check API connection
async function checkAPIConnection() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    return { connected: true, locked: data.locked };
  } catch (error) {
    return { connected: false };
  }
}

// Monitor tab changes to notify content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch(() => {
      // Ignore errors if content script not ready
    });
  }
});
