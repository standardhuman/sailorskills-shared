# Three-Tier Navigation Integration Guide

**Version:** 2.0
**Last Updated:** 2025-10-13
**Supersedes:** All previous navigation integration guides

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Three-Tier Navigation Overview](#three-tier-navigation-overview)
3. [Tier 1: Breadcrumb Trail](#tier-1-breadcrumb-trail)
4. [Tier 2: Main Service Navigation](#tier-2-main-service-navigation)
5. [Tier 3: Sub-Navigation](#tier-3-sub-navigation)
6. [Complete Integration Examples](#complete-integration-examples)
7. [AI Agent Prompt for Service Developers](#ai-agent-prompt-for-service-developers)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Services WITH Multiple Pages

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Page | Sailor Skills</title>

  <!-- Montserrat Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Shared Styles -->
  <link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
  <link rel="stylesheet" href="/shared/src/ui/styles.css">
</head>
<body>
  <!-- Your content here -->

  <!-- Navigation Initialization -->
  <script type="module">
    import { initNavigation } from '/shared/src/ui/navigation.js';

    initNavigation({
      // Tier 2: Main service
      currentPage: 'dashboard',

      // Tier 1: Breadcrumb
      breadcrumbs: [
        { label: 'Home', url: 'https://www.sailorskills.com/' },
        { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
        { label: 'Dashboard' }
      ],

      // Tier 3: Sub-pages
      subPages: [
        { id: 'dashboard', label: 'Dashboard', url: '/dashboard.html' },
        { id: 'boats', label: 'Boats & History', url: '/boats.html' }
      ],
      currentSubPage: 'dashboard'
    });
  </script>
</body>
</html>
```

### For Services WITH Single Page

```html
<!-- Same as above, but omit subPages and currentSubPage -->
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';

  initNavigation({
    currentPage: 'billing',
    breadcrumbs: [
      { label: 'Home', url: 'https://www.sailorskills.com/' },
      { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
      { label: 'Billing' }
    ]
  });
</script>
```

---

## Three-Tier Navigation Overview

The Sailor Skills navigation system consists of three tiers:

```
┌─────────────────────────────────────────────────────────┐
│ TIER 1: Breadcrumb Trail                               │
│ Shows: Home › Admin › Dashboard                         │
│ Purpose: Hierarchical location                          │
│ Required: YES (for all internal services)              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ TIER 2: Main Service Navigation                        │
│ Shows: DASHBOARD | BILLING | OPERATIONS | INVENTORY |  │
│        VIDEO | ESTIMATOR                                │
│ Purpose: Navigate between major services                │
│ Required: YES (for all internal services)              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ TIER 3: Sub-Navigation                                  │
│ Shows: Dashboard | Boats & History | Packing Lists |   │
│        Service Logs | Schedule | Paint Alerts           │
│ Purpose: Navigate within a service's pages              │
│ Required: OPTIONAL (only if service has multiple pages) │
└─────────────────────────────────────────────────────────┘
```

---

## Tier 1: Breadcrumb Trail

### Purpose
Shows the user's current location within the site hierarchy.

### Visual Style
- Light gray background (`#fafafa`)
- Blue links (`#5a7fa6`)
- Separator: `›`
- Small font size

### Configuration

```javascript
breadcrumbs: [
  { label: 'Home', url: 'https://www.sailorskills.com/' },
  { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
  { label: 'Current Page Name' } // Last item has no URL
]
```

### Rules
1. **Always start with "Home"** linking to the main site
2. **Include parent service** if navigating to a sub-page
3. **Current page has no URL** (it's the last item)
4. **Keep labels short** (1-2 words)

### Examples

**Dashboard homepage:**
```javascript
breadcrumbs: [
  { label: 'Home', url: 'https://www.sailorskills.com/' },
  { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
  { label: 'Dashboard' }
]
```

**Dashboard sub-page:**
```javascript
breadcrumbs: [
  { label: 'Home', url: 'https://www.sailorskills.com/' },
  { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
  { label: 'Dashboard', url: '/dashboard.html' },
  { label: 'Boats & History' }
]
```

---

## Tier 2: Main Service Navigation

### Purpose
Navigate between the major Sailor Skills services.

### Visual Style
- White background
- Blue text in uppercase
- Active service highlighted
- Horizontal layout

### Services
The main navigation displays these services (use exact labels):

| Service ID | Label | URL |
|------------|-------|-----|
| `dashboard` | DASHBOARD | https://sailorskills-dashboard.vercel.app |
| `billing` | BILLING | https://sailorskills-billing.vercel.app |
| `operations` | OPERATIONS | https://sailorskills-operations.vercel.app |
| `inventory` | INVENTORY | https://sailorskills-inventory.vercel.app |
| `video` | VIDEO | https://sailorskills-video.vercel.app |
| `estimator` | ESTIMATOR | https://sailorskills-estimator.vercel.app |

### Configuration

```javascript
currentPage: 'dashboard' // Highlights the active service
```

### Rules
1. **Use exact service IDs** from the table above
2. **Only one can be active** at a time
3. **Applies to all pages** within that service

---

## Tier 3: Sub-Navigation

### Purpose
Navigate between related pages within a single service.

### When to Use
- ✅ Service has 3+ related pages
- ✅ Pages are closely related (all part of same workflow)
- ✅ Users need quick switching between pages
- ❌ Don't use for single-page services
- ❌ Don't use for unrelated pages

### Visual Style
- Dark blue background (`#345475`)
- White text
- Active page highlighted with underline
- Horizontal layout

### Configuration

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

### Rules
1. **IDs must be unique** within the service
2. **Labels should be concise** (1-3 words)
3. **URLs are relative** to the service root
4. **currentSubPage must match** one of the IDs

### Label Guidelines
- ✅ "Dashboard"
- ✅ "Boats & History"
- ✅ "Service Logs"
- ❌ "The Main Dashboard Page" (too long)
- ❌ "dashboard" (use title case)

---

## Complete Integration Examples

### Example 1: Dashboard Service (Multi-Page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard | Sailor Skills</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
  <link rel="stylesheet" href="/shared/src/ui/styles.css">
  <link rel="stylesheet" href="/css/dashboard.css">
</head>
<body>
  <!-- Navigation injected here automatically -->

  <main class="dashboard-container">
    <h1>Dashboard</h1>
    <!-- Your content -->
  </main>

  <!-- Navigation Initialization -->
  <script type="module">
    import { initNavigation } from '/shared/src/ui/navigation.js';

    initNavigation({
      // Tier 2: Highlight Dashboard in main nav
      currentPage: 'dashboard',

      // Tier 1: Show location
      breadcrumbs: [
        { label: 'Home', url: 'https://www.sailorskills.com/' },
        { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
        { label: 'Dashboard' }
      ],

      // Tier 3: Dashboard-specific pages
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
  </script>

  <script type="module" src="/js/dashboard.js"></script>
</body>
</html>
```

### Example 2: Billing Service (Single-Page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Billing | Sailor Skills</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
  <link rel="stylesheet" href="/shared/src/ui/styles.css">
  <link rel="stylesheet" href="/css/billing.css">
</head>
<body>
  <main class="billing-container">
    <h1>Billing</h1>
    <!-- Your content -->
  </main>

  <script type="module">
    import { initNavigation } from '/shared/src/ui/navigation.js';

    initNavigation({
      currentPage: 'billing',
      breadcrumbs: [
        { label: 'Home', url: 'https://www.sailorskills.com/' },
        { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
        { label: 'Billing' }
      ]
      // No subPages - single-page service
    });
  </script>

  <script type="module" src="/js/billing.js"></script>
</body>
</html>
```

### Example 3: Operations Service Sub-Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Calendar | Operations | Sailor Skills</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
  <link rel="stylesheet" href="/shared/src/ui/styles.css">
  <link rel="stylesheet" href="/css/operations.css">
</head>
<body>
  <main class="operations-container">
    <h1>Calendar</h1>
    <!-- Your content -->
  </main>

  <script type="module">
    import { initNavigation } from '/shared/src/ui/navigation.js';

    initNavigation({
      currentPage: 'operations',
      breadcrumbs: [
        { label: 'Home', url: 'https://www.sailorskills.com/' },
        { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
        { label: 'Operations', url: '/operations.html' },
        { label: 'Calendar' } // Current page
      ],
      subPages: [
        { id: 'operations', label: 'Overview', url: '/operations.html' },
        { id: 'calendar', label: 'Calendar', url: '/calendar.html' },
        { id: 'tasks', label: 'Tasks', url: '/tasks.html' }
      ],
      currentSubPage: 'calendar'
    });
  </script>

  <script type="module" src="/js/calendar.js"></script>
</body>
</html>
```

---

## AI Agent Prompt for Service Developers

**Copy and paste this prompt to your AI coding assistant when implementing navigation in a service:**

```
# Task: Implement Three-Tier Sailor Skills Navigation

## Context
I'm working on a Sailor Skills microservice that needs to implement our standardized three-tier navigation system. The shared navigation components are available in the `/shared` git submodule.

## Requirements

### 1. Import Required Resources
Add these to the `<head>` of all HTML pages:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
```

### 2. Initialize Three-Tier Navigation
Add this before the closing `</body>` tag:

```html
<script type="module">
  import { initNavigation } from '/shared/src/ui/navigation.js';

  initNavigation({
    // TIER 2: Main service navigation
    // Choose ONE: 'dashboard' | 'billing' | 'operations' | 'inventory' | 'video' | 'estimator'
    currentPage: '[SERVICE_ID]',

    // TIER 1: Breadcrumb trail (REQUIRED)
    breadcrumbs: [
      { label: 'Home', url: 'https://www.sailorskills.com/' },
      { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
      { label: '[CURRENT_PAGE_NAME]' }
    ],

    // TIER 3: Sub-navigation (OPTIONAL - only if service has 3+ pages)
    subPages: [
      { id: '[page-id]', label: '[Page Label]', url: '/[page].html' },
      // ... more pages
    ],
    currentSubPage: '[current-page-id]'
  });
</script>
```

### 3. Configuration Values

**My Service Information:**
- Service ID: `[YOUR_SERVICE_ID]` (from: dashboard, billing, operations, inventory, video, estimator)
- Service has multiple pages: [YES/NO]
- Pages in this service (if multi-page): [LIST PAGES HERE]

### 4. Instructions

For EACH HTML page in this service:

1. **Add shared CSS imports** to `<head>`
2. **Add Montserrat font** to `<head>`
3. **Remove any hardcoded navigation HTML** (if exists)
4. **Add initNavigation() call** before `</body>`
5. **Configure Tier 1 (breadcrumb)**: Show hierarchical location
6. **Configure Tier 2 (currentPage)**: Set to this service's ID
7. **Configure Tier 3 (subPages)**: If multi-page service, list all pages with:
   - Unique `id` for each page
   - Short `label` (1-3 words, title case)
   - Relative `url` from service root
   - Set `currentSubPage` to match current page's `id`

### 5. Three-Tier Navigation Rules

**Tier 1 (Breadcrumb):**
- Always start with "Home" → Main site
- Include parent service if on sub-page
- Current page has no URL (last item)

**Tier 2 (Main Nav):**
- Use exact service ID (lowercase)
- Only one service highlighted at a time

**Tier 3 (Sub-Nav):**
- ONLY if service has 3+ related pages
- Keep labels concise
- IDs must be unique
- currentSubPage must match one of the IDs

### 6. Example for Multi-Page Service

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
    { id: 'packing', label: 'Packing Lists', url: '/packing.html' }
  ],
  currentSubPage: 'dashboard'
});
```

### 7. Example for Single-Page Service

```javascript
initNavigation({
  currentPage: 'billing',
  breadcrumbs: [
    { label: 'Home', url: 'https://www.sailorskills.com/' },
    { label: 'Admin', url: 'https://sailorskills-dashboard.vercel.app' },
    { label: 'Billing' }
  ]
  // No subPages for single-page services
});
```

## Verification Checklist

After implementing:
- [ ] Navigation appears at top of every page
- [ ] Breadcrumb trail shows correct location (Tier 1)
- [ ] Current service highlighted in main nav (Tier 2)
- [ ] Sub-navigation shows (if multi-page service) (Tier 3)
- [ ] Current sub-page highlighted (if applicable)
- [ ] All navigation links work correctly
- [ ] Logout button visible and functional
- [ ] Shared styles applied (Montserrat font, colors)

## Important Notes

1. **Always use absolute paths**: `/shared/src/ui/...` (not `./` or `../`)
2. **Service IDs are lowercase**: 'dashboard', not 'Dashboard'
3. **Labels are title case**: 'Dashboard', not 'dashboard'
4. **No navigation for public services**: Estimator doesn't need nav
5. **Test cross-service navigation**: Clicking BILLING should go to billing service
6. **Breadcrumb last item has no URL**: It's the current page

## Questions to Ask Me

If you're unsure:
1. What is the exact service ID for this service?
2. Does this service have multiple related pages? (for Tier 3)
3. What should the page labels be for the sub-navigation?
4. What's the breadcrumb hierarchy for sub-pages?

## Please proceed to implement the three-tier navigation following these specifications.
```

---

## Troubleshooting

### Navigation Doesn't Appear

**Problem**: Navigation not showing on page load

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify path to `/shared/src/ui/navigation.js` is correct
3. Ensure script is `type="module"`
4. Verify `initNavigation()` is called
5. Check that styles are loaded (`/shared/src/ui/styles.css`)

### Wrong Service Highlighted

**Problem**: Tier 2 highlights wrong service

**Solutions**:
1. Check `currentPage` value matches service ID exactly
2. Service IDs are lowercase: `'dashboard'` not `'Dashboard'`
3. Verify ID is in the official list: dashboard, billing, operations, inventory, video, estimator

### Sub-Navigation Not Showing

**Problem**: Tier 3 doesn't appear

**Solutions**:
1. Verify `subPages` array is provided
2. Check that array has at least one item
3. Ensure `currentSubPage` is set
4. Confirm `currentSubPage` matches one of the `id` values

### Wrong Sub-Page Highlighted

**Problem**: Tier 3 highlights wrong page

**Solutions**:
1. Check `currentSubPage` value matches the `id` exactly
2. IDs are case-sensitive: `'boats'` ≠ `'Boats'`
3. Verify the `id` exists in the `subPages` array

### Styles Look Wrong

**Problem**: Navigation doesn't match design

**Solutions**:
1. Verify `/shared/src/ui/design-tokens.css` is loaded
2. Verify `/shared/src/ui/styles.css` is loaded
3. Check Montserrat font is included
4. Inspect element to see if styles are being overridden
5. Ensure shared styles load BEFORE custom styles

### Breadcrumb Links Broken

**Problem**: Breadcrumb links don't work

**Solutions**:
1. Check URLs are absolute (include `https://`)
2. Verify URLs point to correct services
3. Ensure last item has no URL (it's the current page)

---

## Integration Checklist

Before marking navigation as complete:

**Setup:**
- [ ] Montserrat font loaded in `<head>`
- [ ] `/shared/src/ui/design-tokens.css` imported
- [ ] `/shared/src/ui/styles.css` imported
- [ ] `initNavigation()` called before `</body>`

**Tier 1 (Breadcrumb):**
- [ ] Starts with "Home"
- [ ] Shows correct hierarchy
- [ ] Current page has no URL
- [ ] Links work correctly

**Tier 2 (Main Navigation):**
- [ ] Correct `currentPage` value set
- [ ] Current service highlighted
- [ ] All service links work
- [ ] Logout button visible

**Tier 3 (Sub-Navigation):**
- [ ] `subPages` configured (if multi-page service)
- [ ] All page labels are concise
- [ ] `currentSubPage` set correctly
- [ ] Current sub-page highlighted
- [ ] All sub-page links work

**Testing:**
- [ ] Navigation appears on all pages
- [ ] Cross-service navigation works
- [ ] Active states correct on all pages
- [ ] Logout functionality works
- [ ] Responsive design works on mobile

---

## Reference

### Official Service Registry

| Service ID | Label | URL |
|------------|-------|-----|
| `dashboard` | DASHBOARD | https://sailorskills-dashboard.vercel.app |
| `billing` | BILLING | https://sailorskills-billing.vercel.app |
| `operations` | OPERATIONS | https://sailorskills-operations.vercel.app |
| `inventory` | INVENTORY | https://sailorskills-inventory.vercel.app |
| `video` | VIDEO | https://sailorskills-video.vercel.app |
| `estimator` | ESTIMATOR | https://sailorskills-estimator.vercel.app |

### API Reference

**Function**: `initNavigation(options)`

**Parameters**:
```typescript
{
  currentPage: string,           // Required: Service ID
  breadcrumbs: Array<{           // Required: Tier 1
    label: string,
    url?: string                 // Omit for current page
  }>,
  subPages?: Array<{             // Optional: Tier 3
    id: string,
    label: string,
    url: string
  }>,
  currentSubPage?: string,       // Required if subPages provided
  onLogout?: Function            // Optional: Custom logout handler
}
```

---

## Support

**Questions?**
- See [SHARED_RESOURCES_DIRECTIVE.md](./SHARED_RESOURCES_DIRECTIVE.md) for full specification
- Check [README.md](./README.md) for package documentation
- Open GitHub issue: https://github.com/standardhuman/sailorskills-shared/issues

---

**End of Guide**

This guide covers everything you need to implement the three-tier navigation system in any Sailor Skills service. Follow the AI agent prompt for step-by-step implementation assistance.
