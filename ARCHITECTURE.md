# KuikChat Architecture Overview

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Landing Page   │
                    │  (Not Logged In) │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
         [Google OAuth]             [Microsoft OAuth]
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │  Auth Service    │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
           [Session Created]    [JWT Token Issued]
                    │                   │
                    └─────────┬─────────┘
                              ▼
                   ┌──────────────────────┐
                   │  AuthContext Updates │
                   │  User & Session Set  │
                   └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   App Component  │
                    │  (Logged In)     │
                    └──────────────────┘
```

## Component Hierarchy

```
index.tsx
├── AuthProvider (NEW!)
│   └── ThemeProvider
│       └── LanguageProvider
│           └── App.tsx
│               ├── Sidebar (AppSidebar)
│               ├── List Panel (ContactList/StatusList/CommunitiesView)
│               └── Main Content
│                   ├── ChatWindow
│                   │   ├── MessageBubble
│                   │   ├── ChatInput
│                   │   └── Reactions
│                   ├── Settings Modal
│                   ├── Create Group Modal
│                   ├── Forward Modal
│                   └── Other Modals
```

## Data Flow Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐          │
│  │ Auth Service│  │  Database  │  │   Storage    │          │
│  │  (OAuth)    │  │  (Tables)  │  │  (Media)     │          │
│  └─────────────┘  └────────────┘  └──────────────┘          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Realtime Subscriptions (Future)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
        ▲                                       ▲
        │                                       │
        │ Queries & Mutations                  │ Real-time Updates
        │                                       │
┌───────┴───────────────────────────────────────┴───────────────┐
│                    CLIENT APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AuthContext (useAuth)                                     │
│  ├── user: SupabaseUser | null                            │
│  ├── session: Session | null                              │
│  ├── isLoading: boolean                                   │
│  └── isAuthenticated: boolean                             │
│                                                             │
│  Services Layer                                            │
│  ├── services/supabase.ts (Auth operations)              │
│  ├── services/geminiService.ts (AI)                      │
│  └── services/api.ts (HTTP)                              │
│                                                             │
│  Components (Use useAuth() to access auth state)          │
│  ├── LandingPage (Show if not authenticated)             │
│  └── App (Show if authenticated)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Authentication State Management

```
┌──────────────────────────────────────────────────────────────┐
│                  AuthContext.tsx                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  useEffect(() => {                                          │
│    // On mount: Check existing session                     │
│    getCurrentUser()                                         │
│                                                              │
│    // Listen to auth changes                               │
│    onAuthStateChange((user, session) => {                 │
│      setUser(user)                                         │
│      setSession(session)                                   │
│    })                                                       │
│  }, [])                                                    │
│                                                              │
│  const value = {                                            │
│    user,                    // Supabase User object        │
│    session,                 // Auth session                │
│    isLoading,              // Loading state               │
│    isAuthenticated         // user && session ? true      │
│  }                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         │
         │ Provided to App
         ▼
    useAuth() in any component
    const { user, isAuthenticated } = useAuth()
```

## File Organization (Current → Recommended)

### Current Structure
```
components/          ← 35+ files at root
├── chat components
├── modal components
├── landing/
└── ui/

contexts/           ← Good
├── AuthContext (NEW)
├── ThemeContext
└── LanguageContext

services/           ← Growing
├── api.ts
├── geminiService.ts
└── supabase.ts (NEW)

types.ts            ← Monolithic

pages/              ← Good
```

### Recommended Structure
```
components/
├── chat/            ← Group by feature
│   ├── ChatWindow.tsx
│   ├── ChatInput.tsx
│   └── index.ts
├── modals/
│   ├── ForwardModal.tsx
│   ├── EventCreator.tsx
│   └── index.ts
├── groups/
├── social/
├── sidebar/
├── common/
├── ui/
└── landing/

utils/              ← Extract helpers
├── formatters.ts
├── validators.ts
└── index.ts

hooks/              ← Custom hooks
├── useChat.ts
├── useLocalStorage.ts
└── index.ts

types/              ← Split types
├── chat.ts
├── user.ts
├── auth.ts
└── index.ts

contexts/           ← Enhanced
├── AuthContext.tsx
├── ChatContext.tsx  (Future)
└── index.ts
```

## Service Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     Services Layer                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Supabase (services/supabase.ts) - Authentication        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  • OAuth sign-in (Google, Microsoft)                    │ │
│  │  • Email/password auth                                  │ │
│  │  • Session management                                   │ │
│  │  • Password reset                                       │ │
│  │  • User profile updates                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Gemini (services/geminiService.ts) - AI                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  • Chat with bot                                        │ │
│  │  • Image generation                                     │ │
│  │  • Audio transcription                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ API (services/api.ts) - Backend calls                   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  • HTTP requests                                        │ │
│  │  • Data fetching                                        │ │
│  │  • API integration                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
        ▲
        │
        │ Called from Components & Contexts
        │
┌───────┴────────────────────────────────────────────────────────┐
│                  React Components                              │
├─────────────────────────────────────────────────────────────────┤
│  Example: ChatWindow.tsx                                       │
│  ├── useAuth() - Get user context                            │
│  ├── sendMessageToBot() - Call Gemini service               │
│  └── Store data in state or context                          │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Configuration

```
.env.local (LOCAL DEVELOPMENT)
├── VITE_SUPABASE_URL=https://xxx.supabase.co
├── VITE_SUPABASE_ANON_KEY=xxx
└── GEMINI_API_KEY=xxx

.env.production (PRODUCTION)
├── VITE_SUPABASE_URL=https://yyy.supabase.co
├── VITE_SUPABASE_ANON_KEY=yyy
└── GEMINI_API_KEY=yyy

.env.example (TEMPLATE FOR TEAM)
├── VITE_SUPABASE_URL=https://your_project_id.supabase.co
├── VITE_SUPABASE_ANON_KEY=your_anon_key
└── GEMINI_API_KEY=your_gemini_key
```

## Authentication Sequence

```
Step 1: User Clicks "Sign in with Google"
   AuthModal.tsx → handleOAuthSignIn('google')

Step 2: Supabase OAuth Flow
   services/supabase.ts → signInWithOAuth('google')
   │
   ├─ Redirects to Google OAuth consent screen
   ├─ User authenticates with Google
   └─ Google redirects back to app with auth code

Step 3: Session Creation
   Supabase exchanges code for JWT token
   │
   ├─ Stores token in localStorage
   ├─ Creates active session
   └─ Emits auth state change

Step 4: Context Updates
   AuthContext.tsx → onAuthStateChange listener
   │
   ├─ Sets user data
   ├─ Sets session
   ├─ Sets isAuthenticated = true
   └─ Triggers component re-renders

Step 5: App Rendered
   App.tsx checks isAuthenticated
   │
   ├─ If true → Show ChatWindow
   └─ If false → Show LandingPage
```

## Security Architecture

```
┌────────────────────────────────────────────┐
│        OAuth Provider (Google/Microsoft)   │
│     ✅ Verified Identity & Credentials     │
└────────────────┬───────────────────────────┘
                 │
                 ▼ (Secure token exchange)
        ┌─────────────────────┐
        │   Supabase Auth     │
        │  ✅ Manages JWT     │
        │  ✅ Session tokens  │
        │  ✅ Refresh tokens  │
        └──────────┬──────────┘
                   │
                   ▼ (Encrypted in localStorage)
        ┌─────────────────────┐
        │   Browser Storage   │
        │  ✅ Secure token    │
        │  ✅ Auto-refresh    │
        │  ⚠️  User can clear │
        └──────────┬──────────┘
                   │
                   ▼ (Included in requests)
        ┌─────────────────────┐
        │ App Requests Data   │
        │  ✅ Token in header │
        │  ✅ HTTPS only      │
        └─────────────────────┘
```

## Component Access Patterns

```
// Pattern 1: In Components
import { useAuth } from '../contexts/AuthContext'

export function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <div>Login required</div>
  return <div>Welcome {user?.email}</div>
}

// Pattern 2: With Service
import { signOut } from '../services/supabase'

async function handleLogout() {
  await signOut()
  // AuthContext will automatically update
}

// Pattern 3: In useEffect
useEffect(() => {
  const { user } = useAuth() // Don't do this - use properly
  // Correct way:
}, [user]) // Include user as dependency
```

---

This architecture ensures:
- ✅ **Secure** - OAuth managed by Supabase
- ✅ **Scalable** - Clear service boundaries
- ✅ **Maintainable** - Organized component structure
- ✅ **Testable** - Services and contexts can be mocked
- ✅ **User-friendly** - Smooth authentication experience
