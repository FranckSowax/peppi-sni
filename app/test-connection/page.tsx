'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        
        // Test the connection by checking auth status
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage(`Connection error: ${error.message}`);
        } else {
          setStatus('success');
          setMessage('Supabase connection successful! Session: ' + (data.session ? 'Active' : 'No active session'));
        }
      } catch (err) {
        setStatus('error');
        setMessage(`Unexpected error: ${err}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Supabase Connection Test</h1>
        
        <div className={`p-4 rounded-lg ${
          status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
          status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'loading' && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {status === 'success' && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">
              {status === 'loading' ? 'Testing connection...' :
               status === 'success' ? 'Connected!' : 'Connection Failed'}
            </span>
          </div>
          <p className="mt-2 text-sm">{message}</p>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>

        <div className="mt-6">
          <a 
            href="/"
            className="block w-full text-center py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
