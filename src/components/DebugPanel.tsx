'use client';

import { useState } from 'react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MONITORS_CONFIG: process.env.NEXT_PUBLIC_MONITORS_CONFIG ? 
      `${process.env.NEXT_PUBLIC_MONITORS_CONFIG.length} characters` : 
      'Not set'
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Debug Panel"
      >
        🔧
      </button>
      
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Debug Info</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Environment Variables:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-blue-600">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Console Logs:</h4>
              <p className="text-xs text-gray-600">
                Check browser console (F12) for detailed debug logs with emojis:
              </p>
              <ul className="text-xs text-gray-600 ml-2">
                <li>🔧 Config loading</li>
                <li>🚀 API requests</li>
                <li>📊 Data parsing</li>
                <li>✅/❌ Success/Error states</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Quick Actions:</h4>
              <button
                onClick={() => {
                  console.log('🔄 [Manual Debug] Reloading page...');
                  window.location.reload();
                }}
                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}