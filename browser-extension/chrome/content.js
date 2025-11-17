// Content script for MindVault AutoFill
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    SHOW_INDICATOR: true,
    AUTO_DETECT_FORMS: true,
    HUMAN_TYPING: true,
  };

  // Human-like typing simulator
  class TypingSimulator {
    static async typeText(element, text, humanLike = true) {
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Type character
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));

        // Random delay
        if (humanLike) {
          await this.delay(50 + Math.random() * 100);
        } else {
          await this.delay(10);
        }
      }

      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    static delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Find login fields
  function findLoginFields() {
    let usernameField = null;
    let passwordField = null;

    // Find password field first
    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 0) {
      passwordField = passwordFields[0];
    }

    // Find username field
    const usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
    ];

    for (const selector of usernameSelectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        usernameField = element;
        break;
      }
    }

    return { usernameField, passwordField };
  }

  // Fill login form
  async function fillLoginForm(credentials) {
    if (!credentials || credentials.length === 0) {
      showNotification('No credentials found for this site', 'warning');
      return;
    }

    // Use first credential (could show picker for multiple)
    const cred = credentials[0];
    const { usernameField, passwordField } = findLoginFields();

    if (!usernameField || !passwordField) {
      showNotification('Could not detect login form', 'error');
      return;
    }

    try {
      // Fill username
      if (CONFIG.HUMAN_TYPING) {
        await TypingSimulator.typeText(usernameField, cred.username, true);
      } else {
        usernameField.value = cred.username;
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Small delay
      await TypingSimulator.delay(300);

      // Fill password
      if (CONFIG.HUMAN_TYPING) {
        await TypingSimulator.typeText(passwordField, cred.password, true);
      } else {
        passwordField.value = cred.password;
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      showNotification(`Filled credentials for ${cred.name}`, 'success');

      // Auto-submit if configured
      if (cred.autoSubmit) {
        await TypingSimulator.delay(500);
        const form = passwordField.closest('form');
        if (form) {
          form.submit();
        }
      }
    } catch (error) {
      showNotification('Error filling form', 'error');
      console.error('[MindVault] Fill error:', error);
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    if (!CONFIG.SHOW_INDICATOR) return;

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Trigger AutoFill
  async function triggerAutoFill() {
    try {
      const domain = window.location.hostname;
      
      // Request credentials from background script
      chrome.runtime.sendMessage(
        { action: 'getCredentials', domain },
        async (response) => {
          if (response.error) {
            showNotification('MindVault not connected', 'error');
            return;
          }

          if (response.credentials && response.credentials.length > 0) {
            await fillLoginForm(response.credentials);
          } else {
            showNotification('No credentials found', 'warning');
          }
        }
      );
    } catch (error) {
      console.error('[MindVault] AutoFill error:', error);
      showNotification('AutoFill failed', 'error');
    }
  }

  // Add indicator icon on login forms
  function addAutoFillIndicator() {
    const { passwordField } = findLoginFields();
    
    if (passwordField && !passwordField.dataset.mindvaultIndicator) {
      passwordField.dataset.mindvaultIndicator = 'true';
      
      const indicator = document.createElement('div');
      indicator.innerHTML = '🔐';
      indicator.title = 'MindVault AutoFill available (Ctrl+Shift+A)';
      indicator.style.cssText = `
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 20px;
        z-index: 1000;
      `;
      
      // Make parent relative if not already
      const parent = passwordField.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      
      indicator.addEventListener('click', triggerAutoFill);
      parent.appendChild(indicator);
    }
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerAutoFill') {
      triggerAutoFill();
    } else if (request.action === 'pageLoaded') {
      if (CONFIG.AUTO_DETECT_FORMS) {
        setTimeout(addAutoFillIndicator, 1000);
      }
    }
  });

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (CONFIG.AUTO_DETECT_FORMS) {
        addAutoFillIndicator();
      }
    });
  } else {
    if (CONFIG.AUTO_DETECT_FORMS) {
      addAutoFillIndicator();
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  console.log('[MindVault] AutoFill extension loaded');
})();
