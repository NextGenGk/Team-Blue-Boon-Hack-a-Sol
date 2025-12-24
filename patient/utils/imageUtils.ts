/**
 * Image utilities for handling and validating image URLs
 */

// Test if an image URL is accessible
export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Image URL test failed:', error);
    return false;
  }
};

// Normalize Unsplash URLs for optimal loading
export const normalizeUnsplashUrl = (url: string, width = 400, height = 400): string => {
  if (!url || !url.includes('images.unsplash.com')) {
    return url;
  }

  // Extract the photo ID from the URL
  const photoIdMatch = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (!photoIdMatch) {
    return url;
  }

  const photoId = photoIdMatch[1];
  const baseUrl = `https://images.unsplash.com/photo-${photoId}`;

  // Add optimized parameters
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
};

// Get multiple size variants of an Unsplash image
export const getUnsplashVariants = (url: string) => {
  const normalized = normalizeUnsplashUrl(url);
  const baseUrl = normalized.split('?')[0];

  return {
    thumbnail: `${baseUrl}?w=150&h=150&fit=crop&auto=format&q=80`,
    small: `${baseUrl}?w=300&h=300&fit=crop&auto=format&q=80`,
    medium: `${baseUrl}?w=400&h=400&fit=crop&auto=format&q=80`,
    large: `${baseUrl}?w=800&h=800&fit=crop&auto=format&q=80`,
    original: baseUrl
  };
};

// Validate image URL format
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  // Check for valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check for common image domains
  const validDomains = [
    'images.unsplash.com',
    'unsplash.com',
    'supabase.co',
    'amazonaws.com',
    'cloudinary.com',
    'imgur.com'
  ];

  return validDomains.some(domain => url.includes(domain)) ||
    url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) !== null;
};

// Create a fallback image URL
export const getFallbackImageUrl = (type: 'avatar' | 'caregiver' | 'patient' = 'caregiver'): string => {
  const fallbackImages = {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format&q=80',
    caregiver: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format&q=80',
    patient: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format&q=80'
  };

  return fallbackImages[type];
};

// Preload an image
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Get image dimensions
export const getImageDimensions = (url: string): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Debug image loading issues
export const debugImageUrl = async (url: string) => {
  console.group(`🖼️ Image Debug: ${url}`);

  console.log('✅ URL Format Valid:', isValidImageUrl(url));
  console.log('🔗 Normalized URL:', normalizeUnsplashUrl(url));

  try {
    const accessible = await testImageUrl(url);
    console.log('🌐 URL Accessible:', accessible);

    const preloaded = await preloadImage(url);
    console.log('📥 Image Preloads:', preloaded);

    const dimensions = await getImageDimensions(url);
    console.log('📐 Image Dimensions:', dimensions);

    if (url.includes('unsplash.com')) {
      const variants = getUnsplashVariants(url);
      console.log('🎨 Available Variants:', variants);
    }
  } catch (error) {
    console.error('❌ Debug Error:', error);
  }

  console.groupEnd();
};

// Common Unsplash photo IDs for healthcare/medical themes
export const HEALTHCARE_STOCK_IMAGES = [
  'photo-1559839734-2b71ea197ec2', // Female healthcare worker
  'photo-1612349317150-e413f6a5b16d', // Male doctor
  'photo-1582750433449-648ed127bb54', // Female nurse
  'photo-1594824804732-ca8db7d1457c', // Female doctor with stethoscope
  'photo-1551601651-2a8555f1a136', // Female healthcare professional
  'photo-1607990281513-2c110a25bd8c', // Male nurse
  'photo-1544005313-94ddf0286df2', // Female healthcare worker (your example)
  'photo-1638202993928-7267aad84c31', // Medical professional
  'photo-1576091160399-112ba8d25d1f', // Female doctor
  'photo-1584467735871-8e3d5c4d6b3e'  // Male healthcare worker
];

// Generate a random healthcare image URL
export const getRandomHealthcareImage = (width = 400, height = 400): string => {
  const randomId = HEALTHCARE_STOCK_IMAGES[Math.floor(Math.random() * HEALTHCARE_STOCK_IMAGES.length)];
  return `https://images.unsplash.com/${randomId}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
};

// Get a deterministic healthcare image based on ID
export const getHealthcareImageForId = (id: string, width = 400, height = 400): string => {
  if (!id) return getRandomHealthcareImage(width, height);

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % HEALTHCARE_STOCK_IMAGES.length;
  const imageId = HEALTHCARE_STOCK_IMAGES[index];

  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
};