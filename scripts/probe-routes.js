const http = require('http');

const routes = [
  '/', '/about', '/pricing', '/security', '/features', '/download',
  '/privacy', '/terms', '/contact', '/login', '/signup', '/support',
  '/gdpr', '/cookies'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3100,
      path: route,
      method: 'GET'
    }, (res) => {
      console.log(`${route} : ${res.statusCode}`);
      resolve();
    });

    req.on('error', (e) => {
      console.log(`${route} : FAILED (${e.message})`);
      resolve();
    });

    req.end();
  });
}

async function run() {
  for (const route of routes) {
    await checkRoute(route);
  }
}

run();
