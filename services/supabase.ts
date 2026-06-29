import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async (provider: 'google') => {
  try {
    console.log(`Initiating ${provider} OAuth sign-in...`);
    console.log(`Redirect URL: ${window.location.origin}`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}`,
        skipBrowserRedirect: false,
        // Add scopes for Google OAuth
        scopes: 'email profile',
      },
    });
    
    if (error) {
      console.error(`OAuth error:`, error);
      throw error;
    }
    
    console.log(`OAuth initiated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`OAuth sign in error (${provider}):`, error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithPassword = async (
  email: string,
  password: string,
  userData?: { name?: string; username?: string }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: any, session: any) => void
) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session || null);
  });

  return data?.subscription;
};

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: Record<string, any>) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};
