'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import toast from 'react-hot-toast';

export function AddTestDataButton() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const addTestData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/add-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        console.log('Test data added:', data);
      } else {
        toast.error(data.error || 'Failed to add test data');
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Add test data error:', error);
      toast.error('Failed to add test data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={addTestData}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Adding...</span>
        </span>
      ) : (
        t('demo.addTestData', 'Add Test Caregivers')
      )}
    </button>
  );
}