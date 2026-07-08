# Setting Up Google OAuth with Supabase

This guide will help you set up Google OAuth authentication with Supabase for your KuikChat application.

## 1. Create a Google OAuth Client

First, you need to create OAuth credentials in the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client (e.g., "KuikChat Auth")
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - `https://vfhyydylpdknjjikaael.supabase.co` (your Supabase URL)
8. Add authorized redirect URIs:
   - `http://localhost:5173` (for local development)
   - `https://vfhyydylpdknjjikaael.supabase.co/auth/v1/callback` (Supabase callback URL)
9. Click "Create"
10. Note down the Client ID and Client Secret

## 2. Configure Supabase Authentication

Next, set up Google OAuth in your Supabase project:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click on it
5. Toggle the "Enable" switch to ON
6. Enter your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
7. Save the changes

## 3. Configure Redirect URLs in Supabase

1. In the Supabase Dashboard, go to "Authentication" > "URL Configuration"
2. Add Site URL: `http://localhost:5173` (for local development)
3. Add Redirect URLs: `http://localhost:5173` (for local development)
4. Save the changes

## 4. Test the Authentication

1. Run your application locally: `npm run dev`
2. Open your browser and navigate to `http://localhost:5173`
3. Click on the "Continue with Google" button
4. You should be redirected to Google's login page
5. After logging in, you should be redirected back to your application

## Troubleshooting

If you're experiencing a blank page after login, try these solutions:

### 1. Check Browser Console for Errors

Open your browser's developer tools (F12) and look for any errors in the console. This can provide valuable information about what's going wrong.

### 2. Verify Redirect URLs

Make sure the redirect URLs are correctly set in both Google Cloud Console and Supabase. They must match exactly.

### 3. Check Environment Variables

Ensure your `.env.local` file has the correct Supabase URL and API key:

```
VITE_SUPABASE_URL=https://vfhyydylpdknjjikaael.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Clear Browser Cache and Cookies

Sometimes, cached authentication data can cause issues. Try clearing your browser's cache and cookies.

### 5. Check for CORS Issues

If you see CORS errors in the console, make sure your Supabase project has the correct origins configured.

### 6. Restart Development Server

Sometimes, simply restarting your development server can resolve issues:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vite.js Documentation](https://vitejs.dev/guide/)
