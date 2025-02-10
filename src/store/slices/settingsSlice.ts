import { StateCreator } from 'zustand';
import { Settings, StoreState } from '../../types';

export interface SettingsSlice {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const createSettingsSlice: StateCreator<StoreState, [], [], SettingsSlice> = (set) => ({
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

  setSetting: (key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: value,
      },
    })),
});