# EnCo Vendor Registration System

A web-based vendor registration and management system for EnCo, built with React 18 (UMD) and Supabase as the database backend.

## Features

- **Vendor Registration Form**: Multi-step form for vendors to apply for vendor registration
- **Admin Dashboard**: Dashboard to manage vendor submissions and approvals
- **Announcement Management**: Create and manage vendor recruitment announcements
- **Excel Export**: Export vendor submissions to Excel format
- **Multi-language Support**: Thai and English language interface
- **Responsive Design**: Mobile-friendly interface with responsive CSS

## Technology Stack

- **Frontend**: React 18 (UMD build, no build step required)
- **Database**: Supabase (PostgreSQL managed service)
- **Styling**: Custom CSS with CSS variables (supports dark mode)
- **Templating**: Babel Standalone for JSX transformation in the browser

## Project Structure

```
.
├── index.html                    # Main HTML entry point
├── app.jsx                       # Main App component with routing and context
├── vendor.jsx                    # Vendor registration form and dashboard
├── admin.jsx                     # Admin dashboard and submission management
├── data.jsx                      # Data definitions and hooks
├── ui.jsx                        # Reusable UI components
├── tweaks-panel.jsx             # Development settings panel
├── supabase-client.js           # Supabase client initialization and queries
├── styles/                      # (if separate stylesheets are added)
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Development

### No Build Step Required

This project uses React UMD builds and Babel Standalone, so you can develop directly without a build process:

1. Open `index.html` in a browser (or run a local HTTP server)
2. Edit JSX files directly
3. Changes reload automatically when you refresh the page

### Local Development Server

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server

# Or use the provided start-server.bat (Windows)
start-server.bat
```

Then open `http://localhost:8000` in your browser.

## Configuration

### Supabase Setup

The application uses Supabase for data persistence. Configuration is in `supabase-client.js`:

```javascript
const SUPABASE_URL = 'https://gpqfpxezejifxynzlcjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Database Tables Required:**

1. **submissions** - Vendor registration submissions
   - id (text, PK)
   - company, tax_id, category, address, etc.
   - status (new/review/approved/rejected)
   - submitted_at (timestamp)

2. **announcements** - Vendor recruitment announcements
   - id (text, PK)
   - title, description, categories
   - opened_at, closed_at
   - status (open/closing/closed)

3. **categories** - Vendor service categories
   - id (text, PK)
   - name (Thai and English translations)

### Environment Variables

No environment variables needed for local development. For production deployment, ensure Supabase credentials are accessible (they're exposed as anonymous key, so security is handled via Supabase RLS policies).

## Usage

### Vendor View
1. Click "สมัครคู่ค้า" (Register as Vendor)
2. Select announcement and vendor category
3. Fill in company and contact information
4. Upload required documents
5. Review and submit
6. System generates unique submission ID (AVL-YY-XXXX format)

### Admin View
1. Toggle to "Admin" mode in tweaks panel (dev feature)
2. View all vendor submissions with filtering options
3. Click submission to view full details
4. Update submission status (new/review/approved/rejected)
5. Export submissions to Excel

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: Integrate Supabase database backend"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Verify Deployment**
   - Vercel will auto-deploy from GitHub
   - Application will be accessible at `https://[project-name].vercel.app`

### Post-Deployment

After deploying to Vercel:
1. Test vendor form submission
2. Verify admin dashboard displays Supabase data
3. Test Excel export functionality
4. Monitor browser console for any errors

## Browser Console Debugging

The application includes debug logging. Open browser DevTools (F12) to see:
- `📡 Loading data from Supabase...` - Data fetch initiated
- `✅ Supabase data loaded:` - Data successfully loaded
- `⚠️ Using fallback hardcoded data` - Supabase unavailable, using fallback
- `❌ Error loading Supabase data:` - Error messages for troubleshooting

## Fallback Behavior

If Supabase is unavailable:
- Submissions fallback to hardcoded data (currently empty)
- Announcements fallback to hardcoded announcements in `data.jsx`
- Admin dashboard still functions with fallback data
- New submissions cannot be saved (form shows error)

## File Descriptions

### app.jsx
Main application component that:
- Initializes Supabase data fetching
- Manages routing between views
- Provides data context to all components
- Handles role switching (vendor/admin)

### vendor.jsx
Vendor-facing components:
- **VendorLanding**: List of open announcements
- **VendorForm**: Multi-step registration form
- **VendorTrack**: Submission status tracking
- Handles form state and Supabase submission

### admin.jsx
Admin-facing components:
- **AdminDashboard**: Overview statistics
- **AdminSubmissions**: List and filter submissions
- **AdminDetail**: Full submission details and status updates
- **ExportModal**: Excel export functionality

### data.jsx
Data management:
- `VENDOR_CATEGORIES`: Service category definitions
- `ANNOUNCEMENTS`: Sample announcements (fallback)
- `REQUIRED_DOCS`: Required document list
- `useSupabaseData()`: Custom hook for fetching Supabase data
- `STATUS_LABEL`: Localization for status labels

### supabase-client.js
Supabase integration:
- Client initialization
- Database query functions
- Data transformation (snake_case ↔ camelCase)
- Error handling with fallbacks

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify Supabase credentials in `supabase-client.js`
- Ensure Supabase database tables exist and have correct schema
- Check Supabase RLS policies allow anonymous inserts

### Admin submissions not showing
- Verify Supabase data is being fetched (check console logs)
- Check that submissions table has data
- Ensure RLS policies allow anonymous selects
- Try refreshing the page

### CORS errors
- Supabase should handle CORS automatically
- If issues persist, configure CORS in Supabase project settings

## Development Tips

1. **Toggle Dev Mode**: Use tweaks panel to toggle between vendor and admin roles without reloading
2. **Console Logging**: Strategic console.log statements help debug data flow
3. **Responsive Testing**: Use browser DevTools device emulation to test mobile views
4. **Dark Mode**: Toggle in tweaks panel to test dark mode colors
5. **Language**: Switch between Thai (th) and English (en) in tweaks panel

## License

Internal use only - EnCo proprietary

## Support & Maintenance

For questions or issues:
1. Check browser console for error messages
2. Review Supabase dashboard for database errors
3. Verify network tab shows successful Supabase API calls
4. Check that Supabase credentials are current

## Future Enhancements

- [ ] Add email notification system for submissions
- [ ] Implement document upload and storage
- [ ] Add payment integration for vendor fees
- [ ] Create vendor portal for tracking submissions
- [ ] Add approval workflow with comments
- [ ] Implement audit logging for admin actions
