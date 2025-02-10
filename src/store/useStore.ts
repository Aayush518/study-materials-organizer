import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createFileSlice } from './slices/fileSlice';
import { createFolderSlice } from './slices/folderSlice';
import { createSearchSlice } from './slices/searchSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { StoreState } from '../types';

// Initial state
const initialState = {
  notes: [],
  folders: [],
  favorites: [],
  recentFiles: [],
  settings: {
    theme: 'light',
    sortBy: 'name',
    sortDirection: 'asc',
    viewMode: 'grid',
    showHiddenFiles: false,
    showExtensions: true,
    previewQuality: 'medium',
    cacheSize: '500',
    enableIndexing: true,
    autoSaveInterval: '30',
    debugMode: false,
  },
  isDirectorySet: false,
  currentFolder: null,
  searchResults: [],
  isScanning: false,
  scanProgress: 0,
};

// Create a more efficient storage system with IndexedDB
const createIndexedDBStorage = () => {
  const DB_NAME = 'studyMaterialsDB';
  const DB_VERSION = 1;
  const STORE_NAMES = {
    metadata: 'metadata',
    fileContent: 'fileContent',
    searchIndex: 'searchIndex'
  };

  let db: IDBDatabase | null = null;

  const initDB = async (): Promise<IDBDatabase> => {
    if (db) return db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for metadata (file info, folders, settings)
        if (!db.objectStoreNames.contains(STORE_NAMES.metadata)) {
          db.createObjectStore(STORE_NAMES.metadata);
        }

        // Store for file contents (stored separately for better performance)
        if (!db.objectStoreNames.contains(STORE_NAMES.fileContent)) {
          db.createObjectStore(STORE_NAMES.fileContent);
        }

        // Store for search indices
        if (!db.objectStoreNames.contains(STORE_NAMES.searchIndex)) {
          db.createObjectStore(STORE_NAMES.searchIndex);
        }
      };

      request.onblocked = () => {
        console.error('IndexedDB blocked. Please close other tabs with this site open');
        reject(new Error('IndexedDB blocked'));
      };
    });
  };

  const getItem = async (key: string): Promise<string | null> => {
    try {
      const database = await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAMES.metadata], 'readonly');
        const store = transaction.objectStore(STORE_NAMES.metadata);
        const request = store.get(key);

        request.onerror = () => {
          console.error('Error reading from IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          if (!request.result) {
            resolve(JSON.stringify(initialState));
          } else {
            resolve(request.result);
          }
        };

        transaction.onabort = () => {
          console.error('Transaction aborted:', transaction.error);
          resolve(JSON.stringify(initialState));
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      return JSON.stringify(initialState);
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      const database = await initDB();
      const data = JSON.parse(value);

      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAMES.metadata, STORE_NAMES.fileContent], 'readwrite');
        
        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };

        transaction.onabort = () => {
          console.error('Transaction aborted:', transaction.error);
          reject(transaction.error);
        };

        const metadataStore = transaction.objectStore(STORE_NAMES.metadata);
        const fileContentStore = transaction.objectStore(STORE_NAMES.fileContent);

        // Store metadata
        const metadata = {
          ...data,
          notes: data.notes?.map((note: any) => ({
            ...note,
            content: null // Remove content from metadata
          })) || []
        };

        // Store file contents separately
        if (data.notes) {
          data.notes.forEach((note: any) => {
            if (note?.content) {
              fileContentStore.put(note.content, note.id);
            }
          });
        }

        const metadataRequest = metadataStore.put(JSON.stringify(metadata), key);

        metadataRequest.onerror = () => {
          console.error('Error storing metadata:', metadataRequest.error);
          reject(metadataRequest.error);
        };

        metadataRequest.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Error writing to IndexedDB:', error);
      throw error;
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      const database = await initDB();

      return new Promise((resolve, reject) => {
        const transaction = database.transaction(
          [STORE_NAMES.metadata, STORE_NAMES.fileContent],
          'readwrite'
        );
        
        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };

        const metadataStore = transaction.objectStore(STORE_NAMES.metadata);
        const fileContentStore = transaction.objectStore(STORE_NAMES.fileContent);

        // Get the metadata first to find file IDs
        const getRequest = metadataStore.get(key);

        getRequest.onerror = () => {
          console.error('Error reading metadata:', getRequest.error);
          reject(getRequest.error);
        };

        getRequest.onsuccess = () => {
          try {
            const data = JSON.parse(getRequest.result || '{}');
            
            // Delete file contents
            if (data.notes) {
              data.notes.forEach((note: any) => {
                if (note?.id) {
                  fileContentStore.delete(note.id);
                }
              });
            }

            // Delete metadata
            metadataStore.delete(key);
            resolve();
          } catch (error) {
            console.error('Error parsing metadata:', error);
            reject(error);
          }
        };
      });
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
      throw error;
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
};

// Modified store creation with better error handling
export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createFileSlice(...a),
      ...createFolderSlice(...a),
      ...createSearchSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'study-materials-storage',
      storage: createJSONStorage(() => createIndexedDBStorage()),
      partialize: (state) => ({
        notes: state.notes?.map(note => ({
          ...note,
          // Only store minimal content for preview
          content: note.type === 'text' || note.type === 'markdown' 
            ? note.content?.slice(0, 1000) 
            : null
        })) || [],
        folders: state.folders || [],
        favorites: state.favorites || [],
        recentFiles: state.recentFiles || [],
        settings: state.settings || initialState.settings,
        isDirectorySet: state.isDirectorySet || false,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Storage rehydrated successfully');
          // Validate and fix any missing or invalid data
          return {
            ...initialState,
            ...state,
            settings: {
              ...initialState.settings,
              ...(state.settings || {}),
            },
          };
        } else {
          console.error('Failed to rehydrate storage');
          return initialState;
        }
      },
    }
  )
);