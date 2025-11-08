import { supabase } from './supabase-client.js'

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success, user?, role?, error?}>}
 */
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Fetch user role from user_profiles
    const { role, serviceAccess } = await getUserRole(data.user.id)

    return {
      success: true,
      user: data.user,
      role,
      serviceAccess
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get current authenticated user with role
 * @returns {Promise<{user, role, serviceAccess}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, role: null, serviceAccess: {} }
    }

    const { role, serviceAccess } = await getUserRole(user.id)

    return { user, role, serviceAccess }
  } catch (error) {
    console.error('Get user error:', error)
    return { user: null, role: null, serviceAccess: {} }
  }
}

/**
 * Get user role from user_profiles table
 * @param {string} userId - User ID
 * @returns {Promise<{role, serviceAccess}>}
 */
export async function getUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, service_access')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no profile exists, check customer_accounts for backward compatibility
      const { data: customerData, error: customerError } = await supabase
        .from('customer_accounts')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (!customerError && customerData) {
        // Customer account exists - they're a customer or admin
        return {
          role: customerData.is_admin ? 'admin' : 'customer',
          serviceAccess: { portal: true, booking: true }
        }
      }

      console.warn('No user profile found for:', userId)
      return { role: null, serviceAccess: {} }
    }

    return {
      role: data.role,
      serviceAccess: data.service_access || {}
    }
  } catch (error) {
    console.error('Get role error:', error)
    return { role: null, serviceAccess: {} }
  }
}

/**
 * Logout current user
 * @returns {Promise<{success, error?}>}
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get current session
 * @returns {Promise<{session, error?}>}
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error

    return { session, error: null }
  } catch (error) {
    console.error('Get session error:', error)
    return { session: null, error: error.message }
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { session } = await getCurrentSession()
  return !!session
}
