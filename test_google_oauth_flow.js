// Test Google OAuth with Supabase
import open from 'open';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Google OAuth Testing Tool');
console.log('===========================');

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local file');
  console.log('Please make sure your .env.local file contains:');
  console.log('VITE_SUPABASE_URL=your-supabase-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client initialized');

// Start a local server to handle the OAuth callback
const app = express();
const PORT = 3001;

// Route to initiate Google OAuth
app.get('/', async (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Google OAuth Test</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .btn {
            background: linear-gradient(to right, #2563eb, #22c55e);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            margin: 20px 0;
            display: inline-block;
            text-decoration: none;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
          }
          pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow: auto;
          }
        </style>
      </head>
      <body>
        <h1>Google OAuth Test with Supabase</h1>
        <p>This tool will help you test the Google OAuth flow with Supabase and verify the redirect to your chat app.</p>
        
        <div class="card">
          <h2>Step 1: Start OAuth Flow</h2>
          <p>Click the button below to start the Google OAuth flow:</p>
          <a href="/start-oauth" class="btn">Start Google OAuth</a>
        </div>
        
        <div class="card">
          <h2>Supabase Configuration</h2>
          <p>Using the following Supabase configuration:</p>
          <pre>URL: ${supabaseUrl.substring(0, 8)}...${supabaseUrl.substring(supabaseUrl.length - 5)}</pre>
        </div>
        
        <div class="card">
          <h2>Debugging Tips</h2>
          <p>If you encounter issues:</p>
          <ul>
            <li>Check that your Supabase project has Google OAuth enabled</li>
            <li>Verify that your Google OAuth credentials are correctly configured</li>
            <li>Make sure the redirect URL in Google Cloud Console includes: <code>${supabaseUrl}/auth/v1/callback</code></li>
            <li>Check browser console for any errors</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Route to start the OAuth flow
app.get('/start-oauth', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:${PORT}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ OAuth error:', error);
      return res.status(400).send(`
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .error { background: #fee; border: 1px solid #f99; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>OAuth Error</h1>
            <div class="error">
              <p>${error.message}</p>
            </div>
            <p><a href="/">← Back to test page</a></p>
          </body>
        </html>
      `);
    }

    if (data?.url) {
      console.log('✅ OAuth URL generated, redirecting user...');
      return res.redirect(data.url);
    }

    res.status(500).send('Failed to generate authentication URL');
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// Route to handle the OAuth callback
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    if (code) {
      console.log('✅ Received OAuth callback with code');
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Session error:', error);
        return res.status(400).send(`
          <html>
            <head>
              <title>Authentication Error</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .error { background: #fee; border: 1px solid #f99; padding: 15px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <h1>Authentication Error</h1>
              <div class="error">
                <p>${error.message}</p>
              </div>
              <p><a href="/">← Back to test page</a></p>
            </body>
          </html>
        `);
      }
      
      if (data?.session) {
        console.log('✅ Authentication successful!');
        console.log(`User: ${data.session.user.email}`);
        
        // Show success page with option to redirect to the app
        return res.send(`
          <html>
            <head>
              <title>Authentication Successful</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  line-height: 1.6;
                }
                .success {
                  background: #efe;
                  border: 1px solid #9f9;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .btn {
                  background: linear-gradient(to right, #2563eb, #22c55e);
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 30px;
                  cursor: pointer;
                  font-size: 16px;
                  margin: 20px 0;
                  display: inline-block;
                  text-decoration: none;
                }
                pre {
                  background: #f5f5f5;
                  padding: 10px;
                  border-radius: 5px;
                  overflow: auto;
                  max-height: 200px;
                }
              </style>
            </head>
            <body>
              <h1>Authentication Successful! 🎉</h1>
              
              <div class="success">
                <p><strong>User:</strong> ${data.session.user.email}</p>
                <p><strong>Status:</strong> Successfully authenticated with Google via Supabase</p>
              </div>
              
              <h2>Next Steps</h2>
              <p>Click the button below to go to your chat app:</p>
              <a href="http://localhost:3000" class="btn">Go to Chat App</a>
              
              <h2>Session Details</h2>
              <pre>${JSON.stringify({
                user: {
                  id: data.session.user.id,
                  email: data.session.user.email,
                  name: data.session.user.user_metadata?.full_name,
                },
                expires_at: new Date(data.session.expires_at * 1000).toLocaleString()
              }, null, 2)}</pre>
              
              <p><a href="/">← Back to test page</a></p>
              
              <script>
                // Log authentication success to console
                console.log('Authentication successful!', ${JSON.stringify(data.session.user)});
                
                // Store session in localStorage to simulate the app's behavior
                localStorage.setItem('supabase.auth.token', JSON.stringify({
                  access_token: '${data.session.access_token}',
                  refresh_token: '${data.session.refresh_token}',
                  expires_at: ${data.session.expires_at}
                }));
              </script>
            </body>
          </html>
        `);
      }
    }
    
    res.status(400).send('Invalid or missing code parameter');
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`✅ OAuth test server started on http://localhost:${PORT}`);
  console.log('Opening browser...');
  
  // Open the browser
  open(`http://localhost:${PORT}`);
});

// Auto-close the server after 30 minutes
const TIMEOUT = 30 * 60 * 1000; // 30 minutes
setTimeout(() => {
  console.log('\nTimeout reached. Shutting down server...');
  server.close();
  process.exit(0);
}, TIMEOUT);

// Handle CTRL+C
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close();
  process.exit(0);
});
