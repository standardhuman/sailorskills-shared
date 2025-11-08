/**
 * Cookie utilities for cross-subdomain authentication
 */

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
  return null
}

/**
 * Set cookie with options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export function setCookie(name, value, options = {}) {
  const {
    domain = '',
    path = '/',
    maxAge = 604800, // 7 days default
    sameSite = 'lax',
    secure = true
  } = options

  let cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; samesite=${sameSite}`

  if (domain) {
    cookie += `; domain=${domain}`
  }

  if (secure) {
    cookie += '; secure'
  }

  document.cookie = cookie
}

/**
 * Delete cookie by name
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options (must match original)
 */
export function deleteCookie(name, options = {}) {
  setCookie(name, '', { ...options, maxAge: -1 })
}

/**
 * Custom storage for Supabase that uses cookies with domain
 */
export const customStorage = {
  getItem: (key) => {
    // Try localStorage first (faster), fallback to cookie
    const localValue = localStorage.getItem(key)
    if (localValue) return localValue
    return getCookie(key)
  },

  setItem: (key, value) => {
    // Set in both localStorage and cookie for redundancy
    localStorage.setItem(key, value)
    setCookie(key, value, { domain: '.sailorskills.com' })
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
    deleteCookie(key, { domain: '.sailorskills.com' })
  }
}
