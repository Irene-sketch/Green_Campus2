// Better test script with response details
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
                resolve({ 
                    status: res.statusCode, 
                    headers: res.headers,
                    body: body,
                    isJson: body.startsWith('{') || body.startsWith('[')
                });
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
        // Test getting logs
        console.log('Testing GET /api/resource-logs...');
        const logsResult = await makeRequest('GET', '/api/resource-logs');
        console.log('Status:', logsResult.status);
        console.log('Headers:', logsResult.headers);
        console.log('Is JSON:', logsResult.isJson);
        console.log('Body (first 200 chars):', logsResult.body.substring(0, 200));
        console.log('');

        // Test reports
        console.log('Testing GET /api/reports...');
        const reportsResult = await makeRequest('GET', '/api/reports');
        console.log('Status:', reportsResult.status);
        console.log('Is JSON:', reportsResult.isJson);
        console.log('Body:', reportsResult.body);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

setTimeout(test, 2000);
