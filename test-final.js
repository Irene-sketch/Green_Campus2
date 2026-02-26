// Test both test and resource-list endpoints
const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
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
        console.log('\nTesting /api/test...');
        const test = await makeRequest('/api/test');
        console.log('Status:', test.status);
        console.log('Body:', test.body.substring(0, 100));
        
        console.log('\nTesting /api/resource-list...');
        const list = await makeRequest('/api/resource-list');
        console.log('Status:', list.status);
        console.log('Body:', list.body.substring(0, 100));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

setTimeout(test, 2000);
