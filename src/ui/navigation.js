/**
 * Sailor Skills - Shared Navigation Component
 * Standardized navigation header for all microservices
 */

/**
 * Centralized sub-page navigation configuration
 * Each entry defines which services should display the link
 */
const SUB_PAGE_LINKS = [
    {
        label: 'Transactions',
        url: '/transactions',
        icon: '💳',
        services: ['billing']
    },
    {
        label: 'Invoices',
        url: '/invoices',
        icon: '📄',
        services: ['billing']
    },
    {
        label: 'My Billing',
        url: '/billing',
        icon: '💰',
        services: ['portal']
    }
];

/**
 * Get sub-page links for a specific service
 * @param {string} serviceName - Name of the service (e.g., 'billing', 'operations', 'portal')
 * @returns {Array} Array of sub-page links for the service
 */
export function getSubPagesForService(serviceName) {
    return SUB_PAGE_LINKS.filter(link => link.services.includes(serviceName));
}

/**
 * Create standardized global navigation header (Tier 2 - Middle Navigation)
 * Displays main service links with grouped dropdowns for better space management
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page ('insight'|'billing'|'operations'|'portal'|'customers'|'inventory'|'video'|'estimator')
 * @returns {string} HTML string for the navigation header
 */
export function createGlobalNav(options = {}) {
    const { currentPage } = options;

    // Determine if this is a public-facing service or internal service
    // Public services: Estimator only
    // Customer-facing: Customers portal
    // Internal services: Dashboard, Billing, Operations, Inventory, Video
    const isPublicService = currentPage === 'estimator';
    const isCustomerPortal = currentPage === 'customers';

    let navHTML;
    if (isPublicService) {
        // Public navigation for Estimator and Site
        const navItems = [
            { id: 'home', label: 'HOME', url: 'https://www.sailorskills.com/' },
            { id: 'training', label: 'TRAINING', url: 'https://www.sailorskills.com/training' },
            { id: 'diving', label: 'DIVING', url: 'https://www.sailorskills.com/diving' },
            { id: 'detailing', label: 'DETAILING', url: 'https://www.sailorskills.com/detailing' },
            { id: 'deliveries', label: 'DELIVERIES', url: 'https://www.sailorskills.com/deliveries' }
        ];
        navHTML = navItems.map(item => {
            const activeClass = item.id === currentPage ? ' class="active"' : '';
            return `<a href="${item.url}"${activeClass}>${item.label}</a>`;
        }).join('\n                ');
    } else if (isCustomerPortal) {
        // Customer portal navigation (minimal)
        const navItems = [
            { id: 'home', label: 'HOME', url: 'https://www.sailorskills.com/' },
            { id: 'contact', label: 'CONTACT', url: 'https://www.sailorskills.com/contact' }
        ];
        navHTML = navItems.map(item => {
            const activeClass = item.id === currentPage ? ' class="active"' : '';
            return `<a href="${item.url}"${activeClass}>${item.label}</a>`;
        }).join('\n                ');
    } else {
        // Internal navigation with grouped dropdowns (reduced from 10 to 5 items)
        const customerToolsPages = ['marketing', 'estimator', 'portal', 'booking'];
        const adminToolsPages = ['inventory', 'video'];

        const isCustomerToolsActive = customerToolsPages.includes(currentPage);
        const isAdminToolsActive = adminToolsPages.includes(currentPage);

        // Main navigation items with dropdowns
        navHTML = `
                <a href="https://sailorskills-operations.vercel.app" ${currentPage === 'operations' ? 'class="active"' : ''}>OPERATIONS</a>
                <a href="https://sailorskills-billing.vercel.app" ${currentPage === 'billing' ? 'class="active"' : ''}>BILLING</a>
                <div class="nav-dropdown${isCustomerToolsActive ? ' active' : ''}">
                    <button class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                        CUSTOMER TOOLS <span class="dropdown-arrow">▾</span>
                    </button>
                    <div class="nav-dropdown-menu">
                        <a href="https://sailorskills-marketing.vercel.app" ${currentPage === 'marketing' ? 'class="active"' : ''}>Marketing</a>
                        <a href="https://sailorskills-estimator.vercel.app" ${currentPage === 'estimator' ? 'class="active"' : ''}>Estimator</a>
                        <a href="https://sailorskills-portal.vercel.app" ${currentPage === 'portal' ? 'class="active"' : ''}>Portal</a>
                        <a href="https://sailorskills-booking.vercel.app" ${currentPage === 'booking' ? 'class="active"' : ''}>Booking</a>
                    </div>
                </div>
                <div class="nav-dropdown${isAdminToolsActive ? ' active' : ''}">
                    <button class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                        ADMIN TOOLS <span class="dropdown-arrow">▾</span>
                    </button>
                    <div class="nav-dropdown-menu">
                        <a href="https://sailorskills-inventory.vercel.app" ${currentPage === 'inventory' ? 'class="active"' : ''}>Inventory</a>
                        <a href="https://sailorskills-video.vercel.app" ${currentPage === 'video' ? 'class="active"' : ''}>Video</a>
                    </div>
                </div>
                <a href="https://sailorskills-insight.vercel.app" ${currentPage === 'insight' ? 'class="active"' : ''}>INSIGHT</a>`;
    }

    return `
    <!-- Global Navigation Header -->
    <header class="global-header">
        <div class="global-nav-container">
            <nav class="global-nav">
                ${navHTML}
            </nav>
        </div>
    </header>`;
}

/**
 * Create top navigation bar (Tier 1 - Top Navigation)
 * Displays SAILOR SKILLS logo on the left, Settings icon, and logout link on the right
 * Includes hamburger menu button for mobile
 * @returns {string} HTML string for top navigation bar
 */
export function createTopNav() {
    return `
    <!-- Top Navigation (Tier 1) -->
    <div class="top-nav">
        <a href="https://www.sailorskills.com/" class="nav-logo">SAILOR SKILLS</a>
        <button class="hamburger-menu" id="ss-hamburger-menu" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="top-nav-actions">
            <a href="https://sailorskills-settings.vercel.app" class="settings-link" title="Settings">
                <span class="settings-icon">⚙️</span>
            </a>
            <a href="#" class="logout-link" id="ss-logout-link">Logout</a>
        </div>
    </div>`;
}

/**
 * Create sub-navigation for service-specific pages (Tier 3 - Bottom Navigation)
 * @param {Object} options - Sub-navigation options
 * @param {Array} options.subPages - Array of sub-page objects {id, label, url, icon (optional)}
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
        const iconHTML = page.icon ? `<span class="nav-icon">${page.icon}</span> ` : '';
        return `<a href="${page.url}"${activeClass}>${iconHTML}${page.label}</a>`;
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
 * TWO-TIER NAVIGATION SYSTEM:
 * - Tier 1 (Top): SAILOR SKILLS logo and logout link
 * - Tier 2 (Middle): Main service navigation (DASHBOARD, BILLING, OPERATIONS, etc.)
 * - Tier 3 (Bottom): Service-specific sub-pages (optional)
 *
 * @param {Object} options - Navigation options
 * @param {string} options.currentPage - Current active page (main service)
 * @param {Array} [options.breadcrumbs] - DEPRECATED: Ignored for backward compatibility
 * @param {Array} [options.subPages] - Sub-pages for Tier 3 (service-specific pages)
 * @param {string} [options.currentSubPage] - Current active sub-page ID
 * @param {Function} [options.onLogout] - Optional logout handler
 */
export function injectNavigation(options = {}) {
    const { currentPage, subPages, currentSubPage, onLogout, breadcrumbs } = options;

    // Backward compatibility: breadcrumbs parameter is deprecated but accepted to prevent errors
    if (breadcrumbs) {
        console.warn('Navigation breadcrumbs parameter is deprecated. The top navigation now shows SAILOR SKILLS logo and logout link.');
    }

    // Auto-include service-specific sub-pages from centralized config
    let finalSubPages = subPages || [];
    if (currentPage) {
        const serviceSubPages = getSubPagesForService(currentPage);
        // Convert centralized config format to subPages format
        const formattedServicePages = serviceSubPages.map(link => ({
            id: link.url.replace(/^\/|\.html$/g, ''), // Extract ID from URL
            label: link.label,
            url: link.url,
            icon: link.icon
        }));
        // Merge with any manually provided subPages
        finalSubPages = [...formattedServicePages, ...finalSubPages];
    }

    // Create navigation HTML for all tiers
    const topNavHTML = createTopNav();
    const navHTML = createGlobalNav({ currentPage });
    const subNavHTML = finalSubPages.length > 0 ? createSubNav({ subPages: finalSubPages, currentSubPage }) : '';

    // Inject at the beginning of body
    const body = document.body;
    const navContainer = document.createElement('div');
    navContainer.innerHTML = topNavHTML + navHTML + subNavHTML;

    // Insert before first child - keep reference to avoid reversing order
    const referenceNode = body.firstChild;
    while (navContainer.firstChild) {
        body.insertBefore(navContainer.firstChild, referenceNode);
    }

    // Attach logout event listener after DOM injection
    const logoutLink = document.getElementById('ss-logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (onLogout && typeof onLogout === 'function') {
                onLogout();
            } else if (window.supabaseAuth && typeof window.supabaseAuth.signOut === 'function') {
                window.supabaseAuth.signOut();
            } else {
                console.warn('No logout handler available. Please configure Supabase auth or provide an onLogout function.');
            }
        });
    }

    // Attach hamburger menu event listener for mobile
    const hamburgerMenu = document.getElementById('ss-hamburger-menu');
    const globalHeader = document.querySelector('.global-header');
    if (hamburgerMenu && globalHeader) {
        hamburgerMenu.addEventListener('click', function() {
            globalHeader.classList.toggle('mobile-menu-open');
            hamburgerMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!globalHeader.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                globalHeader.classList.remove('mobile-menu-open');
                hamburgerMenu.classList.remove('active');
            }
        });

        // Close menu when clicking a nav link
        const navLinks = globalHeader.querySelectorAll('.global-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                globalHeader.classList.remove('mobile-menu-open');
                hamburgerMenu.classList.remove('active');
            });
        });
    }

    // Attach dropdown menu event listeners
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.parentElement;
            const isOpen = dropdown.classList.contains('open');

            // Close all other dropdowns
            document.querySelectorAll('.nav-dropdown.open').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('open');
                    d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current dropdown
            if (isOpen) {
                dropdown.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            } else {
                dropdown.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
            });
        }
    });
}

/**
 * Initialize navigation for a page
 * TWO-TIER NAVIGATION SYSTEM (with optional third tier for sub-pages)
 *
 * Usage Example:
 * import { initNavigation } from '@sailorskills/shared/ui/navigation';
 *
 * initNavigation({
 *   // Tier 2: Main service navigation
 *   currentPage: 'insight',
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
 *   currentSubPage: 'dashboard',
 *
 *   // Optional logout handler
 *   onLogout: () => { console.log('logging out'); }
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
    createTopNav,
    createSubNav,
    injectNavigation,
    initNavigation,
    getSubPagesForService
};
