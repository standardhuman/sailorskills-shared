# Sailor Skills Shared Resources & Design System Directive

**Version:** 1.0
**Last Updated:** 2025-10-04
**Status:** Official Standard
**Applies To:** All Sailor Skills microservices

---

## Table of Contents

1. [Purpose](#purpose)
2. [Design System Standards](#design-system-standards)
3. [Integration Requirements](#integration-requirements)
4. [Resource Governance](#resource-governance)
5. [File Structure & Paths](#file-structure--paths)
6. [Development Workflow](#development-workflow)
7. [Compliance & Testing](#compliance--testing)
8. [Service-Specific Guidelines](#service-specific-guidelines)

---

## Purpose

This directive establishes the **official standards** for shared resource usage and design consistency across all Sailor Skills microservices. All developers working on Sailor Skills services **MUST** follow these guidelines to ensure:

- **Visual Consistency**: All services look like part of the same product
- **Code Reusability**: Reduce duplication across services
- **Maintainability**: Update once, deploy everywhere
- **Brand Identity**: Unified Sailor Skills experience
- **Quality**: Consistent UX patterns and accessibility

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

**Font Weights**:
```css
--ss-weight-normal: 400        /* Body text */
--ss-weight-medium: 500        /* Emphasis */
--ss-weight-semibold: 600      /* Subheadings */
--ss-weight-bold: 700          /* Headers */
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

**Exception:** Minimal rounding (4px) may be used for very specific UI components (e.g., badges, tags) with explicit approval.

### Shadows

**Minimal Shadow Usage** (Flat Design):
```css
--ss-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05)    /* Subtle depth */
--ss-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1)    /* Cards */
--ss-shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.3)   /* Modals */
```

**Shadow Rules:**
- ✅ Use sparingly for depth hierarchy
- ✅ Prefer borders over shadows
- ❌ No heavy drop shadows
- ❌ No glow effects

### Layout

**Container Widths**:
```css
--ss-max-width-sm: 400px       /* Forms, modals */
--ss-max-width-md: 800px       /* Content sections */
--ss-max-width-lg: 980px       /* Main content */
--ss-max-width-xl: 1200px      /* Wide layouts */
--ss-max-width-2xl: 1600px     /* Dashboard grids */
```

**Navigation Height**:
```css
--ss-nav-height: 69px          /* Global navigation */
```

---

## Integration Requirements

### Mandatory Shared Resources

**Every Sailor Skills service MUST include:**

#### 1. Design Tokens (REQUIRED)
```html
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
```

#### 2. Shared Styles (REQUIRED)
```html
<link rel="stylesheet" href="/shared/src/ui/styles.css">
```

#### 3. Montserrat Font (REQUIRED)
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

#### 4. Global Navigation (REQUIRED for internal services)
```html
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';

  initNavigation({
    currentPage: 'your-service-id',  // Required: 'admin', 'portal', 'billing', 'inventory', 'schedule'
    breadcrumbs: [                    // Optional but recommended
      { label: 'Home', url: 'https://www.sailorskills.com/' },
      { label: 'Admin', url: 'https://sailorskills-admin.vercel.app' },
      { label: 'Current Page' }
    ]
  });
</script>
```

**Exception:** Public-facing services (like Estimator) do NOT require global navigation integration.

### Navigation Integration Checklist

Before deploying any **internal** service, ensure:

- [ ] Montserrat font loaded in `<head>`
- [ ] `/shared/src/ui/design-tokens.css` imported
- [ ] `/shared/src/ui/styles.css` imported
- [ ] `initNavigation()` called with correct `currentPage` value
- [ ] Breadcrumbs configured appropriately
- [ ] All navigation links work correctly
- [ ] Logout functionality tested
- [ ] Active page state correctly highlighted
- [ ] Navigation displays on all pages in the service

**Note:** Public-facing services (Estimator) skip navigation-related items.

### Service URLs & IDs

**Official Service Registry:**

| Service ID | Name | Production URL | Local Dev | Type |
|------------|------|----------------|-----------|------|
| `admin` | Admin Dashboard | https://sailorskills-admin.vercel.app | localhost:8001 | Internal |
| `portal` | Service Portal | https://sailorskills-portal.vercel.app | localhost:5174 | Internal |
| `billing` | Billing | https://sailorskills-billing.vercel.app | localhost:5173 | Internal |
| `inventory` | Inventory | https://sailorskills-inventory.vercel.app | localhost:5176 | Internal |
| `schedule` | Schedule | https://sailorskills-schedule.vercel.app | localhost:3000 | Internal |
| `estimator` | Diving Estimator | https://sailorskills-estimator.vercel.app | localhost:5175 | **Public** |

**Use these exact IDs** when calling `initNavigation({ currentPage: 'id' })` (internal services only).

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
- **Reusable hooks** (if using React)

**❌ KEEP in Service Repos:**

- **Service-specific business logic**
- **Unique UI flows** and features
- **Service-specific data models**
- **Custom calculations** (e.g., diving price calculator)
- **Service-specific API endpoints**
- **Service-specific state management**
- **One-off components** unlikely to be reused

### Decision Framework

Before adding to shared package, ask:

1. **Is it used by 2+ services?** (or will be soon)
2. **Is it generic enough to be reusable?**
3. **Does it enforce design consistency?**
4. **Will centralizing it reduce bugs?**

If **YES to 2+ questions** → Add to shared
If **NO to most questions** → Keep in service repo

### Examples

```javascript
// ✅ GOOD - Belongs in shared
export function createButton({ variant, onClick, text }) { ... }
export const BUSINESS = { MINIMUM_SERVICE_FEE: 150 };
export function formatCurrency(amount) { ... }
export function validateEmail(email) { ... }

// ❌ BAD - Belongs in service repos
export function calculateDivingPrice(depth, time, hull) { ... }
export function InventoryDashboard() { ... }
export const DIVING_SERVICES = ['hull-cleaning', 'zincs', ...];
```

### Adding New Shared Components

**Process:**

1. **Propose**: Open discussion with team
2. **Design**: Ensure it follows design system
3. **Build**: Create in shared package
4. **Test**: Test in at least 1 service
5. **Document**: Add to README with examples
6. **Version**: Bump version (semver)
7. **Deploy**: Update services that need it

**Required Documentation:**
- Purpose and use cases
- API reference with examples
- CSS classes and styling
- Accessibility notes

---

## File Structure & Paths

### Shared Package Structure

```
sailorskills-shared/
├── src/
│   ├── ui/
│   │   ├── design-tokens.css    # CSS variables (REQUIRED)
│   │   ├── styles.css           # Global styles & navigation
│   │   ├── navigation.js        # Navigation component
│   │   └── components.js        # Reusable UI components
│   ├── auth/
│   │   ├── supabase-auth.js     # Supabase auth wrapper
│   │   └── simple-auth.js       # Simple password auth
│   ├── config/
│   │   └── constants.js         # Shared constants
│   └── index.js                 # Main export
├── SHARED_RESOURCES_DIRECTIVE.md  # This file
├── NAVIGATION_INTEGRATION.md      # Navigation guide
├── README.md                      # Package documentation
└── package.json
```

### Path Reference Guidelines

**CRITICAL: Path formats vary by server type**

#### For Vite-based Services (Portal, Inventory, Estimator, Billing, Schedule)
```html
<!-- ✅ CORRECT - Absolute paths from root -->
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';
</script>
```

#### For Python HTTP Server (Admin)
```html
<!-- ✅ CORRECT - Absolute paths from root -->
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';
</script>
```

#### What NOT to Do
```html
<!-- ❌ WRONG - Relative paths may break -->
<link rel="stylesheet" href="./shared/src/ui/styles.css">
<link rel="stylesheet" href="../shared/src/ui/styles.css">

<!-- ❌ WRONG - Wrong path structure -->
<link rel="stylesheet" href="../sailorskills-shared/src/ui/styles.css">
```

**Rule of Thumb:** Always use `/shared/` (absolute path from web root).

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

**Important:**
- Always test shared changes in a real service first
- Use semantic versioning for breaking changes
- Document changes in README

### Testing Changes Locally

```bash
# 1. Make changes in shared repo
cd sailorskills-shared
# ... edit files ...
git add .
git commit -m "Add new button variant"
git push

# 2. Update in service repo
cd ../sailorskills-inventory/shared
git pull origin main
cd ..

# 3. Test locally
npm run dev

# 4. If good, commit the submodule update
git add shared
git commit -m "Update shared package - new button variant"
git push
```

### Version Management

**Semantic Versioning (SemVer):**

- **Major (1.0.0 → 2.0.0)**: Breaking changes (renamed functions, removed features)
- **Minor (1.0.0 → 1.1.0)**: New features, backwards compatible
- **Patch (1.0.0 → 1.0.1)**: Bug fixes, no new features

**Update `package.json` version** when making significant changes.

### Breaking Changes Policy

**If introducing a breaking change:**

1. **Announce** to team in advance
2. **Document** the migration path
3. **Bump major version**
4. **Update all services** before deploying
5. **Test thoroughly** in all services

---

## Compliance & Testing

### Navigation Compliance Tests

**All services MUST pass** the Playwright navigation compliance tests.

**Test Coverage:**
- Global navigation header loads
- SAILOR SKILLS logo present and links correctly
- All 6 navigation links present
- Active state correctly highlights current page
- Logout button visible and functional
- Breadcrumb navigation (if applicable)
- Design tokens properly applied

**Running Tests:**
```bash
cd sailorskills-shared
npx playwright test tests/navigation-compliance.spec.js
```

**Current Status:**
- ✅ Admin: 7/7 passing (100%)
- ✅ Inventory: 7/7 passing (100%)
- ✅ Schedule: 5/7 passing (71%)
- ⚠️ Portal: Not yet tested
- ⚠️ Billing: Not yet tested
- N/A Estimator: Exempt (public-facing)

**Requirement:** All **internal** services must achieve **100% pass rate** before production deployment.

### Design Token Usage Validation

**How to Verify:**

1. **Inspect elements** in browser dev tools
2. **Check computed styles** use CSS variables (e.g., `var(--ss-primary)`)
3. **Search codebase** for hardcoded colors (e.g., `#345475`)
4. **Replace hardcoded values** with design tokens

**Common Violations:**
```css
/* ❌ WRONG */
.button {
  background: #345475;
  color: #181818;
  padding: 16px;
  border-radius: 8px;
}

/* ✅ CORRECT */
.button {
  background: var(--ss-primary);
  color: var(--ss-text-dark);
  padding: var(--ss-space-md);
  border-radius: var(--ss-radius-none);
}
```

### Pre-Deployment Checklist

Before deploying any service:

- [ ] All shared CSS files imported
- [ ] Montserrat font loaded
- [ ] Navigation initialized correctly
- [ ] Playwright tests passing (if applicable)
- [ ] No hardcoded colors (use CSS variables)
- [ ] No custom fonts (use Montserrat)
- [ ] Sharp corners enforced (no border-radius)
- [ ] Shared submodule up to date
- [ ] Cross-service navigation tested
- [ ] Logout functionality verified

---

## Service-Specific Guidelines

### Admin Service

**Technology:** Python HTTP Server
**Port:** 8001 (dev)
**Deployment:** Vercel

**Requirements:**
- Uses `/shared/` absolute paths
- Dashboard.html integrates navigation
- Simple structure (no build process)

**Integration:**
```html
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';
  initNavigation({
    currentPage: 'admin',
    breadcrumbs: [
      { label: 'Home', url: 'https://www.sailorskills.com/' },
      { label: 'Admin' }
    ]
  });
</script>
```

### Portal Service

**Technology:** Vite
**Port:** 5174 (dev)
**Deployment:** Vercel

**Requirements:**
- Uses `/shared/` absolute paths
- Vite handles module resolution
- Service management focus

**Status:** ⚠️ Needs navigation integration

### Billing Service

**Technology:** Vite
**Port:** 5173 (dev)
**Deployment:** Vercel

**Requirements:**
- Uses `/shared/` absolute paths
- Partial integration (admin.html only)

**Status:** ⚠️ Needs full navigation integration

### Inventory Service

**Technology:** Vite
**Port:** 5176 (dev)
**Deployment:** Vercel

**Requirements:**
- Uses `/shared/` absolute paths
- Has authentication (requires bypass in tests)
- Multiple pages (inventory.html, ai-assistant.html)

**Authentication Note:**
```javascript
// For testing: Bypass auth by setting session
localStorage.setItem('inventory_auth_session', JSON.stringify({
  authenticated: true,
  expires: Date.now() + (8 * 60 * 60 * 1000)
}));
```

**Status:** ✅ Fully integrated

### Schedule Service

**Technology:** Node.js/Express
**Port:** 3000 (dev)
**Deployment:** Vercel

**Requirements:**
- Uses `/shared/` absolute paths
- Calendar/scheduling focus

**Status:** ✅ Partially integrated (needs breadcrumb fixes)

### Estimator Service

**Technology:** Vite
**Port:** 5175 (dev)
**Deployment:** Vercel
**Type:** Public-facing

**Requirements:**
- Uses `/shared/` absolute paths for design tokens and styles
- **NO navigation integration required** (public-facing)
- **NO breadcrumbs required** (public-facing)
- Diving service calculator
- Hero header style

**Integration:**
```html
<!-- Only include design system, NOT navigation -->
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
<!-- DO NOT include navigation.js -->
```

**Status:** ✅ Exempt from navigation requirements (public-facing)

---

## Enforcement & Updates

### This Directive is Official

- **Status:** Mandatory for all Sailor Skills services
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

### Requesting Exceptions

**If you need to deviate from this directive:**

1. **Document** the reason
2. **Propose** alternative approach
3. **Get approval** from team lead
4. **Update** this directive if exception becomes standard

---

## Resources

### Documentation
- [README.md](./README.md) - Package API reference
- [NAVIGATION_INTEGRATION.md](./NAVIGATION_INTEGRATION.md) - Navigation setup guide
- [design-tokens.css](./src/ui/design-tokens.css) - All CSS variables

### Testing
- [Navigation Tests](./tests/navigation-compliance.spec.js) - Playwright test suite

### Examples
- **Admin Service** - Fully integrated with Python server
- **Inventory Service** - Fully integrated with auth and Vite
- **Schedule Service** - Partially integrated

### Support
- **GitHub Issues:** https://github.com/standardhuman/sailorskills-shared/issues
- **Team Discussion:** Check with team lead
- **Documentation Updates:** Submit PR to this file

---

## Changelog

### Version 1.0 (2025-10-04)
- Initial release of Shared Resources Directive
- Established design system standards
- Defined integration requirements
- Created governance policies
- Added compliance testing framework

---

**End of Directive**

This document is the single source of truth for shared resource usage across all Sailor Skills microservices. Follow these standards to ensure a consistent, professional, and maintainable product.
