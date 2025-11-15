#!/usr/bin/env node

/**
 * Script to add new translations to the lingoClient.ts file
 * Usage: node scripts/add-translation.js "key.name" "English text" "Hindi text"
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error('Usage: node scripts/add-translation.js "key.name" "English text" "Hindi text"');
  console.error('Example: node scripts/add-translation.js "button.save" "Save" "सेव करें"');
  process.exit(1);
}

const [key, englishText, hindiText] = args;

// Validate key format
if (!key.includes('.')) {
  console.error('Error: Key must contain at least one dot (e.g., "section.key")');
  process.exit(1);
}

// Path to lingoClient.ts
const lingoClientPath = path.join(__dirname, '..', 'lib', 'lingoClient.ts');

try {
  // Read the current file
  let content = fs.readFileSync(lingoClientPath, 'utf8');

  // Create the new translation entry
  const newTranslation = `  '${key}': {
    key: '${key}',
    en: '${englishText.replace(/'/g, "\\'")}',
    hi: '${hindiText.replace(/'/g, "\\'")}'
  },`;

  // Find the last translation entry and add the new one before the closing brace
  const lastTranslationRegex = /(\s+}[^}]*?)(\n};)/;
  
  if (content.match(lastTranslationRegex)) {
    content = content.replace(lastTranslationRegex, `$1,\n\n${newTranslation}$2`);
  } else {
    console.error('Error: Could not find the right place to insert the translation');
    process.exit(1);
  }

  // Write the updated content back to the file
  fs.writeFileSync(lingoClientPath, content, 'utf8');

  console.log(`✅ Successfully added translation:`);
  console.log(`   Key: ${key}`);
  console.log(`   English: ${englishText}`);
  console.log(`   Hindi: ${hindiText}`);
  console.log(`\nYou can now use it in your components with:`);
  console.log(`   t('${key}', '${englishText}')`);

} catch (error) {
  console.error('Error adding translation:', error.message);
  process.exit(1);
}