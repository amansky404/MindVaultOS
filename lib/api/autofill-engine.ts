/**
 * AutoFill Engine
 * Smart credential filling with human-like typing simulation
 */

export interface AutoFillConfig {
  username: string;
  password: string;
  autoSubmit?: boolean;
  multiStep?: boolean;
  delay?: number;
  humanLike?: boolean;
}

export interface FieldMapping {
  selector: string;
  value: string;
  type: 'username' | 'password' | 'custom';
  delay?: number;
}

/**
 * Human-like typing simulation
 * Simulates natural typing patterns to bypass paste-blocking
 */
export class HumanTypingSimulator {
  private static readonly MIN_DELAY = 50;
  private static readonly MAX_DELAY = 150;
  private static readonly MISTAKE_PROBABILITY = 0.02; // 2% chance of typo

  /**
   * Get random typing delay
   */
  private static getRandomDelay(): number {
    return Math.random() * (this.MAX_DELAY - this.MIN_DELAY) + this.MIN_DELAY;
  }

  /**
   * Simulate human-like typing
   */
  static async typeText(
    text: string,
    element: HTMLInputElement | HTMLTextAreaElement,
    options: { humanLike?: boolean; speed?: number } = {}
  ): Promise<void> {
    const { humanLike = true, speed = 1 } = options;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Simulate occasional typos in human-like mode
      if (humanLike && Math.random() < this.MISTAKE_PROBABILITY && i > 0) {
        // Type wrong character
        const wrongChar = String.fromCharCode(char.charCodeAt(0) + 1);
        element.value += wrongChar;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait before correcting
        await this.delay(this.getRandomDelay() * speed);
        
        // Delete wrong character
        element.value = element.value.slice(0, -1);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        await this.delay(this.getRandomDelay() * speed);
      }

      // Type correct character
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));

      // Random delay between keystrokes
      if (humanLike) {
        await this.delay(this.getRandomDelay() * speed);
      } else {
        await this.delay(10);
      }
    }

    // Final change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * AutoFill Engine for Browser
 */
export class BrowserAutoFill {
  /**
   * Fill login form with credentials
   */
  static async fillLogin(
    config: AutoFillConfig,
    fieldMappings?: FieldMapping[]
  ): Promise<boolean> {
    try {
      let usernameField: HTMLInputElement | null = null;
      let passwordField: HTMLInputElement | null = null;

      // Use field mappings if provided
      if (fieldMappings && fieldMappings.length > 0) {
        for (const mapping of fieldMappings) {
          const element = document.querySelector(mapping.selector) as HTMLInputElement;
          if (element) {
            if (mapping.type === 'username') {
              usernameField = element;
            } else if (mapping.type === 'password') {
              passwordField = element;
            }
          }
        }
      } else {
        // Auto-detect fields
        usernameField = this.findUsernameField();
        passwordField = this.findPasswordField();
      }

      if (!usernameField || !passwordField) {
        console.error('[AutoFill] Could not find login fields');
        return false;
      }

      // Fill username
      if (config.humanLike) {
        await HumanTypingSimulator.typeText(config.username, usernameField, {
          humanLike: true,
        });
      } else {
        usernameField.value = config.username;
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Small delay between fields
      await this.delay(config.delay || 300);

      // Fill password
      if (config.humanLike) {
        await HumanTypingSimulator.typeText(config.password, passwordField, {
          humanLike: true,
        });
      } else {
        passwordField.value = config.password;
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Auto-submit if configured
      if (config.autoSubmit) {
        await this.delay(500);
        this.submitForm(passwordField);
      }

      return true;
    } catch (error) {
      console.error('[AutoFill] Error filling form:', error);
      return false;
    }
  }

  /**
   * Find username field
   */
  private static findUsernameField(): HTMLInputElement | null {
    const selectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLInputElement;
      if (element && element.offsetParent !== null) {
        return element;
      }
    }

    return null;
  }

  /**
   * Find password field
   */
  private static findPasswordField(): HTMLInputElement | null {
    const selectors = [
      'input[type="password"]',
      'input[autocomplete="current-password"]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLInputElement;
      if (element && element.offsetParent !== null) {
        return element;
      }
    }

    return null;
  }

  /**
   * Submit form
   */
  private static submitForm(element: HTMLElement): void {
    const form = element.closest('form');
    if (form) {
      form.submit();
    } else {
      // Try to find and click submit button
      const submitButton = document.querySelector(
        'button[type="submit"], input[type="submit"]'
      ) as HTMLButtonElement;
      if (submitButton) {
        submitButton.click();
      }
    }
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
