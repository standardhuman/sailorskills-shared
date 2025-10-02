// Supabase Authentication for Sailor Skills Inventory
// Provides robust authentication using Supabase Auth

class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.sessionKey = 'supabase_auth_session';

        this.init();
    }

    async init() {
        // Wait for Supabase config to load
        await this.waitForConfig();

        // Initialize Supabase client
        this.initSupabase();

        // Check for existing session
        await this.checkSession();
    }

    async waitForConfig() {
        let attempts = 0;
        while (!window.SUPABASE_URL && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.SUPABASE_URL) {
            console.error('Supabase configuration not loaded');
            throw new Error('Configuration not available');
        }
    }

    initSupabase() {
        const supabaseUrl = window.SUPABASE_URL;
        const supabaseKey = window.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials missing');
            return;
        }

        this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase Auth initialized');
    }

    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error) {
                console.error('Session check error:', error);
                return false;
            }

            if (session && session.user) {
                this.currentUser = session.user;
                console.log('✅ User authenticated:', session.user.email);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            this.currentUser = data.user;
            console.log('✅ Sign in successful:', data.user.email);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();

            if (error) {
                throw error;
            }

            this.currentUser = null;
            console.log('✅ Sign out successful');
            window.location.reload();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async requireAuth() {
        const isAuthenticated = await this.checkSession();

        if (!isAuthenticated) {
            return await this.showLoginPrompt();
        }

        return true;
    }

    async showLoginPrompt() {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'auth-modal';
            modal.innerHTML = `
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>🔒 Sailor Skills Admin</h2>
                        <p>Sign in to access Inventory Management</p>
                    </div>
                    <form id="supabase-auth-form" class="auth-form">
                        <div class="form-group">
                            <label for="auth-email">Email</label>
                            <input
                                type="email"
                                id="auth-email"
                                name="email"
                                required
                                placeholder="admin@sailorskills.com"
                                autocomplete="email"
                            />
                        </div>
                        <div class="form-group">
                            <label for="auth-password">Password</label>
                            <input
                                type="password"
                                id="auth-password"
                                name="password"
                                required
                                placeholder="Enter your password"
                                autocomplete="current-password"
                            />
                        </div>
                        <div id="auth-error" class="auth-error" style="display: none;"></div>
                        <button type="submit" class="auth-submit">Sign In</button>
                    </form>
                    <div class="auth-footer">
                        <p>Contact your administrator if you need access</p>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle form submission
            const form = document.getElementById('supabase-auth-form');
            const errorDiv = document.getElementById('auth-error');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;

                errorDiv.style.display = 'none';

                const result = await this.signIn(email, password);

                if (result.success) {
                    modal.remove();
                    resolve(true);
                } else {
                    errorDiv.textContent = result.error || 'Authentication failed';
                    errorDiv.style.display = 'block';
                }
            });

            // Prevent closing modal by clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    e.stopPropagation();
                }
            });
        });
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize auth when DOM is ready
let supabaseAuth = null;

document.addEventListener('DOMContentLoaded', async () => {
    supabaseAuth = new SupabaseAuth();
    await supabaseAuth.requireAuth();
});

// Make globally available
window.supabaseAuth = supabaseAuth;
