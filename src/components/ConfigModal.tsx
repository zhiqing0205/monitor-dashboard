'use client';

import { useState } from 'react';
import { MonitorConfig } from '@/types/config';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MonitorConfig) => void;
  config?: MonitorConfig;
}

export default function ConfigModal({ isOpen, onClose, onSave, config }: ConfigModalProps) {
  const [formData, setFormData] = useState<MonitorConfig>(
    config || {
      id: '',
      name: '',
      url: '',
      displayUnit: 'USD'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim() || !formData.url.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.id.match(/^[a-zA-Z0-9-_]+$/)) {
      alert('ID must contain only letters, numbers, hyphens, and underscores');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      auth: { 
        ...prev.auth, 
        type: prev.auth?.type || 'bearer',
        [field]: value 
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {config ? 'Edit Monitor' : 'Add New Monitor'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="unique-id"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Monitor Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com/balance"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Unit
              </label>
              <input
                type="text"
                value={formData.displayUnit}
                onChange={(e) => handleInputChange('displayUnit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="USD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total (optional)
              </label>
              <input
                type="number"
                value={formData.total || ''}
                onChange={(e) => handleInputChange('total', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication (optional)
            </label>
            <select
              value={formData.auth?.type || ''}
              onChange={(e) => handleAuthChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">No Authentication</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="apikey">API Key</option>
            </select>

            {formData.auth?.type === 'bearer' && (
              <input
                type="text"
                value={formData.auth.token || ''}
                onChange={(e) => handleAuthChange('token', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bearer token"
              />
            )}

            {formData.auth?.type === 'basic' && (
              <>
                <input
                  type="text"
                  value={formData.auth.username || ''}
                  onChange={(e) => handleAuthChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="Username"
                />
                <input
                  type="password"
                  value={formData.auth.password || ''}
                  onChange={(e) => handleAuthChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
              </>
            )}

            {formData.auth?.type === 'apikey' && (
              <input
                type="text"
                value={formData.auth.apiKey || ''}
                onChange={(e) => handleAuthChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="API Key"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {config ? 'Update' : 'Add'} Monitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}