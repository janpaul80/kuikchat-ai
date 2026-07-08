# Supabase Authentication Setup Guide

## Overview
KuikChat is now integrated with Supabase authentication supporting OAuth providers (Google and Microsoft).

## What Was Added

### 1. **Authentication Service** (`services/supabase.ts`)
Complete Supabase client with the following functions:
- `signInWithOAuth(provider)` - OAuth sign in (Google, Microsoft)
- `signInWithPassword(email, password)` - Email/password login
- `signUpWithPassword(email, password, userData)` - Email/password signup
- `signOut()` - Sign out user
- `getCurrentUser()` - Get current authenticated user
- `getCurrentSession()` - Get active session
- `onAuthStateChange(callback)` - Listen to auth state changes
- `resetPassword(email)` - Password reset
- `updatePassword(password)` - Update user password
- `updateUserProfile(updates)` - Update user profile

### 2. **Auth Context** (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides `useAuth()` hook for any component
- Returns: `user`, `session`, `isLoading`, `isAuthenticated`
- Auto-syncs with Supabase on page load

### 3. **Updated Components**
- **App.tsx**: Now checks authentication and shows landing page if not logged in
- **AuthModal.tsx**: Now uses Supabase OAuth instead of mock authentication
- **index.tsx**: Wrapped with `AuthProvider`

## Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for project to be initialized

### Step 2: Configure OAuth Providers

#### Google OAuth
1. In Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google`
   - Copy Client ID and Secret to Supabase

#### Microsoft OAuth
1. In Supabase Dashboard → Authentication → Providers
2. Enable Microsoft
3. Add your Microsoft credentials:
   - Go to [Azure Portal](https://portal.azure.com)
   - Register new application
   - Add client secret
   - Add Redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=microsoft`
   - Copy credentials to Supabase

### Step 3: Update Environment Variables

Edit `.env.local`:
```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Find these values in:
- **VITE_SUPABASE_URL**: Supabase Dashboard → Project Settings → API
- **VITE_SUPABASE_ANON_KEY**: Supabase Dashboard → Project Settings → API → `anon` (public) key

### Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js`: Supabase client library

### Step 5: Update Redirect URL

In Supabase Dashboard → Authentication → URL Configuration:
- Add Site URL: `http://localhost:5173` (for development)
- Add Redirect URL: `http://localhost:5173` (for development)

For production, update with your actual domain.

## Using Authentication in Components

### Check if User is Logged In
```tsx
import { useAuth } from './contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.email}!</div>;
}
```

### Sign Out User
```tsx
import { signOut } from './services/supabase';

async function handleLogout() {
  await signOut();
  // Redirect or refresh
}
```

### Access OAuth User Data
```tsx
const { user } = useAuth();

console.log(user?.email);           // User email
console.log(user?.user_metadata);   // Custom metadata from OAuth
console.log(user?.identities);      // OAuth provider info
```

## File Changes Summary

### New Files Created
- ✅ `services/supabase.ts` - Supabase client and auth functions
- ✅ `contexts/AuthContext.tsx` - Global auth state management
- ✅ `FILE_STRUCTURE_ANALYSIS.md` - Organization recommendations

### Modified Files
- ✅ `package.json` - Added `@supabase/supabase-js` dependency
- ✅ `index.tsx` - Added `AuthProvider` wrapper
- ✅ `App.tsx` - Added auth checking and Supabase imports
- ✅ `components/landing/AuthModal.tsx` - Integrated Supabase OAuth
- ✅ `.env.local` - Added Supabase configuration keys

## Testing the Integration

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test Google OAuth**:
   - Click "Continue with Google"
   - Sign in with your Google account
   - You should be redirected back to the app

3. **Test Microsoft OAuth**:
   - Click "Continue with Microsoft"
   - Sign in with your Microsoft account
   - You should be redirected back to the app

4. **Check Authentication State**:
   - Open browser DevTools → Console
   - The auth state should be logged/accessible

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: 
- Make sure `.env.local` has correct values
- Restart dev server after updating `.env.local`
- Check for typos in variable names

### Issue: "Redirect URL mismatch"
**Solution**:
- Add the current localhost URL to Supabase → Authentication → URL Configuration
- For production, add your actual domain

### Issue: OAuth buttons don't work
**Solution**:
- Verify OAuth providers are enabled in Supabase Dashboard
- Check that OAuth credentials are properly configured
- Look at browser console for error messages

### Issue: User state not persisting
**Solution**:
- AuthContext automatically syncs with Supabase
- Check browser localStorage for auth session
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

## Best Practices

1. **Environment Variables**: Never commit `.env.local` to git - use `.env.example`
2. **Session Persistence**: Supabase automatically manages sessions in localStorage
3. **User Data**: Store additional user info in Supabase database tables
4. **Error Handling**: Always wrap auth calls in try-catch blocks
5. **Loading States**: Use `isLoading` to show loading indicators during auth transitions

## Next Steps

1. **Database Setup**: Create database tables for users, chats, messages in Supabase
2. **Realtime Subscriptions**: Add Supabase Realtime for live chat updates
3. **File Storage**: Use Supabase Storage for message media, avatars
4. **RLS Policies**: Set up Row Level Security for data isolation
5. **User Profiles**: Create user profile management in the database

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React + Supabase Example](https://supabase.com/docs/reference/javascript/introduction)
- [OAuth Configuration](https://supabase.com/docs/guides/auth/social-login)
- [Session Management](https://supabase.com/docs/guides/auth/managing-session)

## Support

For issues or questions:
1. Check Supabase Dashboard for error logs
2. Review browser console for error messages
3. Consult Supabase documentation
4. Check GitHub issues in this project
