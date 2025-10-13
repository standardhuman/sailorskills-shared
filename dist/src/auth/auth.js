/**
 * Authentication utilities
 * Simple password-based auth with session management
 */

export class SimpleAuth {
  constructor(options = {}) {
    this.isAuthenticated = false;
    this.sessionKey = options.sessionKey || 'ss_auth_session';
    this.passwordHash = options.passwordHash || null;
    this.sessionDuration = options.sessionDuration || 8 * 60 * 60 * 1000; // 8 hours

    // Check for existing session
    this.checkSession();
  }

  /**
   * Check if user has valid session
   * @returns {boolean} True if session is valid
   */
  checkSession() {
    const session = sessionStorage.getItem(this.sessionKey);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();

        if (sessionData.expires && sessionData.expires > now) {
          this.isAuthenticated = true;
          return true;
        } else {
          // Session expired
          sessionStorage.removeItem(this.sessionKey);
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        sessionStorage.removeItem(this.sessionKey);
      }
    }

    return false;
  }

  /**
   * Hash password using SHA-256
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Authenticate user with password
   * @param {string} password - Plain text password
   * @param {string} correctHash - Expected password hash
   * @returns {Promise<boolean>} True if authentication successful
   */
  async authenticate(password, correctHash) {
    const hashedPassword = await this.hashPassword(password);

    if (hashedPassword === correctHash) {
      this.isAuthenticated = true;

      // Set session
      const sessionData = {
        authenticated: true,
        expires: new Date().getTime() + this.sessionDuration
      };
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));

      return true;
    }

    return false;
  }

  /**
   * Logout user
   */
  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem(this.sessionKey);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }
}

/**
 * Create auth modal UI
 * @param {Object} options - Modal configuration
 * @returns {Promise<string>} Password entered by user
 */
export function createAuthModal(options = {}) {
  const {
    title = '🔒 Authentication Required',
    subtitle = 'Please enter password to continue',
    placeholder = 'Enter password',
    sessionInfo = 'Session will last 8 hours'
  } = options;

  return new Promise((resolve, reject) => {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'ss-auth-modal';
    modal.innerHTML = `
      <div class="ss-auth-modal-content">
        <div class="ss-auth-header">
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        <form id="ss-auth-form" class="ss-auth-form">
          <div class="ss-form-group">
            <input
              type="password"
              id="ss-auth-password"
              class="ss-auth-input"
              placeholder="${placeholder}"
              autocomplete="current-password"
              required
            >
          </div>
          <div class="ss-auth-error" id="ss-auth-error" style="display: none;">
            ❌ Incorrect password. Please try again.
          </div>
          <button type="submit" class="ss-auth-btn">Unlock</button>
        </form>
        <div class="ss-auth-footer">
          <small>${sessionInfo}</small>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(modal);

    // Focus password input
    setTimeout(() => {
      document.getElementById('ss-auth-password').focus();
    }, 100);

    // Handle form submission
    const form = document.getElementById('ss-auth-form');
    const errorDiv = document.getElementById('ss-auth-error');
    const passwordInput = document.getElementById('ss-auth-password');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = passwordInput.value;

      // Return password for validation by caller
      resolve({ password, modal, errorDiv, passwordInput });
    });
  });
}

/**
 * Show error in auth modal
 * @param {HTMLElement} errorDiv - Error div element
 * @param {HTMLElement} passwordInput - Password input element
 */
export function showAuthError(errorDiv, passwordInput) {
  errorDiv.style.display = 'block';
  passwordInput.value = '';
  passwordInput.focus();
}

/**
 * Close auth modal
 * @param {HTMLElement} modal - Modal element
 */
export function closeAuthModal(modal) {
  modal.remove();
}
