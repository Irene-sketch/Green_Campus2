// Final test
const http = require('http');

function test(path) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', () => resolve({ status: 'error' }));
    });
}

async function main() {
    console.log('Testing endpoints...\n');
    const reports = await test('/api/reports');
    console.log(`/api/reports: ${reports.status} -`, reports.body.substring(0, 80));
    
    const list = await test('/api/resource-list');
    console.log(`/api/resource-list: ${list.status} -`, list.body.substring(0, 80));
}

setTimeout(main, 2000);
