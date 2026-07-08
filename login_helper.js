import open from 'open';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create Express app for handling the OAuth callback
const app = express();
const PORT = 3001;

console.log('🔑 Login Helper');
console.log('===============');
console.log('\n1. Starting local server for login...');

// Route to handle the OAuth callback
app.get('/', async (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login Helper</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .btn {
            background: linear-gradient(to right, #2563eb, #22c55e);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>KuikChat Login Helper</h1>
        <p>Click the button below to log in to your KuikChat account:</p>
        
        <div class="card">
          <h2>Login Options</h2>
          <button class="btn" onclick="loginWithGoogle()">Login with Google</button>
          <button class="btn" style="background: #f3f4f6; color: #333;" onclick="directLogin()">Direct Login</button>
        </div>

        <script>
          function loginWithGoogle() {
            window.location.href = '/login-with-google';
          }
          
          function directLogin() {
            window.location.href = 'http://localhost:3000';
          }
        </script>
      </body>
    </html>
  `);
});

// Route to initiate Google OAuth login
app.get('/login-with-google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback',
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return res.status(400).send(`Error: ${error.message}`);
    }

    if (data?.url) {
      return res.redirect(data.url);
    }

    res.status(500).send('Failed to generate authentication URL');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// Route to handle the OAuth callback
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    if (code) {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Session error:', error);
        return res.status(400).send(`Authentication error: ${error.message}`);
      }
      
      if (data?.session) {
        console.log('User authenticated:', data.session.user.email);
        
        // Redirect to the main app
        return res.redirect('http://localhost:3000');
      }
    }
    
    res.status(400).send('Invalid or missing code parameter');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log('\n2. Opening login helper in browser...');
  
  // Open the browser
  open(`http://localhost:${PORT}`);
  
  console.log('\n3. Follow the instructions in the browser to log in');
  console.log('   You can use either:');
  console.log('   - Google OAuth login (requires Supabase setup)');
  console.log('   - Direct login to the app');
});

// Auto-close the server after 10 minutes
const TIMEOUT = 10 * 60 * 1000; // 10 minutes
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
