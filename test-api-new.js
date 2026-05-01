// Test the API endpoints
const http = require('http');

// Test data
const testData = {
    type: 'electricity',
    qty: 150,
    date: '2026-03-25',
    building: 'Main Block',
    time: '14:30'
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/resources',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing /api/resources endpoint...');
console.log('Sending data:', testData);

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse Status:', res.statusCode);
        console.log('Response:', data);
        
        // Test the GET endpoints
        setTimeout(() => testGetEndpoints(), 1000);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(postData);
req.end();

function testGetEndpoints() {
    console.log('\n\nTesting /api/reports endpoint...');
    const getOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/reports',
        method: 'GET'
    };

    const req2 = http.request(getOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Reports Response:', data);
            testResourceList();
        });
    });

    req2.on('error', (e) => {
        console.error('Error:', e);
    });

    req2.end();
}

function testResourceList() {
    console.log('\n\nTesting /api/resource-list endpoint...');
    const getOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resource-list',
        method: 'GET'
    };

    const req3 = http.request(getOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Resource List Response:', data);
        });
    });

    req3.on('error', (e) => {
        console.error('Error:', e);
    });

    req3.end();
}
