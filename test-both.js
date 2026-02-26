// Test both endpoints
const http = require('http');

function makeRequest(method, path) {
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
                resolve({ 
                    status: res.statusCode, 
                    body: body
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    try {
        console.log('\n=== Testing /api/reports ===');
        const reports = await makeRequest('GET', '/api/reports');
        console.log('Status:', reports.status);
        console.log('Body:', reports.body.substring(0, 100));
        
        console.log('\n=== Testing /api/logs ===');
        const logs = await makeRequest('GET', '/api/logs');
        console.log('Status:', logs.status);
        console.log('Body:', logs.body.substring(0, 100));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

setTimeout(test, 3000);
