// OAuth debug script with browser session support
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import open from 'open';
import http from 'http';
import url from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create a simple server to handle the OAuth callback
async function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      // Check if this is the callback from OAuth
      if (parsedUrl.pathname === '/') {
        // Send a response to the browser
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>OAuth Authentication</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .success { color: green; }
              .error { color: red; }
              pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>OAuth Authentication</h1>
            <div id="status">Checking authentication status...</div>
            <div id="details"></div>
            
            <script>
              // Function to check auth status
              async function checkAuth() {
                try {
                  const response = await fetch('/auth-status');
                  const data = await response.json();
                  
                  const statusEl = document.getElementById('status');
                  const detailsEl = document.getElementById('details');
                  
                  if (data.authenticated) {
                    statusEl.innerHTML = '<h2 class="success">✅ Authentication Successful!</h2>';
                    detailsEl.innerHTML = \`
                      <h3>User Details:</h3>
                      <pre>\${JSON.stringify(data.user, null, 2)}</pre>
                      <p>You can now close this window and return to the terminal.</p>
                    \`;
                  } else {
                    statusEl.innerHTML = '<h2 class="error">❌ Not Authenticated</h2>';
                    detailsEl.innerHTML = \`
                      <p>Authentication was not successful. Please check the terminal for more information.</p>
                      <p>You can close this window and try again.</p>
                    \`;
                  }
                } catch (error) {
                  document.getElementById('status').innerHTML = '<h2 class="error">❌ Error Checking Authentication</h2>';
                  document.getElementById('details').innerHTML = \`<p>Error: \${error.message}</p>\`;
                }
              }
              
              // Check auth status when page loads
              checkAuth();
            </script>
          </body>
          </html>
        `);
        
        // Let the server continue running to handle the auth-status request
      }
      
      // Endpoint to check auth status
      if (parsedUrl.pathname === '/auth-status') {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.getSession();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        if (error) {
          res.end(JSON.stringify({ authenticated: false, error: error.message }));
          return;
        }
        
        if (data.session) {
          res.end(JSON.stringify({ 
            authenticated: true, 
            user: {
              id: data.session.user.id,
              email: data.session.user.email,
              provider: data.session.user.app_metadata.provider,
              name: data.session.user.user_metadata.full_name,
              avatar_url: data.session.user.user_metadata.avatar_url,
              created_at: data.session.user.created_at,
              last_sign_in: data.session.user.last_sign_in_at
            }
          }));
        } else {
          res.end(JSON.stringify({ authenticated: false }));
        }
      }
    });
    
    server.listen(3001, () => {
      console.log('✅ Local server started on http://localhost:3001');
      resolve(server);
    });
  });
}

async function testOAuth() {
  console.log('🔍 Enhanced OAuth Testing');
  console.log('========================');
  
  // Start local server
  console.log('\n1. Starting local server for callback handling...');
  const server = await startServer();
  
  // Initialize Supabase
  console.log('\n2. Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Generate OAuth URL
  console.log('\n3. Generating Google OAuth URL...');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001',
        skipBrowserRedirect: false,
      }
    });
    
    if (error) {
      console.error(`❌ Error generating OAuth URL: ${error.message}`);
      server.close();
      return;
    }
    
    console.log('✅ Opening Google OAuth URL in browser...');
    console.log('   You should be redirected to Google login page');
    console.log('   After logging in, you will be redirected to the local server');
    console.log('   The local server will display your authentication status');
    
    // Keep the server running for 5 minutes
    console.log('\n4. Waiting for authentication to complete...');
    console.log('   The server will automatically shut down in 5 minutes');
    console.log('   You can press Ctrl+C to stop the server at any time');
    
    // Set a timeout to close the server after 5 minutes
    setTimeout(() => {
      console.log('\n⏱️ Time limit reached. Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error(`❌ Exception during OAuth test: ${error.message}`);
    server.close();
  }
}

// Run the test
testOAuth().catch(error => {
  console.error(`❌ Unhandled error: ${error.message}`);
  process.exit(1);
});
