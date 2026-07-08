# Google OAuth Setup Guide for KuikChat

This guide will help you set up and troubleshoot Google OAuth authentication with Supabase for the KuikChat application.

## Prerequisites

1. A Supabase account and project
2. A Google Cloud Platform account
3. KuikChat application running locally

## Step 1: Configure Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client (e.g., "KuikChat Auth")
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your Supabase project URL (e.g., `https://vfhyydylpdknjjikaael.supabase.co`)
8. Add authorized redirect URIs:
   - `http://localhost:3000` (for local development)
   - `https://vfhyydylpdknjjikaael.supabase.co/auth/v1/callback` (Supabase callback URL)
9. Click "Create"
10. Note down the Client ID and Client Secret

## Step 2: Configure Supabase Authentication

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click on it
5. Toggle the "Enable" switch to ON
6. Enter your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
7. Save the changes

## Step 3: Configure Redirect URLs in Supabase

1. In the Supabase Dashboard, go to "Authentication" > "URL Configuration"
2. Add Site URL: `http://localhost:3000` (for local development)
3. Add Redirect URLs: `http://localhost:3000` (for local development)
4. Save the changes

## Step 4: Configure Environment Variables

Create or update your `.env.local` file with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-id` and `your-anon-key` with your actual Supabase project ID and anonymous key.

## Step 5: Test the Authentication

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Click on the "Log in" button to open the authentication modal

4. Click "Continue with Google"

5. You should be redirected to Google's login page

6. After logging in with your Google account, you should be redirected back to the application

7. Use the AuthDebugger component (bottom-right corner) to verify the authentication status

## Troubleshooting

### 1. Redirect URI Mismatch

If you see an error like "redirect_uri_mismatch" or "The redirect URI in the request did not match a registered redirect URI", make sure:

- The redirect URI in Google Cloud Console exactly matches the one Supabase is using
- Check for trailing slashes or http vs https mismatches
- Ensure you've added `http://localhost:3000` as an authorized redirect URI in Google Cloud Console

### 2. Blank Page After Login

If you're redirected back to your application but see a blank page:

- Check browser console for errors (F12 > Console)
- Verify that your application is properly handling the authentication callback
- Make sure the AuthContext is correctly set up to detect and process the authentication state

### 3. CORS Issues

If you see CORS errors in the console:

- Make sure your Supabase project has the correct origins configured
- Add `http://localhost:3000` to the allowed origins in Supabase

### 4. Port Mismatch

The KuikChat application is configured to run on port 3000 (see vite.config.ts). Make sure:

- You're accessing the app at `http://localhost:3000` (not 5173, which is Vite's default)
- All your redirect URIs and authorized origins use port 3000
- If you change the port, update all configurations accordingly

### 5. Using the AuthDebugger

The AuthDebugger component provides valuable information about the authentication state:

- It shows if you're authenticated
- It displays user information when logged in
- It shows any authentication errors
- It provides a "Test Google Auth" button for direct testing

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vite.js Documentation](https://vitejs.dev/guide/)
