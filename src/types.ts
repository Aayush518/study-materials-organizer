import { ReactNode } from 'react';
import { FileSlice } from './store/slices/fileSlice';
import { FolderSlice } from './store/slices/folderSlice';
import { SearchSlice } from './store/slices/searchSlice';
import { SettingsSlice } from './store/slices/settingsSlice';

export type StoreState = FileSlice & FolderSlice & SearchSlice & SettingsSlice;

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'markdown' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
  path: string;
  tags: string[];
  lastModified: number;
  folder: string;
  searchIndex?: string[];
  thumbnail?: string;
  size?: number;
  favorite?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'note' | 'folder';
  path: string;
  matchedContent?: string;
  relevanceScore?: number;
  size?: number;
}

export interface ViewerProps {
  file: Note;
  scale?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export interface FileViewerPlugin {
  type: string[];
  component: React.ComponentType<ViewerProps>;
  thumbnail?: (file: Note) => Promise<string>;
  index?: (file: Note) => Promise<string[]>;
}

export interface Settings {
  theme: 'light' | 'dark';
  sortBy: 'name' | 'date' | 'type' | 'size';
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  showHiddenFiles: boolean;
  showExtensions: boolean;
  previewQuality: 'low' | 'medium' | 'high';
  cacheSize: '100' | '500' | '1000';
  enableIndexing: boolean;
  autoSaveInterval: '0' | '30' | '60' | '300';
  debugMode: boolean;
}