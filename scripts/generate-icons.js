// Simple script to create placeholder icons
// In a real project, you would use proper icon generation tools

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#10B981" rx="${size * 0.1}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.15}" fill="white"/>
  <path d="M${size * 0.3} ${size * 0.6} Q${size * 0.5} ${size * 0.8} ${size * 0.7} ${size * 0.6}" 
        stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
  <text x="${size * 0.5}" y="${size * 0.9}" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">AS</text>
</svg>
`;

// Create icons directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons
const icon192 = createSVGIcon(192);
const icon512 = createSVGIcon(512);

fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

// Create a simple favicon
const favicon = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#10B981" rx="3"/>
  <circle cx="16" cy="12" r="4" fill="white"/>
  <path d="M8 20 Q16 26 24 20" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon);

console.log('Icons generated successfully!');
console.log('Note: For production, convert SVG icons to PNG format using a proper tool.');