import React from 'react';
import { Moon, Sun, List, Grid, ArrowUpDown, Eye, EyeOff, Zap, Database, Shield, Layout } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Settings: React.FC = () => {
  const { settings, setSetting } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        {/* Appearance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Appearance
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSetting('theme', 'light')}
                  className={`p-2 rounded-lg ${
                    settings.theme === 'light'
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSetting('theme', 'dark')}
                  className={`p-2 rounded-lg ${
                    settings.theme === 'dark'
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">View Mode</p>
                <p className="text-sm text-gray-500">Choose how files are displayed</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSetting('viewMode', 'grid')}
                  className={`p-2 rounded-lg ${
                    settings.viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSetting('viewMode', 'list')}
                  className={`p-2 rounded-lg ${
                    settings.viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Preview Quality</p>
                <p className="text-sm text-gray-500">Adjust preview quality for better performance</p>
              </div>
              <select
                value={settings.previewQuality || 'medium'}
                onChange={(e) => setSetting('previewQuality', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Cache Size</p>
                <p className="text-sm text-gray-500">Maximum cache size for faster loading</p>
              </div>
              <select
                value={settings.cacheSize || '500'}
                onChange={(e) => setSetting('cacheSize', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="100">100 MB</option>
                <option value="500">500 MB</option>
                <option value="1000">1 GB</option>
              </select>
            </div>
          </div>
        </div>

        {/* File Management */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            File Management
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Sort Files</p>
                <p className="text-sm text-gray-500">Choose how files are sorted</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={settings.sortBy}
                  onChange={(e) => setSetting('sortBy', e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="type">Type</option>
                  <option value="size">Size</option>
                </select>
                <button
                  onClick={() =>
                    setSetting('sortDirection', settings.sortDirection === 'asc' ? 'desc' : 'asc')
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Hidden Files</p>
                <p className="text-sm text-gray-500">Show or hide hidden files</p>
              </div>
              <button
                onClick={() => setSetting('showHiddenFiles', !settings.showHiddenFiles)}
                className={`p-2 rounded-lg ${
                  settings.showHiddenFiles
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                {settings.showHiddenFiles ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">File Extensions</p>
                <p className="text-sm text-gray-500">Show or hide file extensions</p>
              </div>
              <button
                onClick={() => setSetting('showExtensions', !settings.showExtensions)}
                className={`p-2 rounded-lg ${
                  settings.showExtensions
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                {settings.showExtensions ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Search Indexing</p>
                <p className="text-sm text-gray-500">Enable background indexing for faster search</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableIndexing}
                  onChange={(e) => setSetting('enableIndexing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Auto-save Interval</p>
                <p className="text-sm text-gray-500">Set how often changes are automatically saved</p>
              </div>
              <select
                value={settings.autoSaveInterval || '30'}
                onChange={(e) => setSetting('autoSaveInterval', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Off</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="font-medium">Debug Mode</p>
                <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => setSetting('debugMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">
            Your settings are automatically saved and synced across sessions.
          </p>
        </div>
      </div>
    </div>
  );
};