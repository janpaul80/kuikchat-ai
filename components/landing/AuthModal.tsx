import React, { useState } from 'react';
import { signInWithPassword, signUpWithPassword, signInWithOAuth } from '../../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
  onLogin: () => void;
}

export default function AuthModal({ isOpen, onClose, mode, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password, { name: fullName });
      }
      onLogin();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithOAuth('google');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google OAuth initiation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-6 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold"
          >
            &times;
          </button>
          
          <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h3>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 text-sm p-3.5 rounded-xl mb-5 text-center font-medium border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[#25D366] transition-colors"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[#25D366] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[#25D366] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25D366] text-white font-bold py-3.5 rounded-xl hover:bg-[#075E54] transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
            <span className="relative bg-white dark:bg-[#1e1e1e] px-4 text-xs font-semibold text-slate-400 uppercase">Or Continue With</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg viewBox="0 0 48 48" className="w-5 h-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.53 2.87-2.14 5.31-4.59 6.96l7.14 5.53C43.46 36.58 46.5 30.85 46.5 24z"/><path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/><path fill="#34A853" d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.14-5.53c-2.34 1.57-5.32 2.84-8.75 2.84z"/></svg>
            Google OAuth
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#25D366] hover:underline font-bold"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
