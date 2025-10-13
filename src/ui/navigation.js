/**
 * Sailor Skills - Shared Navigation Component
 * Standardized navigation header for all microservices
 */

/**
 * Create standardized global navigation header (Tier 2 - Middle Navigation)
 * Displays main service links: DASHBOARD | BILLING | OPERATIONS | INVENTORY | VIDEO | ESTIMATOR
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page ('dashboard'|'billing'|'operations'|'customers'|'inventory'|'video'|'estimator')
 * @param {Function} [options.onLogout] - Optional logout handler
 * @returns {string} HTML string for the navigation header
 */
export function createGlobalNav(options = {}) {
    const { currentPage, onLogout } = options;

    // Determine if this is a public-facing service or internal service
    // Public services: Estimator only
    // Customer-facing: Customers portal
    // Internal services: Dashboard, Billing, Operations, Inventory, Video
    const isPublicService = currentPage === 'estimator';
    const isCustomerPortal = currentPage === 'customers';

    let navItems;
    if (isPublicService) {
        // Public navigation for Estimator and Site
        navItems = [
            { id: 'home', label: 'HOME', url: 'https://www.sailorskills.com/' },
            { id: 'training', label: 'TRAINING', url: 'https://www.sailorskills.com/training' },
            { id: 'diving', label: 'DIVING', url: 'https://www.sailorskills.com/diving' },
            { id: 'detailing', label: 'DETAILING', url: 'https://www.sailorskills.com/detailing' },
            { id: 'deliveries', label: 'DELIVERIES', url: 'https://www.sailorskills.com/deliveries' }
        ];
    } else if (isCustomerPortal) {
        // Customer portal navigation (minimal)
        navItems = [
            { id: 'home', label: 'HOME', url: 'https://www.sailorskills.com/' },
            { id: 'contact', label: 'CONTACT', url: 'https://www.sailorskills.com/contact' }
        ];
    } else {
        // Internal navigation for Dashboard, Billing, Operations, Inventory, Video, Estimator
        navItems = [
            { id: 'dashboard', label: 'DASHBOARD', url: 'https://sailorskills-dashboard.vercel.app' },
            { id: 'billing', label: 'BILLING', url: 'https://sailorskills-billing.vercel.app' },
            { id: 'operations', label: 'OPERATIONS', url: 'https://sailorskills-operations.vercel.app' },
            { id: 'inventory', label: 'INVENTORY', url: 'https://sailorskills-inventory.vercel.app' },
            { id: 'video', label: 'VIDEO', url: 'https://sailorskills-video.vercel.app' },
            { id: 'estimator', label: 'ESTIMATOR', url: 'https://sailorskills-estimator.vercel.app' }
        ];
    }

    const navHTML = navItems.map(item => {
        const activeClass = item.id === currentPage ? ' class="active"' : '';
        return `<a href="${item.url}"${activeClass}>${item.label}</a>`;
    }).join('\n                ');

    const logoutHandler = onLogout ? onLogout : 'window.supabaseAuth?.signOut()';

    return `
    <!-- Global Navigation Header -->
    <header class="global-header">
        <div class="global-nav-container">
            <nav class="global-nav">
                ${navHTML}
            </nav>
            <button class="nav-btn logout-btn" onclick="${logoutHandler}">🔒 Logout</button>
        </div>
    </header>`;
}

/**
 * Create breadcrumb trail (Tier 1 - Top Navigation)
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
    <!-- Breadcrumb (Tier 1) -->
    <div class="breadcrumb">
        ${items}
    </div>`;
}

/**
 * Create sub-navigation for service-specific pages (Tier 3 - Bottom Navigation)
 * @param {Object} options - Sub-navigation options
 * @param {Array} options.subPages - Array of sub-page objects {id, label, url}
 * @param {string} options.currentSubPage - Current active sub-page ID
 * @returns {string} HTML string for sub-navigation
 */
export function createSubNav(options = {}) {
    const { subPages, currentSubPage } = options;

    if (!subPages || subPages.length === 0) {
        return '';
    }

    const navItems = subPages.map(page => {
        const activeClass = page.id === currentSubPage ? ' class="active"' : '';
        return `<a href="${page.url}"${activeClass}>${page.label}</a>`;
    }).join('\n                ');

    return `
    <!-- Sub-Navigation (Tier 3) -->
    <nav class="sub-nav">
        <div class="sub-nav-container">
            ${navItems}
        </div>
    </nav>`;
}

/**
 * Inject navigation into DOM
 * THREE-TIER NAVIGATION SYSTEM:
 * - Tier 1 (Top): Breadcrumb trail
 * - Tier 2 (Middle): Main service navigation (DASHBOARD, BILLING, OPERATIONS, etc.)
 * - Tier 3 (Bottom): Service-specific sub-pages
 *
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page (main service)
 * @param {Array} options.breadcrumbs - Breadcrumb trail for Tier 1
 * @param {Array} [options.subPages] - Sub-pages for Tier 3 (service-specific pages)
 * @param {string} [options.currentSubPage] - Current active sub-page ID
 * @param {Function} [options.onLogout] - Optional logout handler
 */
export function injectNavigation(options = {}) {
    const { currentPage, breadcrumbs, subPages, currentSubPage, onLogout } = options;

    // Create navigation HTML for all three tiers
    const navHTML = createGlobalNav({ currentPage, onLogout });
    const breadcrumbHTML = breadcrumbs ? createBreadcrumb(breadcrumbs) : '';
    const subNavHTML = subPages ? createSubNav({ subPages, currentSubPage }) : '';

    // Inject at the beginning of body
    const body = document.body;
    const navContainer = document.createElement('div');
    navContainer.innerHTML = breadcrumbHTML + navHTML + subNavHTML;

    // Insert before first child
    while (navContainer.firstChild) {
        body.insertBefore(navContainer.firstChild, body.firstChild);
    }
}

/**
 * Initialize navigation for a page
 * THREE-TIER NAVIGATION SYSTEM
 *
 * Usage Example:
 * import { initNavigation } from '@sailorskills/shared/ui/navigation';
 *
 * initNavigation({
 *   // Tier 2: Main service navigation
 *   currentPage: 'dashboard',
 *
 *   // Tier 1: Breadcrumb trail
 *   breadcrumbs: [
 *     { label: 'Home', url: 'https://www.sailorskills.com/' },
 *     { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
 *     { label: 'Dashboard' }
 *   ],
 *
 *   // Tier 3: Service-specific sub-pages (OPTIONAL)
 *   subPages: [
 *     { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
 *     { id: 'boats', label: 'Boats & History', url: '/boats.html' },
 *     { id: 'packing', label: 'Packing Lists', url: '/packing.html' },
 *     { id: 'logs', label: 'Service Logs', url: '/logs.html' },
 *     { id: 'schedule', label: 'Schedule', url: '/schedule.html' },
 *     { id: 'alerts', label: 'Paint Alerts', url: '/alerts.html' }
 *   ],
 *   currentSubPage: 'dashboard'
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
    createSubNav,
    injectNavigation,
    initNavigation
};
