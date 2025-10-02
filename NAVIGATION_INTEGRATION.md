# Navigation Integration Guide

This guide explains how to integrate the standardized navigation and authentication into Sailor Skills microservices.

## Overview

The `@sailorskills/shared` package now includes:
- **Navigation Component**: Standardized header and breadcrumbs
- **Supabase Auth**: Enterprise-grade authentication
- **Styles**: Consistent CSS across all services

---

## Quick Start

### 1. Install/Update Shared Package

If using as git submodule (current setup):
```bash
cd your-service/
git submodule update --init --recursive
cd shared
git pull origin main
```

### 2. Add to HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Service | Sailor Skills</title>

    <!-- Montserrat Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Shared Styles (includes navigation) -->
    <link rel="stylesheet" href="shared/src/ui/styles.css">

    <!-- Your service styles -->
    <link rel="stylesheet" href="your-styles.css">
</head>
<body>
    <!-- Navigation will be injected here automatically -->

    <!-- Your content -->
    <div class="container">
        <h1>Your Service</h1>
    </div>

    <!-- Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <!-- Load config -->
    <script src="config.js"></script>

    <!-- Shared Auth -->
    <script src="shared/src/auth/supabase-auth.js"></script>

    <!-- Shared Navigation -->
    <script type="module">
        import { initNavigation } from './shared/src/ui/navigation.js';

        initNavigation({
            currentPage: 'billing',  // or 'inventory', 'schedule', etc.
            breadcrumbs: [
                { label: 'Home', url: 'https://www.sailorskills.com/' },
                { label: 'Admin', url: 'https://sailorskills-billing.vercel.app/admin.html' },
                { label: 'Your Page' }
            ]
        });
    </script>

    <!-- Your scripts -->
    <script src="your-script.js"></script>
</body>
</html>
```

---

## Configuration

### Navigation Options

```javascript
initNavigation({
    // Required: Which page is currently active
    currentPage: 'billing',  // Options: 'admin', 'billing', 'inventory', 'schedule', 'estimator'

    // Optional: Breadcrumb trail
    breadcrumbs: [
        { label: 'Home', url: 'https://www.sailorskills.com/' },
        { label: 'Admin', url: 'https://sailorskills-billing.vercel.app/admin.html' },
        { label: 'Current Page' }  // Last item has no URL (it's the current page)
    ],

    // Optional: Custom logout handler
    onLogout: () => {
        // Custom logic
        window.supabaseAuth?.signOut();
    }
});
```

### Available Services

The navigation automatically links to:

| Service | URL | ID |
|---------|-----|-----|
| Admin | https://sailorskills-billing.vercel.app/admin.html | `admin` |
| Billing | https://sailorskills-billing.vercel.app | `billing` |
| Inventory | https://sailorskills-inventory.vercel.app | `inventory` |
| Schedule | https://sailorskills-schedule.vercel.app | `schedule` |
| Estimator | https://sailorskills-estimator.vercel.app | `estimator` |

---

## Authentication

The shared auth component provides Supabase-based authentication.

### Setup

1. **Ensure Supabase config exists:**
```javascript
// In your config.js or similar
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
```

2. **Include auth script:**
```html
<script src="shared/src/auth/supabase-auth.js"></script>
```

3. **Auth happens automatically:**
- User is prompted to sign in on page load
- Session is maintained across page reloads
- Logout button in header signs out

### Create Admin Users

In Supabase Dashboard:
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User can now sign in

---

## CSS Customization

The shared styles are designed to be overridable. Load them BEFORE your custom styles:

```html
<link rel="stylesheet" href="shared/src/ui/styles.css">  <!-- First -->
<link rel="stylesheet" href="your-styles.css">          <!-- Second -->
```

Your styles will override shared styles with equal specificity.

---

## Integration Checklist

For each service (Billing, Schedule, Estimator):

- [ ] Update git submodule to latest shared package
- [ ] Add Montserrat font to `<head>`
- [ ] Include `shared/src/ui/styles.css`
- [ ] Include `shared/src/auth/supabase-auth.js`
- [ ] Add navigation initialization script
- [ ] Set correct `currentPage` value
- [ ] Add appropriate breadcrumbs
- [ ] Test authentication flow
- [ ] Test navigation links
- [ ] Verify logout works
- [ ] Deploy and test in production

---

## Example: Billing Service

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Billing | Sailor Skills</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="shared/src/ui/styles.css">
    <link rel="stylesheet" href="billing.css">
</head>
<body>
    <div class="container">
        <h1>Billing Dashboard</h1>
        <!-- Your billing content -->
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="config.js"></script>
    <script src="shared/src/auth/supabase-auth.js"></script>
    <script type="module">
        import { initNavigation } from './shared/src/ui/navigation.js';
        initNavigation({
            currentPage: 'billing',
            breadcrumbs: [
                { label: 'Home', url: 'https://www.sailorskills.com/' },
                { label: 'Admin', url: 'https://sailorskills-billing.vercel.app/admin.html' },
                { label: 'Billing' }
            ]
        });
    </script>
    <script src="billing.js"></script>
</body>
</html>
```

---

## Troubleshooting

### Navigation doesn't appear
- Check browser console for errors
- Verify `shared/src/ui/navigation.js` path is correct
- Ensure script is type="module"

### Styles look wrong
- Verify `shared/src/ui/styles.css` is loaded
- Check that Montserrat font is included
- Inspect element to see if styles are being applied

### Authentication fails
- Check `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` are set
- Verify Supabase client library is loaded
- Check browser console for Supabase errors

### Logout doesn't work
- Verify `window.supabaseAuth` exists
- Check that supabase-auth.js loaded successfully
- Look for JavaScript errors in console

---

## Updating the Shared Package

When changes are made to shared components:

```bash
# In shared package repo
cd sailorskills-shared
git add .
git commit -m "Update navigation"
git push

# In each service repo
cd sailorskills-billing  # or schedule, inventory, etc.
cd shared
git pull origin main
cd ..
git add shared
git commit -m "Update shared package"
git push
```

---

## Benefits

✅ **Consistency**: All services look and behave the same
✅ **Maintainability**: Update once, deploy everywhere
✅ **DRY**: No duplicate navigation code
✅ **Security**: Centralized auth logic
✅ **Branding**: Unified Sailor Skills identity

---

## Next Steps

1. Update Billing service to use shared navigation
2. Update Schedule service to use shared navigation
3. Update Estimator service to use shared navigation
4. Remove duplicate navigation code from each service
5. Test cross-service navigation
6. Deploy all services

---

**Questions?** Check the code in `sailorskills-inventory` for a working example.
