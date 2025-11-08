import { getCurrentUser } from './auth-core.js'

const LOGIN_URL = 'https://login.sailorskills.com/login.html'

/**
 * Base authentication check
 * Redirects to login if not authenticated
 * @returns {Promise<Object|boolean>} User object or false
 */
export async function requireAuth() {
  const { user } = await getCurrentUser()

  if (!user) {
    // Store intended destination for redirect after login
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.href)
    }
    window.location.href = LOGIN_URL
    return false
  }

  return user
}

/**
 * Customer-only access (Portal, Booking)
 * Allows: customer, admin
 * @returns {Promise<Object|boolean>} User + role or false
 */
export async function requireCustomer() {
  const { user, role } = await getCurrentUser()

  if (!user || !['customer', 'admin'].includes(role)) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.href)
    }
    window.location.href = LOGIN_URL
    return false
  }

  return { user, role }
}

/**
 * Staff access (Operations, Billing, Inventory)
 * Allows: staff, admin
 * @returns {Promise<Object|boolean>} User + role or false
 */
export async function requireStaff() {
  const { user, role } = await getCurrentUser()

  if (!user || !['staff', 'admin'].includes(role)) {
    showAccessDenied('This service requires staff access')
    return false
  }

  return { user, role }
}

/**
 * Admin-only access (Settings)
 * Allows: admin only
 * @returns {Promise<Object|boolean>} User + role or false
 */
export async function requireAdmin() {
  const { user, role } = await getCurrentUser()

  if (!user || role !== 'admin') {
    showAccessDenied('This service requires admin access')
    return false
  }

  return { user, role }
}

/**
 * Show access denied modal
 * @param {string} message - Error message to display
 */
function showAccessDenied(message) {
  const modal = document.createElement('div')
  modal.className = 'access-denied-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      text-align: center;
    ">
      <h2 style="color: #dc2626; margin: 0 0 1rem 0;">🚫 Access Denied</h2>
      <p style="margin: 0 0 1rem 0;">${message}</p>
      <button onclick="window.location.href='https://portal.sailorskills.com'" style="
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      ">Go to Customer Portal</button>
    </div>
  `

  document.body.appendChild(modal)
}
