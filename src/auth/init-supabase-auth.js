/**
 * Shared Supabase Authentication Module
 * Provides unified authentication for all Sailor Skills admin services
 *
 * Usage:
 *   import { initSupabaseAuth } from './shared/src/auth/init-supabase-auth.js';
 *   await initSupabaseAuth({ serviceName: 'Admin Dashboard' });
 */

// Supabase configuration (same across all services)
const SUPABASE_URL = 'https://fzygakldvvzxmahkdylq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk';

let supabase = null;
let currentUser = null;

/**
 * Initialize Supabase Authentication
 * @param {Object} options - Configuration options
 * @param {string} options.serviceName - Name of the service for display in login modal
 * @param {boolean} options.hideContentOnLoad - Whether to hide content until authenticated (default: false)
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export async function initSupabaseAuth(options = {}) {
  const {
    serviceName = 'Sailor Skills Admin',
    hideContentOnLoad = false
  } = options;

  // Wait for Supabase library to load
  while (typeof window.supabase === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Initialize Supabase client
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log(`✅ Supabase initialized for ${serviceName}`);

  // Make supabase globally available
  window.supabaseClient = supabase;

  // Check for auth tokens in URL hash (from SSO redirect)
  if (window.location.hash.includes('access_token')) {
    console.log('🔑 Auth tokens detected in URL hash, processing...');
    // Wait for Supabase to automatically process the hash tokens
    await new Promise(resolve => setTimeout(resolve, 500));
    // Clear the hash from URL to prevent reprocessing on refresh
    const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
    history.replaceState(null, '', cleanUrl);
  }

  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not authenticated - redirect to SSO login
    console.log('❌ No session found - redirecting to SSO login');
    // Use origin + pathname + search (exclude hash to prevent redirect loops)
    const currentUrl = window.location.origin + window.location.pathname + window.location.search;
    const redirectUrl = encodeURIComponent(currentUrl);
    window.location.href = `https://login.sailorskills.com/login.html?redirect=${redirectUrl}`;
    return false;
  } else {
    // Authenticated
    currentUser = session.user;
    console.log('✅ User authenticated:', session.user.email);

    // Setup logout function
    setupLogout();

    return true;
  }
}

/**
 * Hide page content
 */
function hideContent() {
  const mainContent = document.querySelector('.main-content, .container, .dashboard-container');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.pointerEvents = 'none';
  }
}

/**
 * Show page content
 */
function showContent() {
  const mainContent = document.querySelector('.main-content, .container, .dashboard-container');
  if (mainContent) {
    mainContent.style.opacity = '1';
    mainContent.style.pointerEvents = 'auto';
  }
}

/**
 * Show login modal
 * @param {string} serviceName - Name of service for display
 */
function showLoginModal(serviceName) {
  return new Promise((resolve) => {
    // Remove existing modal if present
    const existingModal = document.getElementById('auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 24px;">🔒 ${serviceName}</h2>
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Sign in to continue</p>
        </div>
        <form id="auth-form" style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50; font-size: 14px;">Email</label>
            <input
              type="email"
              id="auth-email"
              required
              placeholder="admin@sailorskills.com"
              autocomplete="email"
              style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#ddd'"
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50; font-size: 14px;">Password</label>
            <input
              type="password"
              id="auth-password"
              required
              placeholder="Enter your password"
              autocomplete="current-password"
              style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#ddd'"
            />
          </div>
          <div id="auth-error" style="display: none; padding: 12px; background: #ffe6e6; border: 1px solid #ffcccc; border-radius: 6px; color: #d63031; font-size: 14px;"></div>
          <button
            type="submit"
            style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)';"
          >
            Sign In
          </button>
        </form>
        <div style="margin-top: 20px; text-align: center;">
          <p style="margin: 0; color: #95a5a6; font-size: 12px;">Contact your administrator if you need access</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus email input
    setTimeout(() => document.getElementById('auth-email')?.focus(), 100);

    // Handle form submission
    const form = document.getElementById('auth-form');
    const errorDiv = document.getElementById('auth-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const submitBtn = form.querySelector('button[type="submit"]');

      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        currentUser = data.user;
        console.log('✅ Login successful:', data.user.email);

        // Setup logout
        setupLogout();

        // Show content and remove modal
        showContent();
        modal.remove();

        // Dispatch event for app to respond to
        document.dispatchEvent(new CustomEvent('supabase-authenticated', {
          detail: { user: data.user }
        }));

        resolve(true);

      } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = error.message || 'Authentication failed';
        errorDiv.style.display = 'block';
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-password').focus();
      }
    });
  });
}

/**
 * Setup logout function
 */
function setupLogout() {
  window.logout = async function() {
    await supabase.auth.signOut();
    currentUser = null;
    console.log('🔓 User logged out');
    window.location.reload();
  };
}

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Get Supabase client
 * @returns {Object} Supabase client
 */
export function getSupabaseClient() {
  return supabase;
}

export default initSupabaseAuth;
