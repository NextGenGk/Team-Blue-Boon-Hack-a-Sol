/**
 * End-to-End Encryption utilities using Web Crypto API
 * For sensitive medical data like clinical notes and prescriptions
 */

// Generate a new encryption key for a patient
export const generatePatientKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Export key to store (encrypted by caregiver's public key)
export const exportKey = async (key: CryptoKey): Promise<ArrayBuffer> => {
  return await window.crypto.subtle.exportKey('raw', key);
};

// Import key from stored data
export const importKey = async (keyData: ArrayBuffer): Promise<CryptoKey> => {
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt sensitive data
export const encryptData = async (
  data: string,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: ArrayBuffer }> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate random IV for each encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );
  
  return { encrypted, iv };
};

// Decrypt sensitive data
export const decryptData = async (
  encryptedData: ArrayBuffer,
  iv: ArrayBuffer,
  key: CryptoKey
): Promise<string> => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

// Generate RSA key pair for caregiver (for sharing patient keys)
export const generateCaregiverKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt patient key with caregiver's public key
export const encryptKeyForCaregiver = async (
  patientKey: ArrayBuffer,
  caregiverPublicKey: CryptoKey
): Promise<ArrayBuffer> => {
  return await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    caregiverPublicKey,
    patientKey
  );
};

// Decrypt patient key with caregiver's private key
export const decryptKeyFromCaregiver = async (
  encryptedKey: ArrayBuffer,
  caregiverPrivateKey: CryptoKey
): Promise<ArrayBuffer> => {
  return await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    caregiverPrivateKey,
    encryptedKey
  );
};

// Utility to combine encrypted data and IV for storage
export const combineEncryptedData = (
  encrypted: ArrayBuffer,
  iv: ArrayBuffer
): Uint8Array => {
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(new Uint8Array(iv), 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return combined;
};

// Utility to separate IV and encrypted data
export const separateEncryptedData = (
  combined: Uint8Array
): { encrypted: ArrayBuffer; iv: ArrayBuffer } => {
  const iv = combined.slice(0, 12); // AES-GCM IV is 12 bytes
  const encrypted = combined.slice(12);
  return {
    iv: iv.buffer,
    encrypted: encrypted.buffer,
  };
};

// Key derivation from passphrase (for key recovery)
export const deriveKeyFromPassphrase = async (
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(passphrase);
  
  // Import passphrase as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passphraseBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive AES key from passphrase
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Generate salt for key derivation
export const generateSalt = (): Uint8Array => {
  return window.crypto.getRandomValues(new Uint8Array(16));
};

// High-level encryption interface for medical notes
export interface EncryptedMedicalData {
  data: Uint8Array; // Combined IV + encrypted data
  keyId: string; // Reference to the encryption key
  timestamp: string;
}

export class MedicalDataEncryption {
  private patientKey: CryptoKey | null = null;
  private keyId: string | null = null;

  // Initialize with patient's encryption key
  async initializeForPatient(patientId: string, passphrase?: string): Promise<void> {
    // In a real app, you would:
    // 1. Check if key exists in secure storage
    // 2. If not, generate new key or derive from passphrase
    // 3. Store key securely (encrypted with passphrase or device key)
    
    if (passphrase) {
      const salt = generateSalt();
      this.patientKey = await deriveKeyFromPassphrase(passphrase, salt);
      this.keyId = `patient_${patientId}_derived`;
    } else {
      this.patientKey = await generatePatientKey();
      this.keyId = `patient_${patientId}_${Date.now()}`;
    }
  }

  // Encrypt medical notes
  async encryptNotes(notes: string): Promise<EncryptedMedicalData> {
    if (!this.patientKey || !this.keyId) {
      throw new Error('Encryption not initialized');
    }

    const { encrypted, iv } = await encryptData(notes, this.patientKey);
    const combined = combineEncryptedData(encrypted, iv);

    return {
      data: combined,
      keyId: this.keyId,
      timestamp: new Date().toISOString(),
    };
  }

  // Decrypt medical notes
  async decryptNotes(encryptedData: EncryptedMedicalData): Promise<string> {
    if (!this.patientKey) {
      throw new Error('Decryption key not available');
    }

    const { encrypted, iv } = separateEncryptedData(encryptedData.data);
    return await decryptData(encrypted, iv, this.patientKey);
  }

  // Export key for sharing with caregiver
  async exportKeyForCaregiver(caregiverPublicKey: CryptoKey): Promise<ArrayBuffer> {
    if (!this.patientKey) {
      throw new Error('Patient key not available');
    }

    const keyData = await exportKey(this.patientKey);
    return await encryptKeyForCaregiver(keyData, caregiverPublicKey);
  }
}

// Browser compatibility check
export const isEncryptionSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.generateKey === 'function'
  );
};

// Secure key storage in IndexedDB (for offline access)
export const storeKeySecurely = async (
  keyId: string,
  keyData: ArrayBuffer,
  passphrase: string
): Promise<void> => {
  if (typeof window === 'undefined') return;

  const salt = generateSalt();
  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);
  const { encrypted, iv } = await encryptData(
    new TextDecoder().decode(keyData),
    derivedKey
  );

  // Store in IndexedDB
  const request = indexedDB.open('HealthPWA_Keys', 1);
  
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('keys')) {
      db.createObjectStore('keys', { keyPath: 'keyId' });
    }
  };

  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = db.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
    
    store.put({
      keyId,
      encrypted: combineEncryptedData(encrypted, iv),
      salt,
      timestamp: Date.now(),
    });
  };
};

export const retrieveKeySecurely = async (
  keyId: string,
  passphrase: string
): Promise<ArrayBuffer | null> => {
  if (typeof window === 'undefined') return null;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HealthPWA_Keys', 1);
    
    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['keys'], 'readonly');
      const store = transaction.objectStore('keys');
      const getRequest = store.get(keyId);
      
      getRequest.onsuccess = async () => {
        const result = getRequest.result;
        if (!result) {
          resolve(null);
          return;
        }

        try {
          const derivedKey = await deriveKeyFromPassphrase(passphrase, result.salt);
          const { encrypted, iv } = separateEncryptedData(result.encrypted);
          const decryptedKey = await decryptData(encrypted, iv, derivedKey);
          resolve(new TextEncoder().encode(decryptedKey).buffer);
        } catch (error) {
          reject(error);
        }
      };
      
      getRequest.onerror = () => resolve(null);
    };
    
    request.onerror = () => resolve(null);
  });
};