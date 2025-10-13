# Migration Guide: Local Paths → CDN URLs

**Purpose:** Migrate from local `/shared/src/` paths to CDN URLs (`https://sailorskills-shared.vercel.app/src/`)

**Estimated Time:** 10-15 minutes per service

---

## Why Migrate?

### Current Problem (Local Paths)
- Each service has `shared` symlink or copied files
- Updating shared resources requires:
  1. Update sailorskills-shared repo
  2. Update submodule in each service
  3. Commit in each service
  4. Deploy each service individually
- Vercel caching issues causing stale deployments
- Complex, error-prone process

### Solution (CDN URLs)
- ✅ Single source of truth
- ✅ Update shared once, all services updated
- ✅ No per-service deployments needed
- ✅ Proper cache control
- ✅ No symlink/submodule complexity
- ✅ Works with all service types

---

## Migration Steps

### Step 1: Update HTML Files

**Find and replace** in all `.html` files in your service:

#### Replace CSS Imports

**Find:**
```html
<link rel="stylesheet" href="/shared/src/ui/design-tokens.css">
<link rel="stylesheet" href="/shared/src/ui/styles.css">
```

**Replace with:**
```html
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/design-tokens.css">
<link rel="stylesheet" href="https://sailorskills-shared.vercel.app/src/ui/styles.css">
```

#### Replace JS Imports

**Find:**
```javascript
import { initNavigation } from '/shared/src/ui/navigation.js';
```

**Replace with:**
```javascript
import { initNavigation } from 'https://sailorskills-shared.vercel.app/src/ui/navigation.js';
```

### Step 2: Remove Local Shared Files

#### 2a. Remove Symlink (if exists)

```bash
# Check if symlink exists
ls -la | grep shared

# If you see: lrwxr-xr-x ... shared -> .
# Remove it:
rm shared
```

#### 2b. Remove Copied Files (if exists)

```bash
# If you have a src/ui/ directory with shared files, remove it:
rm -rf src/ui/
```

#### 2c. Remove Git Submodule (if exists)

```bash
# Check for git submodules
git submodule status

# If shared submodule exists, remove it:
git submodule deinit shared
git rm shared
rm -rf .git/modules/shared
```

#### 2d. Clean up .gitmodules (if exists)

```bash
# Check if file exists
cat .gitmodules

# If it references shared, delete the file:
rm .gitmodules
```

### Step 3: Test Locally

```bash
# Start your dev server
npm run dev
# or
python3 -m http.server 8000
# or whatever your service uses
```

**Verify:**
- [ ] Navigation appears at top of page
- [ ] Styles load correctly (check Montserrat font, colors)
- [ ] All three tiers visible (breadcrumb, main nav, sub-nav if applicable)
- [ ] Active states correct
- [ ] Cross-service links work
- [ ] Browser console has no errors

### Step 4: Commit Changes

```bash
# Add all changed files
git add .

# Commit with descriptive message
git commit -m "chore: Migrate to shared CDN URLs

- Replace /shared/src/ paths with https://sailorskills-shared.vercel.app/src/
- Remove shared symlink/submodule
- Remove copied shared files

Benefits:
- No more manual submodule updates
- Shared updates propagate automatically
- Simplified deployment process"

# Push to GitHub
git push origin main
```

### Step 5: Verify Production Deployment

```bash
# Wait for Vercel to deploy (~2-3 minutes)
# Visit your production URL and verify everything works
```

---

## Quick Reference: Find & Replace Commands

### Using VS Code
1. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+H` (Windows)
2. Find: `/shared/src/ui/`
3. Replace: `https://sailorskills-shared.vercel.app/src/ui/`
4. Click "Replace All"

### Using Command Line (sed)

```bash
# Replace in all HTML files
find . -name "*.html" -type f -exec sed -i '' 's|/shared/src/ui/|https://sailorskills-shared.vercel.app/src/ui/|g' {} +

# Replace in all JS files
find . -name "*.js" -type f -exec sed -i '' 's|/shared/src/ui/|https://sailorskills-shared.vercel.app/src/ui/|g' {} +
```

### Using grep to Verify

```bash
# Check if any old paths remain
grep -r "/shared/src/" --include="*.html" --include="*.js" .

# Should return no results
```

---

## Service-Specific Notes

### Dashboard Service
- **Files to update:** `dashboard.html`, `customers.html`, `revenue.html`
- **Current approach:** Symlink (`shared -> .`)
- **After migration:** Remove symlink, test all three pages

### Billing Service
- **Files to update:** All HTML files in root
- **Current approach:** Symlink (`shared -> .`)
- **After migration:** Remove symlink, clear Vercel cache

### Operations Service
- **Files to update:** `operations.html`, `calendar.html`, etc.
- **Current approach:** May have git submodule
- **After migration:** Remove submodule completely

### Inventory Service
- **Files to update:** `inventory.html`, `ai-assistant.html`
- **Current approach:** Git submodule
- **After migration:** Remove submodule, test auth flow

### Video Service
- **Files to update:** All HTML files
- **Current approach:** Unknown
- **After migration:** Verify and test

### Estimator Service (Public)
- **Files to update:** `estimator.html`
- **Note:** No navigation, only styles
- **Migration:** Update CSS links only

---

## Troubleshooting

### Problem: "Failed to load module script"

**Symptom:** Browser console error about CORS or module loading

**Solution:**
1. Ensure you're using `https://` (not `http://`)
2. Check for typos in CDN URL
3. Verify sailorskills-shared is deployed to Vercel
4. Check browser dev tools → Network tab for 404s

### Problem: Styles not applying

**Symptom:** Navigation appears unstyled or wrong fonts

**Solution:**
1. Check CSS files loaded in Network tab
2. Verify both design-tokens.css AND styles.css are included
3. Check for CSS conflicts in service-specific styles
4. Clear browser cache (Cmd+Shift+R / Ctrl+F5)

### Problem: "Cannot find module"

**Symptom:** Import statement fails

**Solution:**
1. Ensure script tag has `type="module"`
2. Check navigation.js path is correct
3. Verify CDN is accessible (visit URL directly)

### Problem: Old styles still showing

**Symptom:** Changes to shared styles not appearing

**Solution:**
1. CDN cache may take up to 1 hour to refresh
2. Force refresh: Add `?v=timestamp` to URL temporarily
3. Wait 1 hour for cache to expire naturally
4. Check you're on the latest deployment

### Problem: Navigation tiers in wrong order (RESOLVED)

**Symptom:** Breadcrumb appears at bottom instead of top, sub-nav at top instead of bottom

**Status:** ✅ **FIXED** as of October 13, 2025

**Solution:** This was a bug in the shared navigation.js file that has been fixed. If you're still seeing this:
1. Hard refresh your browser (Cmd+Shift+R / Ctrl+F5)
2. Clear browser cache
3. Verify you're loading from CDN (not local cached copy)
4. Check that CDN is serving latest version: `curl https://sailorskills-shared.vercel.app/src/ui/navigation.js | grep referenceNode`

**Technical Details:** The DOM insertion loop was using a changing reference point that reversed element order. Fixed by saving a constant reference before the loop.

---

## Verification Checklist

Before marking migration complete:

**Code Changes:**
- [ ] All `/shared/src/` replaced with CDN URLs
- [ ] Shared symlink removed
- [ ] Copied shared files removed (if any)
- [ ] Git submodule removed (if any)
- [ ] .gitmodules file cleaned up (if applicable)

**Testing:**
- [ ] Local dev server works
- [ ] Navigation loads correctly
- [ ] Styles apply correctly
- [ ] All pages tested
- [ ] Cross-service links work
- [ ] No console errors

**Deployment:**
- [ ] Changes committed to git
- [ ] Pushed to GitHub
- [ ] Vercel deployed successfully
- [ ] Production site verified
- [ ] All pages working in production

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 2: Temporarily Pin Old Version
```bash
# Edit HTML files, change CDN URL to:
# (This won't work yet - needs tagged release setup)
# https://sailorskills-shared-v1.vercel.app/src/ui/...
```

### Option 3: Emergency Fix
1. Fix issue in sailorskills-shared
2. Commit and push
3. Wait 5 minutes for Vercel deployment
4. All services auto-update

---

## After Migration: Benefits

✅ **No more per-service updates** - Update shared once, done
✅ **Faster development** - No submodule dance
✅ **Cleaner repos** - No shared copies/symlinks
✅ **Better caching** - CDN handles it properly
✅ **Easier onboarding** - New services just use CDN URLs
✅ **Version control** - Git tracks all shared changes
✅ **Instant rollback** - Revert shared repo to fix issues

---

## Questions?

- Check: [SHARED_RESOURCES_DIRECTIVE.md](./SHARED_RESOURCES_DIRECTIVE.md)
- Check: [NAVIGATION_INTEGRATION.md](./NAVIGATION_INTEGRATION.md)
- Open issue: https://github.com/standardhuman/sailorskills-shared/issues

---

## Migration Status Tracker

Track migration progress across all services:

- [x] Dashboard - https://sailorskills-dashboard.vercel.app ✅ (Verified Oct 2025)
- [  ] Billing - https://sailorskills-billing.vercel.app
- [  ] Operations - https://sailorskills-operations.vercel.app
- [  ] Inventory - https://sailorskills-inventory.vercel.app
- [  ] Video - https://sailorskills-video.vercel.app
- [  ] Estimator - https://sailorskills-estimator.vercel.app

**Target:** All services migrated by [DATE]

---

**End of Migration Guide**

Good luck with the migration! It's worth the effort - you'll save hours of deployment time going forward.
