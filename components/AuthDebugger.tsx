import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

/**
 * AuthDebugger component to help diagnose authentication issues
 * Add this component to your app temporarily to debug auth problems
 */
export default function AuthDebugger() {
  const [authState, setAuthState] = useState<{
    session: any;
    user: any;
    error: string | null;
    authUrl: string | null;
    redirectUrl: string;
  }>({
    session: null,
    user: null,
    error: null,
    authUrl: null,
    redirectUrl: window.location.origin,
  });

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({ ...prev, error: error.message }));
        } else {
          setAuthState(prev => ({ 
            ...prev, 
            session: data.session,
            user: data.session?.user || null
          }));
        }
      } catch (err: any) {
        setAuthState(prev => ({ ...prev, error: err.message }));
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setAuthState(prev => ({ 
          ...prev, 
          session: session,
          user: session?.user || null
        }));
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Function to test Google OAuth
  const testGoogleAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authState.redirectUrl,
          scopes: 'email profile',
        },
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
      } else {
        setAuthState(prev => ({ ...prev, authUrl: data?.url || null }));
      }
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message }));
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
      }
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-white border border-gray-300 shadow-lg rounded-tl-lg max-w-md z-50 overflow-auto max-h-[80vh]">
      <h2 className="text-lg font-bold mb-2">Auth Debugger</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Environment</h3>
        <div className="text-xs bg-gray-100 p-2 rounded">
          <p>URL: {window.location.href}</p>
          <p>Redirect URL: {authState.redirectUrl}</p>
          <p>Supabase URL: {(import.meta as any).env?.VITE_SUPABASE_URL || 'Not set'}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">Authentication State</h3>
        <div className="text-xs bg-gray-100 p-2 rounded">
          <p>Authenticated: {authState.user ? 'Yes' : 'No'}</p>
          {authState.user && (
            <>
              <p>User ID: {authState.user.id}</p>
              <p>Email: {authState.user.email}</p>
              <p>Provider: {authState.user.app_metadata?.provider || 'Unknown'}</p>
            </>
          )}
        </div>
      </div>
      
      {authState.error && (
        <div className="mb-4">
          <h3 className="font-semibold text-red-600">Error</h3>
          <div className="text-xs bg-red-50 text-red-700 p-2 rounded">
            {authState.error}
          </div>
        </div>
      )}
      
      {authState.authUrl && (
        <div className="mb-4">
          <h3 className="font-semibold">Auth URL</h3>
          <div className="text-xs bg-blue-50 p-2 rounded break-all">
            <a href={authState.authUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {authState.authUrl}
            </a>
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={testGoogleAuth}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Test Google Auth
        </button>
        
        {authState.user && (
          <button
            onClick={signOut}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Sign Out
          </button>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Add this component to your app temporarily to debug authentication issues.</p>
        <p>Remove it before deploying to production.</p>
      </div>
    </div>
  );
}
