// Test script to verify data saving and retrieval
const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    console.log('Testing API endpoints...\n');

    try {
        // Test saving a resource
        console.log('1. Testing POST /api/resources...');
        const saveResult = await makeRequest('POST', '/api/resources', {
            type: 'electricity',
            qty: 50,
            date: '2026-02-26'
        });
        console.log('Response:', saveResult);
        console.log('');

        // Test retrieving logs
        console.log('2. Testing GET /api/resource-logs...');
        const logsResult = await makeRequest('GET', '/api/resource-logs');
        console.log('Response status:', logsResult.status);
        console.log('Data:', logsResult.body);
        console.log('');

        // Test reports
        console.log('3. Testing GET /api/reports...');
        const reportsResult = await makeRequest('GET', '/api/reports');
        console.log('Response status:', reportsResult.status);
        console.log('Data:', reportsResult.body);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Give server a moment to start
setTimeout(test, 2000);
