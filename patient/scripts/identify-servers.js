console.log('Testing which server is which...\n');

// Test port 3000
fetch('http://localhost:3000/api/search?query=test')
    .then(res => res.json())
    .then(data => {
        console.log('✅ Port 3000 - RAG Search API found!');
        console.log('   This is the AYUR-RAG server');
    })
    .catch(err => {
        console.log('❌ Port 3000 - No RAG API found');
    });

// Test port 3001  
setTimeout(() => {
    fetch('http://localhost:3001')
        .then(res => res.text())
        .then(html => {
            if (html.includes('patient') || html.includes('Patient')) {
                console.log('✅ Port 3001 - Patient portal found');
            } else {
                console.log('✅ Port 3001 - Some Next.js app');
            }
        })
        .catch(err => {
            console.log('❌ Port 3001 - Not accessible');
        });
}, 1000);

// Test the sync endpoint
setTimeout(() => {
    fetch('http://localhost:3000/api/sync-doctor')
        .then(res => {
            console.log('\n✅ Port 3000 has /api/sync-doctor endpoint');
            console.log('   Status:', res.status);
            console.log('\n🎯 CONCLUSION: ayur-rag is running on port 3000');
        })
        .catch(err => {
            console.log('❌ No sync-doctor endpoint on port 3000');
        });
}, 2000);
