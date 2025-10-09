/**
 * Supabase Authentication for Sailor Skills Admin
 * Replaces simple password-based auth with proper Supabase authentication
 */

// Supabase configuration
const SUPABASE_URL = 'https://fzygakldvvzxmahkdylq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk';

// Initialize Supabase client
let supabase = null;

// Initialize Supabase
async function initSupabase() {
  // Wait for Supabase library to load
  while (typeof window.supabase === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized for Admin');
  return supabase;
}

/**
 * Check if user is authenticated
 */
async function checkAuth() {
  if (!supabase) {
    await initSupabase();
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not authenticated - show login modal
    await showLoginModal();
  } else {
    // Authenticated - show content
    console.log('✅ Admin authenticated:', session.user.email);
    document.dispatchEvent(new CustomEvent('admin-authenticated', {
      detail: { user: session.user }
    }));
  }

  return session !== null;
}

/**
 * Show login modal
 */
function showLoginModal() {
  return new Promise((resolve) => {
    // Check if modal already exists
    let modal = document.getElementById('auth-modal');
    if (modal) {
      modal.remove();
    }

    // Create login modal
    modal = document.createElement('div');
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
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 12px; max-width: 400px; width: 90%;">
        <h2 style="margin: 0 0 10px 0; color: #2c3e50; text-align: center;">🔒 Admin Dashboard</h2>
        <p style="margin: 0 0 30px 0; color: #7f8c8d; text-align: center; font-size: 14px;">
          Sign in to access admin panel
        </p>
        <form id="login-form" style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Email</label>
            <input
              type="email"
              id="auth-email"
              required
              placeholder="admin@sailorskills.com"
              style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              autocomplete="email"
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Password</label>
            <input
              type="password"
              id="auth-password"
              required
              placeholder="Enter your password"
              style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              autocomplete="current-password"
            >
          </div>
          <div id="auth-error" style="display: none; padding: 12px; background: #ffe6e6; border: 1px solid #ffcccc; border-radius: 6px; color: #d63031; font-size: 14px;"></div>
          <button
            type="submit"
            style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s;"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'"
          >
            Sign In
          </button>
        </form>
        <p style="margin: 20px 0 0 0; text-align: center; color: #95a5a6; font-size: 12px;">
          Contact your administrator if you need access
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus email input
    setTimeout(() => document.getElementById('auth-email')?.focus(), 100);

    // Handle login
    const form = document.getElementById('login-form');
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

        console.log('✅ Login successful:', data.user.email);
        modal.remove();

        // Dispatch authenticated event
        document.dispatchEvent(new CustomEvent('admin-authenticated', {
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
 * Logout function
 */
window.logout = async function() {
  if (!supabase) {
    await initSupabase();
  }

  await supabase.auth.signOut();
  console.log('🔓 Admin logged out');
  window.location.reload();
};

/**
 * Get current user
 */
async function getCurrentUser() {
  if (!supabase) {
    await initSupabase();
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// Run auth check on page load
checkAuth().then(authenticated => {
  if (authenticated) {
    console.log('✅ Admin dashboard ready');
  }
}).catch(error => {
  console.error('Authentication error:', error);
  alert('Authentication error. Please refresh the page.');
});

// Export for use in other modules
export { checkAuth, getCurrentUser, supabase };
