// Quick test of the sync-doctor endpoint
const testDoctor = {
    type: 'INSERT',
    table: 'doctors',
    record: {
        did: '350e8400-test-test-test-446655440999',
        uid: '650e8400-test-test-test-446655440999',
        specialization: 'Test Cardiology',
        qualification: 'MBBS, MD',
        registration_number: 'TEST-001',
        years_of_experience: 10,
        consultation_fee: '1000.00',
        bio: 'Test doctor for webhook verification',
        clinic_name: 'Test Heart Clinic',
        address_line1: '123 Test Road',
        address_line2: null,
        city: 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
        postal_code: '452001',
        languages: ['English', 'Hindi'],
        is_verified: true
    }
};

fetch('http://localhost:3000/api/sync-doctor', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer qJUdz1aN4C8MPm9l7jtrgwHuhbWpycOT'
    },
    body: JSON.stringify(testDoctor)
})
    .then(res => res.json())
    .then(data => {
        console.log('✅ SUCCESS!');
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.log('❌ ERROR:', err.message);
    });
