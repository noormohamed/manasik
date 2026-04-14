#!/usr/bin/env node

const http = require('http');

const tests = [
  {
    name: 'Frontend - Homepage',
    url: 'http://localhost:3000',
    expectedStatus: 200,
  },
  {
    name: 'Admin Panel - Login Page',
    url: 'http://localhost:3002/admin/login',
    expectedStatus: 200,
  },
  {
    name: 'API - Health Check',
    url: 'http://localhost:3001/api/health',
    expectedStatus: 200,
  },
  {
    name: 'API - Login Endpoint',
    url: 'http://localhost:3001/api/admin/auth/login',
    method: 'POST',
    body: JSON.stringify({ email: 'admin@bookingplatform.com', password: 'password123' }),
    expectedStatus: 200,
  },
  {
    name: 'API - Users Endpoint',
    url: 'http://localhost:3001/api/admin/users?page=1&limit=10',
    headers: { 'Authorization': 'Bearer test' },
    expectedStatus: 200,
  },
  {
    name: 'API - Bookings Endpoint',
    url: 'http://localhost:3001/api/admin/bookings?page=1&limit=10',
    headers: { 'Authorization': 'Bearer test' },
    expectedStatus: 200,
  },
  {
    name: 'API - Reviews Endpoint',
    url: 'http://localhost:3001/api/admin/reviews?page=1&limit=10',
    headers: { 'Authorization': 'Bearer test' },
    expectedStatus: 200,
  },
];

let passed = 0;
let failed = 0;

async function runTest(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...test.headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;
        if (success) {
          console.log(`✅ ${test.name} - ${res.statusCode}`);
          passed++;
        } else {
          console.log(`❌ ${test.name} - Expected ${test.expectedStatus}, got ${res.statusCode}`);
          failed++;
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${test.name} - ${err.message}`);
      failed++;
      resolve();
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('\n🧪 Running Comprehensive Tests\n');
  
  for (const test of tests) {
    await runTest(test);
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
