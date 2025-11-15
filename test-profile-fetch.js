// Test script to check if we can fetch the user profile
const testEmail = 'atkola12345@gmail.com';

console.log(`Testing profile fetch for: ${testEmail}`);

// This would be the API call
const apiUrl = `/api/profile/user?email=${encodeURIComponent(testEmail)}`;
console.log(`API URL: ${apiUrl}`);

// In the browser, you can test this by opening the developer console and running:
// fetch('/api/profile/user?email=atkola12345@gmail.com').then(r => r.json()).then(console.log)