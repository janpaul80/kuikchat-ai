# Quick Reference Guide - KuikChat Auth Integration

## 🚀 Quick Start (5 minutes)

### 1. Install Packages
```bash
npm install
```

### 2. Setup Supabase
```bash
# 1. Go to supabase.com and create project
# 2. Go to Project Settings → API
# 3. Copy VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Update `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Start Dev Server
```bash
npm run dev
# App auto-loads at http://localhost:5173
```

### 5. Test OAuth
- Click "Continue with Google" or "Continue with Microsoft"
- Sign in with your account
- ✅ Done! You're authenticated

---

## 📚 Key Files & Their Jobs

| File | Purpose | Key Features |
|------|---------|--------------|
| `services/supabase.ts` | Supabase client | Auth, OAuth, sessions |
| `contexts/AuthContext.tsx` | Auth state mgmt | Global user state, `useAuth()` hook |
| `.env.local` | Config file | Supabase credentials |
| `App.tsx` | Main app | Auth checks, redirects |
| `AuthModal.tsx` | Login UI | OAuth buttons |

---

## 🔧 Using Authentication in Components

### Check if User is Logged In
```tsx
import { useAuth } from './contexts/AuthContext'

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <h1>Welcome {user?.email}</h1>
}
```

### Sign Out User
```tsx
import { signOut } from './services/supabase'

async function handleLogout() {
  try {
    await signOut()
    // AuthContext automatically updates
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

### Access User Data
```tsx
const { user } = useAuth()

// Available properties:
user?.id              // Unique user ID
user?.email           // User email
user?.email_confirmed // Email verified?
user?.user_metadata   // Custom OAuth data
user?.app_metadata    // App-specific metadata
user?.identities      // OAuth provider info
```

---

## 🎯 Common Tasks

### Task: Require Authentication for a Page
```tsx
import { useAuth } from './contexts/AuthContext'

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Redirect to="/landing" />
  }
  
  return <Dashboard />
}
```

### Task: Show Different UI Based on Auth
```tsx
import { useAuth } from './contexts/AuthContext'

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  
  return (
    <header>
      {isAuthenticated ? (
        <>
          <p>Hello, {user?.email}</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={openLoginModal}>Login</button>
      )}
    </header>
  )
}
```

### Task: Execute Action After Login
```tsx
const { isAuthenticated } = useAuth()

useEffect(() => {
  if (isAuthenticated) {
    // User just logged in
    loadUserChats()
    loadUserProfile()
  }
}, [isAuthenticated])
```

### Task: Handle Errors During Auth
```tsx
import { signInWithOAuth } from './services/supabase'

async function handleLogin(provider) {
  try {
    await signInWithOAuth(provider)
  } catch (error) {
    if (error.message.includes('redirect')) {
      console.log('Check OAuth provider configuration')
    }
    setErrorMessage(error.message)
  }
}
```

---

## ⚠️ Common Mistakes & Fixes

### ❌ Problem: "Missing Supabase environment variables"
```
✅ Solution:
1. Check .env.local file exists
2. Copy EXACT values from Supabase dashboard
3. Restart dev server: npm run dev
4. Check for typos in VITE_SUPABASE_URL
```

### ❌ Problem: OAuth redirect fails
```
✅ Solution:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add http://localhost:5173 to "Site URL"
3. Add http://localhost:5173 to "Redirect URLs"
4. For production: add your actual domain
```

### ❌ Problem: Can't import useAuth
```
❌ Wrong:
import { useAuth } from 'contexts/AuthContext'

✅ Correct:
import { useAuth } from './contexts/AuthContext'
// Use ./ for relative imports
```

### ❌ Problem: Auth state not persisting
```
✅ Check:
1. Browser localStorage enabled?
2. Third-party cookies enabled?
3. Private/Incognito mode?
4. Check browser console for errors
```

---

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Use environment variables for secrets
- ✅ Never commit `.env.local` to git
- ✅ Create `.env.example` for documentation
- ✅ Use HTTPS in production
- ✅ Check `isAuthenticated` before showing sensitive data
- ✅ Validate user session on protected routes

### ❌ DON'T:
- ❌ Store passwords in localStorage
- ❌ Log sensitive user data
- ❌ Expose API keys in frontend code
- ❌ Trust client-side authentication alone
- ❌ Store Supabase secrets in git
- ❌ Allow unauthenticated users to access protected features

---

## 📊 Auth Flow in Simple Terms

```
1. User clicks "Sign in with Google"
   ↓
2. Redirected to Google sign-in page
   ↓
3. User logs in with Google account
   ↓
4. Google redirects back to app with permission
   ↓
5. Supabase creates session & JWT token
   ↓
6. Token saved in browser storage
   ↓
7. AuthContext updates with user data
   ↓
8. App shows main interface (not landing page)
   ↓
9. Token automatically refreshed when needed
   ↓
10. User logs out → Token deleted → Back to landing page
```

---

## 🧪 Testing Checklist

- [ ] `npm install` completes successfully
- [ ] `.env.local` has Supabase credentials
- [ ] `npm run dev` starts without errors
- [ ] Landing page loads
- [ ] "Continue with Google" button appears
- [ ] Can sign in with Google account
- [ ] Redirected to main app after login
- [ ] Logout button works
- [ ] Page reload keeps you logged in
- [ ] Browser local storage has auth token

---

## 📞 Debugging Tips

### Check Current User State
```tsx
// In any component using useAuth:
const auth = useAuth()
console.log('Auth State:', auth)
// Output shows: user, session, isLoading, isAuthenticated
```

### View Auth Token
```javascript
// In browser console:
localStorage.getItem('sb-auth-token')
// Shows the JWT token (sensitive!)
```

### Check Supabase Logs
```
Supabase Dashboard → Authentication → Logs
// Shows all auth attempts and errors
```

### Monitor Network Requests
```
Browser DevTools → Network tab
// Filter by "supabase.co"
// Check request/response for OAuth flow
```

---

## 🎓 Learning Path

**Day 1**: Authentication Setup
- [ ] Read `SUPABASE_SETUP.md`
- [ ] Set up Supabase project
- [ ] Configure OAuth providers
- [ ] Test login flow

**Day 2**: Using Auth in App
- [ ] Understand `useAuth()` hook
- [ ] Read `ARCHITECTURE.md`
- [ ] Protect routes with auth check
- [ ] Add logout functionality

**Day 3**: Cleanup & Optimization
- [ ] Create `.env.example`
- [ ] Document auth process for team
- [ ] Handle edge cases
- [ ] Performance testing

**Day 4+**: Advanced Features
- [ ] Database integration
- [ ] User profiles
- [ ] Real-time updates
- [ ] Advanced security

---

## 📖 Documentation Files

| File | Content | Read When |
|------|---------|-----------|
| `SUPABASE_SETUP.md` | Step-by-step OAuth setup | Starting from scratch |
| `IMPLEMENTATION_SUMMARY.md` | What was done | Want to understand changes |
| `ARCHITECTURE.md` | System design & diagrams | Learning the system |
| `FILE_STRUCTURE_ANALYSIS.md` | Organization guide | Refactoring code |
| This file | Quick reference | Need quick answers |

---

## 🚨 Emergency Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Can't sign in
```
1. Check .env.local has values
2. Check Supabase project is active
3. Check OAuth provider configuration
4. Check browser console for errors
5. Check Supabase logs for failures
```

### User keeps getting logged out
```
1. Check browser localStorage isn't cleared
2. Check HTTPS in production
3. Check session expiry settings
4. Check token refresh logic
```

### Wrong user data showing
```
1. Clear browser cache
2. Clear localStorage
3. Hard refresh (Ctrl+Shift+R)
4. Check user metadata in Supabase
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **OAuth Guide**: https://supabase.com/docs/guides/auth/social-login
- **React Integration**: https://supabase.com/docs/reference/javascript/introduction
- **Auth States**: https://supabase.com/docs/guides/auth/managing-session
- **GitHub Issues**: Check project repo for solutions

---

## 🎯 Next Milestone

Once auth is working:
- [ ] Connect database for chat messages
- [ ] Set up real-time message updates
- [ ] Add file storage for media
- [ ] Implement user profiles
- [ ] Add notifications

**Estimated time to MVP**: 2-3 weeks with this foundation! 🚀

---

**Status**: ✅ Ready to Use
**Last Updated**: December 2, 2025
**Difficulty**: Beginner-Friendly ✨
