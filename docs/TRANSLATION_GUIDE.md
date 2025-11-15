# Translation System Guide

This guide explains how to use the comprehensive translation system in your HealthPWA application.

## Overview

The translation system supports:
- ✅ **Static UI translations** - Pre-defined text in multiple languages
- ✅ **Dynamic content translation** - Real-time translation via Lingo.dev API
- ✅ **Localized formatting** - Numbers, dates, currency, and time
- ✅ **Language persistence** - Remembers user's language preference
- ✅ **Font optimization** - Language-specific fonts for better readability

## Supported Languages

- **English (en)** - Primary language
- **हिंदी (hi)** - Hindi language with Devanagari script

## Quick Start

### 1. Using Translations in Components

```tsx
import { useTranslation } from '@/lib/useTranslation';

export function MyComponent() {
  const { t, currentLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('hero.title', 'Find Healthcare Professionals')}</h1>
      <p>{t('hero.subtitle', 'Get AI-powered recommendations')}</p>
    </div>
  );
}
```

### 2. Language Toggle

The `LanguageToggle` component is already included in your layout:

```tsx
import { LanguageToggle } from '@/components/LanguageToggle';

// Already included in app/layout.tsx
<LanguageToggle />
```

### 3. Adding New Translations

#### Method 1: Using the Script (Recommended)

```bash
node scripts/add-translation.js "button.save" "Save" "सेव करें"
node scripts/add-translation.js "error.network" "Network error" "नेटवर्क त्रुटि"
```

#### Method 2: Manual Addition

Add to `lib/lingoClient.ts` in the `UI_TRANSLATIONS` object:

```typescript
'button.save': {
  key: 'button.save',
  en: 'Save',
  hi: 'सेव करें'
},
```

## Advanced Features

### 1. Formatted Content

```tsx
const { translateCurrency, translateDate, translateTime } = useTranslation();

// Currency formatting
const price = translateCurrency(1500); // ₹1,500 or ₹१,५००

// Date formatting  
const date = translateDate(new Date()); // March 15, 2024 or १५ मार्च, २०२४

// Time formatting
const time = translateTime(new Date()); // 2:30 PM or दोपहर २:३०
```

### 2. Dynamic Translation

```tsx
const { translateText } = useTranslation();

const handleTranslate = async () => {
  const translated = await translateText('Hello world', 'hi');
  console.log(translated); // "नमस्ते दुनिया"
};
```

### 3. Conditional Translations

```tsx
import { useConditionalTranslation } from '@/lib/useTranslation';

const message = useConditionalTranslation(
  isOnline, 
  'status.online', 
  'status.offline'
);
```

### 4. Pluralization

```tsx
import { usePluralization } from '@/lib/useTranslation';

const itemText = usePluralization(
  count,
  'item.singular', // "1 item"
  'item.plural'    // "5 items"
);
```

## Translation Keys Structure

Organize your translation keys by feature/section:

```
nav.*          - Navigation items
search.*       - Search functionality  
booking.*      - Appointment booking
auth.*         - Authentication
dashboard.*    - User dashboard
progress.*     - Progress tracking
common.*       - Common UI elements
status.*       - Status messages
error.*        - Error messages
success.*      - Success messages
disclaimer.*   - Medical disclaimers
demo.*         - Demo page content
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_LINGO_API_KEY=your_lingo_dev_api_key
```

### Lingo.dev Setup

1. Sign up at [lingo.dev](https://lingo.dev)
2. Create a new project
3. Get your API key
4. Add supported languages: English (en) and Hindi (hi)

## Best Practices

### 1. Always Provide Fallbacks

```tsx
// Good ✅
t('button.save', 'Save')

// Bad ❌ - No fallback
t('button.save')
```

### 2. Use Semantic Keys

```tsx
// Good ✅
t('booking.confirmAppointment', 'Confirm Appointment')

// Bad ❌ - Generic key
t('button1', 'Confirm Appointment')
```

### 3. Keep Translations Short

```tsx
// Good ✅
t('nav.home', 'Home')

// Consider breaking up ❌
t('long.description', 'This is a very long description that should probably be broken into smaller parts')
```

### 4. Use Language Classes

```tsx
const { getLanguageClass } = useTranslation();

return (
  <div className={`container ${getLanguageClass()}`}>
    {/* Content will use appropriate font */}
  </div>
);
```

## Testing Translations

### 1. Translation Demo Page

Visit `/translation-demo` to test the translation system:
- Switch between languages
- View all translations
- Test dynamic translation
- See formatted content

### 2. Manual Testing

```tsx
// Test in browser console
localStorage.setItem('healthpwa_language', 'hi');
window.location.reload();
```

## Troubleshooting

### Common Issues

1. **Translation not showing**
   - Check if key exists in `UI_TRANSLATIONS`
   - Verify fallback text is provided
   - Check browser console for errors

2. **Dynamic translation failing**
   - Verify `NEXT_PUBLIC_LINGO_API_KEY` is set
   - Check network connectivity
   - Verify Lingo.dev API limits

3. **Font not loading**
   - Check if `font-hindi` class is applied
   - Verify Google Fonts is loading
   - Check CSS for font definitions

### Debug Mode

Enable debug logging:

```tsx
const { currentLanguage } = useTranslation();
console.log('Current language:', currentLanguage);
console.log('Available translations:', Object.keys(UI_TRANSLATIONS));
```

## Performance Optimization

### 1. Lazy Loading

Large translation files can be split:

```typescript
// For future expansion
const loadTranslations = async (language: string) => {
  const translations = await import(`./translations/${language}.json`);
  return translations.default;
};
```

### 2. Caching

Dynamic translations are cached automatically in the browser.

### 3. Bundle Size

Only include necessary translations in production builds.

## Contributing

### Adding New Languages

1. Update `SupportedLanguage` type in `lib/lingoClient.ts`
2. Add language to `LanguageToggle` component
3. Add translations for all existing keys
4. Update font classes if needed
5. Test thoroughly

### Translation Guidelines

- Use native speakers for translations
- Consider cultural context
- Test with real users
- Keep medical terminology accurate
- Maintain consistent tone

## API Reference

### useTranslation Hook

```typescript
const {
  t,                    // Translate function
  currentLanguage,      // Current language code
  setLanguage,          // Change language
  translateText,        // Dynamic translation
  translateCurrency,    // Format currency
  translateDate,        // Format date
  translateTime,        // Format time
  translateNumber,      // Format number
  getLanguageClass,     // Get CSS class
  isRTL,               // Check if RTL
  getPlaceholder,      // Get placeholder text
  getErrorMessage,     // Get error message
  getSuccessMessage,   // Get success message
} = useTranslation();
```

### Translation Function

```typescript
t(key: string, fallback?: string, params?: Record<string, string | number>)
```

## Examples

Check out these files for implementation examples:
- `app/page.tsx` - Main page with translations
- `app/translation-demo/page.tsx` - Comprehensive demo
- `components/LanguageToggle.tsx` - Language switcher
- `components/TranslationDemo.tsx` - Interactive demo

## Support

For issues or questions:
1. Check this guide first
2. Look at the demo page (`/translation-demo`)
3. Check browser console for errors
4. Review the implementation in existing components