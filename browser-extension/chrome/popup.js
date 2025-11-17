// Popup script for MindVault AutoFill extension

document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const triggerButton = document.getElementById('triggerAutoFill');
  const openAppButton = document.getElementById('openApp');

  // Check connection status
  async function checkStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkConnection' });
      
      if (response.connected) {
        if (response.locked) {
          statusDiv.textContent = '⚠️ Connected but Locked';
          statusDiv.className = 'status locked';
          triggerButton.disabled = true;
        } else {
          statusDiv.textContent = '✓ Connected & Ready';
          statusDiv.className = 'status connected';
          triggerButton.disabled = false;
        }
      } else {
        statusDiv.textContent = '✗ Not Connected to MindVault';
        statusDiv.className = 'status disconnected';
        triggerButton.disabled = true;
      }
    } catch (error) {
      statusDiv.textContent = '✗ Connection Error';
      statusDiv.className = 'status disconnected';
      triggerButton.disabled = true;
    }
  }

  // Trigger AutoFill on current tab
  triggerButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'triggerAutoFill' });
      window.close();
    }
  });

  // Open MindVault OS app
  openAppButton.addEventListener('click', () => {
    // This will only work if the Electron app registers a custom protocol
    // For now, show message
    alert('Please open MindVault OS desktop application');
  });

  // Initial check
  checkStatus();

  // Refresh status every 2 seconds
  setInterval(checkStatus, 2000);
});
