#!/usr/bin/env node

/**
 * Webhook Simulation Tool
 * 
 * Usage: node scripts/send_webhook.js <visit_id> <task_id> [status] [base_url]
 * 
 * Examples:
 * node scripts/send_webhook.js visit-123 task-456
 * node scripts/send_webhook.js visit-123 task-456 success
 * node scripts/send_webhook.js visit-123 task-456 failed http://localhost:3000
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/send_webhook.js <visit_id> <task_id> [status] [base_url]');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/send_webhook.js visit-123 task-456');
  console.error('  node scripts/send_webhook.js visit-123 task-456 success');
  console.error('  node scripts/send_webhook.js visit-123 task-456 failed http://localhost:3000');
  process.exit(1);
}

const [visitId, taskId, status = 'success', baseUrl = 'http://localhost:3000'] = args;

// Validate status
if (!['pending', 'success', 'failed'].includes(status)) {
  console.error('Error: status must be one of: pending, success, failed');
  process.exit(1);
}

// Prepare webhook payload
const payload = {
  visit_id: visitId,
  task_id: taskId,
  status: status,
  meta: {
    simulated: true,
    timestamp: new Date().toISOString(),
    source: 'webhook-simulator'
  }
};

const postData = JSON.stringify(payload);

// Determine if we're using HTTPS or HTTP
const isHttps = baseUrl.startsWith('https://');
const client = isHttps ? https : http;
const url = new URL(`${baseUrl}/api/webhooks/social-callback`);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Webhook-Simulator/1.0'
  }
};

console.log(`Sending webhook to: ${url.href}`);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('');

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    console.log('Response Body:', data);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ Webhook sent successfully!');
      try {
        const response = JSON.parse(data);
        if (response.id) {
          console.log(`📝 Created completion with ID: ${response.id}`);
        }
      } catch (e) {
        // Response might not be JSON
      }
    } else {
      console.log('\n❌ Webhook failed!');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  process.exit(1);
});

req.write(postData);
req.end();
