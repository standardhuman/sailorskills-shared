/**
 * Sailor Skills - Shared Navigation Component
 * Standardized navigation header for all microservices
 */

/**
 * Create standardized global navigation header
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page ('admin'|'billing'|'inventory'|'schedule'|'estimator')
 * @param {Function} [options.onLogout] - Optional logout handler
 * @returns {string} HTML string for the navigation header
 */
export function createGlobalNav(options = {}) {
    const { currentPage, onLogout } = options;

    const navItems = [
        { id: 'home', label: 'HOME', url: 'https://www.sailorskills.com/' },
        { id: 'training', label: 'TRAINING', url: 'https://www.sailorskills.com/training' },
        { id: 'diving', label: 'DIVING', url: 'https://www.sailorskills.com/diving' },
        { id: 'detailing', label: 'DETAILING', url: 'https://www.sailorskills.com/detailing' },
        { id: 'deliveries', label: 'DELIVERIES', url: 'https://www.sailorskills.com/deliveries' }
    ];

    const navHTML = navItems.map(item => {
        const activeClass = item.id === currentPage ? ' class="active"' : '';
        return `<a href="${item.url}"${activeClass}>${item.label}</a>`;
    }).join('\n                ');

    const logoutHandler = onLogout ? onLogout : 'window.supabaseAuth?.signOut()';

    return `
    <!-- Global Navigation Header -->
    <header class="global-header">
        <div class="global-nav-container">
            <a href="https://www.sailorskills.com/" class="nav-logo">SAILOR SKILLS</a>
            <nav class="global-nav">
                ${navHTML}
            </nav>
            <button class="nav-btn logout-btn" onclick="${logoutHandler}">🔒 Logout</button>
        </div>
    </header>`;
}

/**
 * Create breadcrumb trail
 * @param {Array} breadcrumbs - Array of breadcrumb objects {label, url}
 * @returns {string} HTML string for breadcrumb trail
 */
export function createBreadcrumb(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) {
        return '';
    }

    const items = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast) {
            return `<span class="current">${crumb.label}</span>`;
        } else {
            return `<a href="${crumb.url}">${crumb.label}</a>
        <span class="separator">›</span>`;
        }
    }).join('\n        ');

    return `
    <!-- Breadcrumb -->
    <div class="breadcrumb">
        ${items}
    </div>`;
}

/**
 * Inject navigation into DOM
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page
 * @param {Array} options.breadcrumbs - Breadcrumb trail
 * @param {Function} [options.onLogout] - Optional logout handler
 */
export function injectNavigation(options = {}) {
    const { currentPage, breadcrumbs, onLogout } = options;

    // Create navigation HTML
    const navHTML = createGlobalNav({ currentPage, onLogout });
    const breadcrumbHTML = breadcrumbs ? createBreadcrumb(breadcrumbs) : '';

    // Inject at the beginning of body
    const body = document.body;
    const navContainer = document.createElement('div');
    navContainer.innerHTML = navHTML + breadcrumbHTML;

    // Insert before first child
    while (navContainer.firstChild) {
        body.insertBefore(navContainer.firstChild, body.firstChild);
    }
}

/**
 * Initialize navigation for a page
 * Usage:
 * import { initNavigation } from '@sailorskills/shared/ui/navigation';
 * initNavigation({
 *   currentPage: 'inventory',
 *   breadcrumbs: [
 *     { label: 'Home', url: 'https://www.sailorskills.com/' },
 *     { label: 'Admin', url: 'https://sailorskills-billing.vercel.app/admin.html' },
 *     { label: 'Inventory' }
 *   ]
 * });
 */
export function initNavigation(options = {}) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => injectNavigation(options));
    } else {
        injectNavigation(options);
    }
}

// Default export
export default {
    createGlobalNav,
    createBreadcrumb,
    injectNavigation,
    initNavigation
};
