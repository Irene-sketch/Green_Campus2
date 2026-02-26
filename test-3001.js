// Test server on port 3001
const http = require('http');

function makeRequest(port, path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body });
            });
        });
        req.on('error', reject);
    });
}

async function test() {
    try {
        console.log('Testing /api/hello on port 3001...');
        const hello = await makeRequest(3001, '/api/hello');
        console.log('Status:', hello.status);
        console.log('Body:', hello.body);
        
        console.log('\nTesting /api/all-logs on port 3001...');
        const logs = await makeRequest(3001, '/api/all-logs');
        console.log('Status:', logs.status);
        console.log('Body:', logs.body.substring(0, 100));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

setTimeout(test, 2000);
