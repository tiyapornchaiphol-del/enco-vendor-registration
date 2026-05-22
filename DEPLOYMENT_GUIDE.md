# EnCo Vendor Registration - Deployment Guide

This document provides step-by-step instructions for deploying the EnCo Vendor Registration system to production using Vercel and Supabase.

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** with repository access
   - Repository URL: `https://github.com/tiyapornchaiphol-del/enco-vendor-registration.git`

2. **Vercel Account** (free tier is sufficient)
   - Sign up at [vercel.com](https://vercel.com)

3. **Supabase Project** with configured database
   - URL: `https://gpqfpxezejifxynzlcjn.supabase.co`
   - Anonymous key: (in `supabase-client.js`)

## Deployment Steps

### Step 1: Verify GitHub Push

✅ Changes have been pushed to GitHub (main branch)

Commit details:
- Message: "feat: Integrate Supabase database backend for vendor submissions"
- Files included: supabase-client.js, updated components, documentation
- Repository: https://github.com/tiyapornchaiphol-del/enco-vendor-registration

To verify locally:
```bash
git log --oneline -1
# Should show: feat: Integrate Supabase database backend for vendor submissions
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Sign in with your account

2. **Create New Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Paste: `https://github.com/tiyapornchaiphol-del/enco-vendor-registration.git`
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `enco-vendor-registration` (or your choice)
   - **Framework Preset**: Select "Other" (static HTML)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

4. **Environment Variables** (Optional)
   - No environment variables needed (Supabase credentials are in supabase-client.js)
   - If you want to keep credentials secure, add:
     ```
     VITE_SUPABASE_URL=https://gpqfpxezejifxynzlcjn.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - You'll receive a deployment URL

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project directory
cd "D:\EnCo Vendor Registration"

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Create new project? Yes
# - Project name? enco-vendor-registration
# - Which directory? ./
# - Override settings? No
```

### Step 3: Verify Deployment

After Vercel deployment completes:

1. **Test Production URL**
   - Visit your Vercel deployment URL (e.g., `https://enco-vendor-registration.vercel.app`)
   - Should see the vendor registration landing page

2. **Verify Supabase Connection**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for messages:
     - `📡 Loading data from Supabase...`
     - `✅ Supabase data loaded: { subsData: X, annData: Y }`
   - If you see errors, check Supabase configuration in browser

3. **Test Vendor Form**
   - Fill out vendor registration form
   - Submit the form
   - Should see success message with submission ID (AVL-YY-XXXX)
   - Check Supabase submissions table to verify data was saved

4. **Test Admin Dashboard**
   - Access admin mode: `?role=admin` query parameter
   - Navigate to "ใบสมัครคู่ค้า" (Submissions)
   - Verify submitted data appears in the list
   - Click on submission to view full details

### Step 4: Set Up Custom Domain (Optional)

To use a custom domain:

1. **In Vercel Dashboard**
   - Go to Project Settings
   - Navigate to "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update DNS Records**
   - Add CNAME record pointing to Vercel
   - Or use Vercel nameservers (if your domain registrar supports it)

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS will be available within a few minutes

### Step 5: Set Up Auto-Deployment

Vercel automatically deploys when you push to GitHub:

1. **Configure Git Integration** (usually automatic)
   - Every push to `main` branch triggers deployment
   - Preview deployments for pull requests

2. **Deployment Triggers**
   ```bash
   # Deploy to production (main branch)
   git push origin main

   # Create preview deployment (pull request)
   git checkout -b feature/my-feature
   git push origin feature/my-feature
   # Then create pull request on GitHub
   ```

3. **Monitor Deployments**
   - Check Vercel dashboard for deployment status
   - Review logs if deployment fails
   - Rollback to previous version if needed

## Post-Deployment Configuration

### Configure Supabase RLS (Row Level Security)

To ensure proper security in production, configure RLS policies:

1. **Go to Supabase Dashboard**
   - Project: `gpqfpxezejifxynzlcjn`
   - Navigate to "Authentication" → "Policies"

2. **Enable RLS on Tables**
   ```sql
   -- Enable RLS on submissions table
   ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

   -- Allow anonymous users to read their own submissions
   CREATE POLICY "users_can_read_own_submissions" ON submissions
     FOR SELECT USING (auth.uid() = user_id);

   -- Allow anonymous users to insert submissions
   CREATE POLICY "users_can_insert_submissions" ON submissions
     FOR INSERT WITH CHECK (true);
   ```

3. **Configure for Anonymous Access** (if needed)
   ```sql
   -- Allow anonymous role to read announcements
   CREATE POLICY "announcements_are_public" ON announcements
     FOR SELECT USING (true);
   ```

### Monitor Application

Set up monitoring to catch issues early:

1. **Vercel Analytics**
   - Visit Vercel dashboard
   - Check "Deployment Events" for errors
   - Monitor "Web Vitals" for performance

2. **Supabase Monitoring**
   - Check database usage (storage, API calls)
   - Monitor for slow queries
   - Review error logs

3. **Browser Console**
   - Application logs errors to console
   - Check for CORS or network errors
   - Look for Supabase connection issues

## Rollback Procedure

If deployment has issues:

### Option 1: Using Vercel Dashboard
1. Go to Vercel Project Settings
2. Click "Deployments"
3. Find previous working deployment
4. Click "Redeploy" or "Promote to Production"

### Option 2: Using Git
```bash
# Find previous commit
git log --oneline

# Reset to previous commit (if needed)
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

## Troubleshooting

### Blank Page After Deployment

**Symptoms**: Deployment succeeds but shows blank page

**Solutions**:
1. Check browser console for errors (F12)
2. Verify Supabase credentials in `supabase-client.js`
3. Check that Supabase database tables exist
4. Clear browser cache and reload

### Submissions Not Saving

**Symptoms**: Form submits successfully but data doesn't appear in admin view

**Solutions**:
1. Check Supabase dashboard - confirm table exists and has data
2. Review browser console for Supabase errors
3. Verify RLS policies aren't blocking inserts
4. Check that anonymous key has proper permissions

### 404 Errors on Page Reload

**Symptoms**: Page works initially but shows 404 when refreshed

**Solutions**:
1. Check `vercel.json` has proper configuration
2. Ensure `index.html` is in root directory
3. Add rewrite rule in `vercel.json`:
   ```json
   "rewrites": [
     { "source": "/(.*)", "destination": "/index.html" }
   ]
   ```

### CORS Errors

**Symptoms**: Console shows "CORS policy" error

**Solutions**:
1. CORS should be handled by Supabase automatically
2. Check that request origin is in Supabase allowed origins
3. Verify Supabase anonymous key is correct
4. Check RLS policies aren't blocking the request

## Monitoring Checklist

- [ ] Vercel deployment URL is accessible
- [ ] Browser console shows no errors
- [ ] Supabase data is loading (check console logs)
- [ ] Vendor form can submit successfully
- [ ] Admin dashboard displays submitted data
- [ ] Excel export includes all submissions
- [ ] Supabase connection is stable
- [ ] No rate limiting or quota issues
- [ ] Performance is acceptable (< 3s load time)

## Maintenance

### Regular Tasks

1. **Weekly**
   - Monitor Supabase usage (check for quota overages)
   - Review error logs in console

2. **Monthly**
   - Export and backup submission data
   - Update dependencies if needed
   - Test form submission workflow

3. **Quarterly**
   - Review and update announcements
   - Clean up old/closed announcements
   - Archive completed submissions

## Disaster Recovery

### Backup Strategy

1. **Regular Database Backups**
   ```bash
   # Supabase provides automatic daily backups
   # Access in Dashboard > Backups
   ```

2. **Manual Export**
   ```bash
   # Export all submissions as Excel
   # Use admin dashboard export function
   # Save to secure location
   ```

3. **Version Control**
   ```bash
   # All code changes are version controlled
   # Can revert to any previous commit if needed
   ```

### Recovery Procedure

If data is lost or corrupted:

1. **From Supabase Backup**
   - Go to Supabase Dashboard
   - Navigate to "Backups"
   - Restore from previous snapshot

2. **From Exported Files**
   - Locate most recent Excel export
   - Import data back into Supabase table

3. **Code Recovery**
   - Use git to revert to stable version
   - `git revert <commit-hash>`
   - `git push origin main`

## Support & Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **GitHub**: https://github.com/tiyapornchaiphol-del/enco-vendor-registration

## Next Steps

After successful deployment:

1. Share production URL with stakeholders
2. Create user documentation for admins
3. Set up email notifications (if email service is added)
4. Monitor submissions and system performance
5. Plan future enhancements
