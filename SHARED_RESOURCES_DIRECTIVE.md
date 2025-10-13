# Sailor Skills Shared Resources & Design System Directive

**Version:** 2.0
**Last Updated:** 2025-10-13
**Status:** Official Standard
**Applies To:** All Sailor Skills microservices

⚠️ **IMPORTANT**: This directive **COMPLETELY REPLACES** all previous navigation and integration directives. If you find conflicting information in other documents, this directive takes precedence.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Three-Tier Navigation System](#three-tier-navigation-system)
3. [Design System Standards](#design-system-standards)
4. [Integration Requirements](#integration-requirements)
5. [Resource Governance](#resource-governance)
6. [File Structure & Paths](#file-structure--paths)
7. [Development Workflow](#development-workflow)
8. [Compliance & Testing](#compliance--testing)
9. [Service-Specific Guidelines](#service-specific-guidelines)

---

## Purpose

This directive establishes the **official standards** for shared resource usage and design consistency across all Sailor Skills microservices. All developers working on Sailor Skills services **MUST** follow these guidelines to ensure:

- **Visual Consistency**: All services look like part of the same product
- **Code Reusability**: Reduce duplication across services
- **Maintainability**: Update once, deploy everywhere
- **Brand Identity**: Unified Sailor Skills experience
- **Quality**: Consistent UX patterns and accessibility

---

## Three-Tier Navigation System

### Overview

All internal Sailor Skills services use a **three-tier navigation structure**:

```
┌─────────────────────────────────────────────────────────┐
│ Tier 1: Breadcrumb Trail                               │
│ Home › Admin › Dashboard                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Tier 2: Main Service Navigation                        │
│ DASHBOARD | BILLING | OPERATIONS | INVENTORY |         │
│ VIDEO | ESTIMATOR                                       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Tier 3: Service-Specific Sub-Pages (Optional)          │
│ Dashboard | Boats & History | Packing Lists |          │
│ Service Logs | Schedule | Paint Alerts                  │
└─────────────────────────────────────────────────────────┘
```

### Tier 1: Breadcrumb Trail

**Purpose**: Shows hierarchical location within the site
**Style**: Light gray background, blue links
**Example**: `Home › Admin › Dashboard`

**Implementation**:
```javascript
breadcrumbs: [
  { label: 'Home', url: 'https://www.sailorskills.com/' },
  { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
  { label: 'Dashboard' } // Current page - no URL
]
```

### Tier 2: Main Service Navigation

**Purpose**: Navigate between major Sailor Skills services
**Style**: White background, blue text, uppercase
**Services**: DASHBOARD | BILLING | OPERATIONS | INVENTORY | VIDEO | ESTIMATOR

**Official Service Names** (Use these exact labels):
- **DASHBOARD** (not "Admin")
- **BILLING**
- **OPERATIONS** (not "Schedule")
- **INVENTORY**
- **VIDEO**
- **ESTIMATOR**

**Implementation**:
```javascript
currentPage: 'dashboard' // Highlights the active service
```

### Tier 3: Service-Specific Sub-Pages

**Purpose**: Navigate between pages within a single service
**Style**: Dark blue background, white text
**When to use**: Services with multiple related pages

**Example** (Dashboard service):
```javascript
subPages: [
  { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
  { id: 'boats', label: 'Boats & History', url: '/boats.html' },
  { id: 'packing', label: 'Packing Lists', url: '/packing.html' },
  { id: 'logs', label: 'Service Logs', url: '/logs.html' },
  { id: 'schedule', label: 'Schedule', url: '/schedule.html' },
  { id: 'alerts', label: 'Paint Alerts', url: '/alerts.html' }
],
currentSubPage: 'dashboard' // Highlights the active sub-page
```

**Guidelines**:
- ✅ Use for services with 3+ related pages
- ✅ Keep labels concise (1-3 words)
- ✅ Use consistent terminology across services
- ❌ Don't duplicate main navigation items
- ❌ Don't nest more than one level deep

### Complete Integration Example

```javascript
import { initNavigation } from 'https://sailorskills-shared.vercel.app/src/ui/navigation.js';

initNavigation({
  // Tier 2: Main service (REQUIRED)
  currentPage: 'dashboard',

  // Tier 1: Breadcrumb trail (REQUIRED)
  breadcrumbs: [
    { label: 'Home', url: 'https://www.sailorskills.com/' },
    { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
    { label: 'Dashboard' }
  ],

  // Tier 3: Sub-pages (OPTIONAL - only if service has multiple pages)
  subPages: [
    { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
    { id: 'boats', label: 'Boats & History', url: '/dashboard/boats.html' },
    { id: 'packing', label: 'Packing Lists', url: '/dashboard/packing.html' }
  ],
  currentSubPage: 'dashboard'
});
```

---

## Design System Standards

### Brand Identity

**Sailor Skills aesthetic:**
- Clean, minimal, professional
- Flat design (minimal shadows)
- High contrast for readability
- Generous whitespace
- Sharp corners (no rounded edges except where explicitly specified)

### Color Palette

**Primary Colors** (REQUIRED for all services):
```css
--ss-primary: #345475           /* Brand blue-gray - headers, primary actions */
--ss-primary-hover: #2a3f5f     /* Hover states */
--ss-primary-light: #5a7fa6     /* Links, highlights */
```

**Text Colors** (REQUIRED):
```css
--ss-text-dark: #181818         /* Primary text - body copy */
--ss-text-medium: #6d7b89       /* Secondary text - subtitles */
--ss-text-light: #777777        /* Tertiary text - captions */
```

**UI Colors** (REQUIRED):
```css
--ss-white: #ffffff
--ss-bg-light: #fafafa          /* Subtle backgrounds */
--ss-border: #d0d0d0            /* Standard borders */
--ss-border-dark: #345475       /* Emphasized borders */
```

**Status Colors** (REQUIRED for user feedback):
```css
--ss-success: #00b894           /* Success states */
--ss-danger: #d63031            /* Errors, destructive actions */
--ss-warning: #fdcb6e           /* Warnings, cautions */
--ss-info: #667eea              /* Information, tips */
```

**❌ DO NOT** hardcode colors. **✅ ALWAYS** use CSS variables.

### Typography

**Font Family** (REQUIRED):
```html
<!-- In <head> of every HTML page -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: var(--ss-font-primary); /* Montserrat, Arial, sans-serif */
```

**Font Sizes** (Standard Scale):
```css
--ss-text-xs: 0.8125rem        /* 13px - Fine print */
--ss-text-sm: 0.875rem         /* 14px - Small text */
--ss-text-base: 1rem           /* 16px - Body text */
--ss-text-lg: 1.25rem          /* 20px - Subheadings */
--ss-text-xl: 1.5rem           /* 24px - Section headers */
--ss-text-2xl: 2.5rem          /* 40px - Page headers */
--ss-text-3xl: 3.125rem        /* 50px - Feature headers */
--ss-text-4xl: 4rem            /* 64px - Hero (mobile) */
--ss-text-hero: 6.25rem        /* 100px - Hero (desktop) */
```

**Typography Rules:**
- ✅ Use Montserrat for all text
- ✅ Use design token font sizes
- ✅ Maintain 1.6 line-height for body text
- ❌ No custom fonts without approval
- ❌ No font sizes outside the scale

### Spacing System

**Standard Spacing Units**:
```css
--ss-space-xs: 0.25rem         /* 4px - Tight spacing */
--ss-space-sm: 0.5rem          /* 8px - Small gaps */
--ss-space-md: 1rem            /* 16px - Standard spacing */
--ss-space-lg: 1.5rem          /* 24px - Section spacing */
--ss-space-xl: 2rem            /* 32px - Large gaps */
--ss-space-2xl: 2.5rem         /* 40px - Major sections */
--ss-space-3xl: 3rem           /* 48px - Hero spacing */
```

**Spacing Rules:**
- ✅ Use spacing variables for margins and padding
- ✅ Use multiples of 4px (0.25rem) for all spacing
- ❌ No arbitrary pixel values (e.g., 13px, 27px)

### Borders & Corners

**CRITICAL: Sharp Corners Policy**

The Sailor Skills brand uses **sharp corners** (no border-radius) for a clean, professional aesthetic.

```css
/* ✅ CORRECT - Sharp corners */
border-radius: var(--ss-radius-none);  /* 0px */

/* ❌ WRONG - No rounded corners */
border-radius: 8px;
border-radius: 0.5rem;
```

**Border Widths**:
```css
--ss-border-width: 1px         /* Standard borders */
--ss-border-width-thick: 2px   /* Emphasized borders */
```

---

## Integration Requirements

### Mandatory Shared Resources

**Every Sailor Skills service MUST include:**

#### 1. Design Tokens (REQUIRED)
```html
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/design-tokens.css">
```

#### 2. Shared Styles (REQUIRED)
```html
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/styles.css">
```

#### 3. Montserrat Font (REQUIRED)
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

#### 4. Three-Tier Navigation (REQUIRED for internal services)
```html
<script type="module">
  import { initNavigation } from 'https://sailorskills-shared.vercel.app/src/ui/navigation.js';

  initNavigation({
    currentPage: 'dashboard',  // Required: Main service
    breadcrumbs: [             // Required: Tier 1
      { label: 'Home', url: 'https://www.sailorskills.com/' },
      { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
      { label: 'Dashboard' }
    ],
    subPages: [                // Optional: Tier 3 (if service has multiple pages)
      { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
      { id: 'boats', label: 'Boats & History', url: '/boats.html' }
    ],
    currentSubPage: 'dashboard'
  });
</script>
```

**Exception:** Public-facing services (like Estimator) do NOT require navigation integration.

### Service URLs & IDs

**Official Service Registry:**

| Service ID | Name | Production URL | Type |
|------------|------|----------------|------|
| `dashboard` | Dashboard | https://sailorskills-dashboard.vercel.app | Internal |
| `billing` | Billing | https://sailorskills-billing.vercel.app | Internal |
| `operations` | Operations | https://sailorskills-operations.vercel.app | Internal |
| `inventory` | Inventory | https://sailorskills-inventory.vercel.app | Internal |
| `video` | Video | https://sailorskills-video.vercel.app | Internal |
| `estimator` | Estimator | https://sailorskills-estimator.vercel.app | **Public** |

**Use these exact IDs** when calling `initNavigation({ currentPage: 'id' })`.

---

## Resource Governance

### What Belongs in Shared Package

**✅ ADD to Shared Package:**

- **UI Components** used by 2+ services
- **Design tokens** (colors, typography, spacing)
- **Shared utilities** (validation, formatting, date handling)
- **Common constants** (business rules, service URLs, status codes)
- **Navigation components**
- **Authentication utilities**
- **API client wrappers** (Supabase, Stripe)

**❌ KEEP in Service Repos:**

- **Service-specific business logic**
- **Unique UI flows** and features
- **Service-specific data models**
- **Custom calculations** (e.g., diving price calculator)
- **Service-specific API endpoints**
- **Service-specific state management**
- **One-off components** unlikely to be reused

---

## File Structure & Paths

### Shared Package Structure

```
sailorskills-shared/
├── src/
│   ├── ui/
│   │   ├── design-tokens.css    # CSS variables (REQUIRED)
│   │   ├── styles.css           # Global styles & navigation
│   │   ├── navigation.js        # Three-tier navigation component
│   │   └── components.js        # Reusable UI components
│   ├── auth/
│   │   ├── supabase-auth.js     # Supabase auth wrapper
│   │   └── simple-auth.js       # Simple password auth
│   └── config/
│       └── constants.js         # Shared constants
├── SHARED_RESOURCES_DIRECTIVE.md  # This file (Version 2.0)
├── NAVIGATION_INTEGRATION.md      # Integration guide
├── README.md                      # Package documentation
└── package.json
```

### Path Reference Guidelines

**CRITICAL: Always use CDN URLs**

```html
<!-- ✅ CORRECT - CDN URLs -->
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/design-tokens.css">
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/styles.css">
<script type="module">
  import { initNavigation } from 'https://sailorskills-shared.vercel.app/src/ui/navigation.js';
</script>
```

```html
<!-- ❌ WRONG - Local paths no longer supported -->
<link rel="stylesheet" href="/shared/src/ui/styles.css">
<link rel="stylesheet" href="./shared/src/ui/styles.css">
<link rel="stylesheet" href="../shared/src/ui/styles.css">
```

**Rule of Thumb:** Always use `https://sailorskills-shared.vercel.app/` CDN URLs for all shared assets.

---

## Development Workflow

### Installing/Updating Shared Package

**Initial Setup (Git Submodule):**
```bash
cd your-service/
git submodule add https://github.com/standardhuman/sailorskills-shared.git shared
git submodule update --init --recursive
```

**Updating to Latest:**
```bash
cd your-service/shared
git pull origin main
cd ..
git add shared
git commit -m "Update shared package to latest"
git push
```

### Making Changes to Shared Package

**Workflow:**

1. **Make changes** in `sailorskills-shared` repo
2. **Test locally** in at least one service
3. **Commit and push** to shared repo
4. **Update submodules** in all affected services
5. **Test in each service** before deploying

---

## Compliance & Testing

### Navigation Compliance Tests

**All internal services MUST pass** the Playwright navigation compliance tests.

**Test Coverage:**
- Global navigation header loads (Tier 2)
- All navigation links present and correct
- Active state correctly highlights current page
- Logout button visible and functional
- Breadcrumb navigation (Tier 1)
- Sub-navigation (Tier 3) if applicable
- Design tokens properly applied

**Running Tests:**
```bash
cd sailorskills-shared
npx playwright test tests/navigation-compliance.spec.js
```

**Requirement:** All **internal** services must achieve **100% pass rate** before production deployment.

### Pre-Deployment Checklist

Before deploying any service:

- [ ] All shared CSS files imported
- [ ] Montserrat font loaded
- [ ] Three-tier navigation initialized correctly
- [ ] Playwright tests passing (if applicable)
- [ ] No hardcoded colors (use CSS variables)
- [ ] No custom fonts (use Montserrat)
- [ ] Sharp corners enforced (no border-radius)
- [ ] Shared submodule up to date
- [ ] Cross-service navigation tested
- [ ] Logout functionality verified
- [ ] Sub-navigation configured (if multiple pages)

---

## Service-Specific Guidelines

### Dashboard Service

**Technology:** Vite
**Service ID:** `dashboard`
**Sub-Pages:** Yes (Dashboard, Boats & History, Packing Lists, etc.)

**Navigation Example:**
```javascript
initNavigation({
  currentPage: 'dashboard',
  breadcrumbs: [
    { label: 'Home', url: 'https://www.sailorskills.com/' },
    { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
    { label: 'Dashboard' }
  ],
  subPages: [
    { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
    { id: 'boats', label: 'Boats & History', url: '/boats.html' },
    { id: 'packing', label: 'Packing Lists', url: '/packing.html' },
    { id: 'logs', label: 'Service Logs', url: '/logs.html' },
    { id: 'schedule', label: 'Schedule', url: '/schedule.html' },
    { id: 'alerts', label: 'Paint Alerts', url: '/alerts.html' }
  ],
  currentSubPage: 'dashboard'
});
```

### Operations Service

**Technology:** Node.js/Express
**Service ID:** `operations`
**Note:** Previously called "Schedule"

**Navigation Example:**
```javascript
initNavigation({
  currentPage: 'operations',
  breadcrumbs: [
    { label: 'Home', url: 'https://www.sailorskills.com/' },
    { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
    { label: 'Operations' }
  ]
  // Add subPages if service has multiple pages
});
```

### Estimator Service

**Technology:** Vite
**Service ID:** `estimator`
**Type:** Public-facing

**Requirements:**
- Uses CDN URLs for design tokens and styles
- **NO navigation integration required** (public-facing)
- **NO breadcrumbs required** (public-facing)
- **Hero headers allowed and encouraged** (public-facing service)

**Integration:**
```html
<!-- Only include design system, NOT navigation -->
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/design-tokens.css">
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/styles.css">
<!-- DO NOT include navigation.js -->

<!-- Hero headers ARE allowed for public-facing services -->
<div class="hero-header">
  <h1>Get Your Free Diving Estimate</h1>
</div>
```

**Status:** ✅ Exempt from navigation requirements (public-facing)

---

## Enforcement & Updates

### This Directive is Official

- **Status:** Mandatory for all Sailor Skills services
- **Version:** 2.0 (Supersedes all previous versions)
- **Authority:** Brian (Product Owner)
- **Updates:** Any changes require team review
- **Questions:** Open GitHub issue or discuss with team

### Violation Handling

**If a service violates these standards:**

1. **Identify** the violation (design, integration, governance)
2. **Document** the issue
3. **Create ticket** to fix
4. **Prioritize** based on severity:
   - **Critical:** Blocks deployment (missing navigation)
   - **High:** Visual inconsistency (wrong colors)
   - **Medium:** Non-compliance (hardcoded values)
   - **Low:** Optimization opportunities

---

## Resources

### Documentation
- [README.md](./README.md) - Package API reference
- [NAVIGATION_INTEGRATION.md](./NAVIGATION_INTEGRATION.md) - Three-tier navigation guide with AI agent prompt
- [design-tokens.css](./src/ui/design-tokens.css) - All CSS variables

### Testing
- [Navigation Tests](./tests/navigation-compliance.spec.js) - Playwright test suite

### Support
- **GitHub Issues:** https://github.com/standardhuman/sailorskills-shared/issues
- **Team Discussion:** Check with team lead

---

## Changelog

### Version 2.0 (2025-10-13)
- **MAJOR UPDATE**: Complete three-tier navigation system
- Added Tier 3 (sub-navigation) for service-specific pages
- Updated service names (DASHBOARD, OPERATIONS)
- Complete rewrite of navigation documentation
- Supersedes all previous navigation directives
- Added comprehensive examples for all tiers

### Version 1.0 (2025-10-04)
- Initial release of Shared Resources Directive
- Established design system standards
- Defined integration requirements
- Created governance policies
- Added compliance testing framework

---

**End of Directive**

This document is the single source of truth for shared resource usage across all Sailor Skills microservices. Follow these standards to ensure a consistent, professional, and maintainable product.
