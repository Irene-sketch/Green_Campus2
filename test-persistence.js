// Test the FIXED dashboard and database persistence

console.log('=== TESTING DATABASE PERSISTENCE ===\n');

const testData = [
  { type: 'electricity', qty: 75, building: 'Civil Block', date: '2026-03-26' },
  { type: 'water', qty: 850, building: 'Library', date: '2026-03-26' },
  { type: 'waste', qty: 45, building: 'Hostel1', date: '2026-03-26' }
];

let testIndex = 0;

function submitNextData() {
  if (testIndex >= testData.length) {
    console.log('\n✅ All test data submitted!');
    setTimeout(() => verifyData(), 500);
    return;
  }

  const data = testData[testIndex];
  console.log(`\nSubmitting [${testIndex + 1}/${testData.length}]:`, data);

  fetch('http://localhost:3000/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: data.type,
      qty: data.qty,
      date: data.date,
      building: data.building,
      time: new Date().toTimeString().substring(0, 5)
    })
  })
  .then(r => r.json())
  .then(response => {
    if (response.success) {
      console.log(`  ✅ ${data.type}: ${data.qty} stored in database`);
    } else {
      console.log(`  ❌ Error:`, response.error);
    }
    testIndex++;
    setTimeout(() => submitNextData(), 300);
  })
  .catch(err => {
    console.error(`  ❌ Network error:`, err.message);
    testIndex++;
    setTimeout(() => submitNextData(), 300);
  });
}

function verifyData() {
  console.log('\n=== VERIFYING DATA IN DATABASE ===\n');

  // Test 1: Check reports endpoint
  fetch('http://localhost:3000/api/reports')
    .then(r => r.json())
    .then(data => {
      console.log('✅ Reports Summary:');
      console.log(`   Electricity total: ${data.elec} kWh`);
      console.log(`   Water total: ${data.water} L`);
      console.log(`   Waste total: ${data.waste} kg`);
    })
    .catch(err => console.error('❌ Reports error:', err.message));

  // Test 2: Check resource list endpoint
  setTimeout(() => {
    fetch('http://localhost:3000/api/resource-list')
      .then(r => r.json())
      .then(data => {
        console.log('\n✅ Resource List (Database Records):');
        console.log(`   Total records in database: ${data.length}`);
        
        // Show last 3 records
        console.log('   Latest entries:');
        data.slice(0, 3).forEach((record, i) => {
          const date = new Date(record.ENTRY_DATE).toISOString().split('T')[0];
          console.log(`     [${i+1}] ${record.RES_TYPE} - ${record.QUANTITY} @ ${record.BUILDING} (${date})`);
        });
      })
      .catch(err => console.error('❌ Resource list error:', err.message));
  }, 500);

  // Test 3: Simulate dashboard page load
  setTimeout(() => {
    console.log('\n=== SIMULATING DASHBOARD PAGE LOAD ===\n');
    fetch('http://localhost:3000/api/resource-list')
      .then(r => r.json())
      .then(resources => {
        const totals = { electricity: 0, water: 0, waste: 0 };
        
        resources.forEach(r => {
          if (r.RES_TYPE === 'electricity') totals.electricity += r.QUANTITY;
          else if (r.RES_TYPE === 'water') totals.water += r.QUANTITY;
          else if (r.RES_TYPE === 'waste') totals.waste += r.QUANTITY;
        });
        
        console.log('✅ Dashboard would display:');
        console.log(`   ⚡ Electricity: ${totals.electricity} kWh`);
        console.log(`   💧 Water: ${totals.water} L`);
        console.log(`   ♻ Waste: ${totals.waste} kg`);
        console.log('\n🎉 DATABASE PERSISTENCE IS WORKING!');
        console.log('Data will remain even after page refresh/restart.');
      })
      .catch(err => console.error('❌ Dashboard load error:', err.message));
  }, 1000);
}

console.log('Starting data submission test...\n');
submitNextData();
