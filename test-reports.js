// Test /api/reports
const http = require('http');

const req = http.get('http://localhost:3000/api/reports', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});
