// Test the new /api/logs endpoint
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
                    body: body,
                    isJson: body.startsWith('{') || body.startsWith('[')
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing GET /api/logs...');
        const result = await makeRequest('GET', '/api/logs');
        console.log('Status:', result.status);
        console.log('Is JSON:', result.isJson);
        console.log('Body:', result.body);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

setTimeout(test, 2000);
