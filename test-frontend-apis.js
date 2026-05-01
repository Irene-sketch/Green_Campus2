// Simulate what the frontend does
console.log('=== Testing Frontend Data Access ===\n');

// Test 1: Fetch from /api/reports
fetch('http://localhost:3000/api/reports')
    .then(r => r.json())
    .then(data => {
        console.log('✅ Reports API Response:');
        console.log('  - Electricity:', data.elec, 'kWh');
        console.log('  - Water:', data.water, 'L');
        console.log('  - Waste:', data.waste, 'kg');
    })
    .catch(err => console.error('❌ Reports Error:', err.message));

// Test 2: Fetch from /api/resource-list
setTimeout(() => {
    fetch('http://localhost:3000/api/resource-list')
        .then(r => r.json())
        .then(data => {
            console.log('\n✅ Resource List API Response:');
            console.log('  - Total records:', data.length);
            if (data.length > 0) {
                console.log('  - Latest record:', {
                    building: data[0].BUILDING,
                    type: data[0].RES_TYPE,
                    quantity: data[0].QUANTITY
                });
            }
        })
        .catch(err => console.error('❌ Resource List Error:', err.message));
}, 500);

// Test 3: Add new resource (simulating user input)
setTimeout(() => {
    console.log('\n=== Testing Data Submission ===\n');
    const newResource = {
        type: 'water',
        qty: 500,
        date: new Date().toISOString().split('T')[0],
        building: 'Civil Block',
        time: new Date().toTimeString().substring(0, 5)
    };
    
    console.log('Submitting new resource:', newResource);
    
    fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Data submitted successfully!');
        } else {
            console.log('❌ Submission failed:', data);
        }
    })
    .catch(err => console.error('❌ Submit Error:', err.message));
}, 1000);

console.log('\nWaiting for API responses...\n');
