import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Folder, StoreState, Note } from '../../types';
import { getFileType, readFileContent, getParentPath } from '../../utils/fileUtils';

export interface FolderSlice {
  folders: Folder[];
  currentFolder: string | null;
  isDirectorySet: boolean;
  directoryHandle: any;
  isScanning: boolean;
  scanProgress: number;
  addFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  setDirectorySet: (value: boolean) => void;
  getFolderPath: (folderId: string | null) => Array<{ id: string | null; name: string; onClick: () => void }>;
  importDirectory: (source: File[] | FileSystemDirectoryHandle) => Promise<void>;
}

async function processFile(file: File, parentId: string | null = null): Promise<Note> {
  const content = await readFileContent(file);
  const fileType = await getFileType(file.name);
  
  return {
    id: uuidv4(),
    title: file.name,
    content: content,
    type: fileType,
    path: file.webkitRelativePath || file.name,
    tags: [],
    lastModified: file.lastModified,
    folder: parentId || '',
    favorite: false,
  };
}

export const createFolderSlice: StateCreator<StoreState, [], [], FolderSlice> = (set, get) => ({
  folders: [],
  currentFolder: null,
  isDirectorySet: false,
  directoryHandle: null,
  isScanning: false,
  scanProgress: 0,

  addFolder: (folder) =>
    set((state) => {
      // Check if folder with same path already exists
      const existingFolder = state.folders.find(f => f.path === folder.path);
      if (existingFolder) {
        return state; // Return current state without changes
      }
      return { folders: [...state.folders, folder] };
    }),

  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      notes: state.notes.filter((note) => note.folder !== id),
    })),

  setCurrentFolder: (folderId) =>
    set((state) => {
      // Validate folder exists before setting
      if (folderId === null || state.folders.some(f => f.id === folderId)) {
        return { currentFolder: folderId };
      }
      return state; // Return current state if folder doesn't exist
    }),

  setDirectorySet: (value) => 
    set({ isDirectorySet: value }),

  getFolderPath: (folderId) => {
    const { folders, setCurrentFolder } = get();
    const path = [];
    
    path.push({
      id: null,
      name: 'Home',
      onClick: () => setCurrentFolder(null),
    });

    if (folderId) {
      let currentId = folderId;
      let pathFolders = [];
      
      while (currentId) {
        const folder = folders.find((f) => f.id === currentId);
        if (folder) {
          pathFolders.unshift({
            id: folder.id,
            name: folder.name,
            onClick: () => setCurrentFolder(folder.id),
          });
          currentId = folder.parentId;
        } else {
          break;
        }
      }
      
      path.push(...pathFolders);
    }

    return path;
  },

  importDirectory: async (source) => {
    const { addNote, addFolder, notes } = get();
    set({ isScanning: true, scanProgress: 0 });

    try {
      if (Array.isArray(source)) {
        const folderMap = new Map<string, string>();
        const uniquePaths = new Set<string>();
        const totalFiles = source.length;
        let processedFiles = 0;

        // First pass: Create folder structure
        for (const file of source) {
          const path = file.webkitRelativePath;
          if (!path) continue;

          const parts = path.split('/');
          let currentPath = '';
          
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!uniquePaths.has(currentPath)) {
              uniquePaths.add(currentPath);
              const folderId = uuidv4();
              folderMap.set(currentPath, folderId);

              addFolder({
                id: folderId,
                name: part,
                path: currentPath,
                parentId: parentPath ? folderMap.get(parentPath) || null : null,
              });
            }
          }
        }

        // Second pass: Process files
        for (const file of source) {
          const path = file.webkitRelativePath;
          if (!path) continue;

          // Check for duplicate files
          const existingNote = notes.find(note => note.path === path);
          if (!existingNote) {
            const parentPath = getParentPath(path);
            const parentId = parentPath ? folderMap.get(parentPath) || null : null;

            const note = await processFile(file, parentId);
            addNote(note);
          }

          processedFiles++;
          set({ scanProgress: (processedFiles / totalFiles) * 100 });
        }

        set({ isDirectorySet: true });
      } else {
        // Handle FileSystemDirectoryHandle
        set({ directoryHandle: source });
        const folderMap = new Map<string, string>();
        const processedPaths = new Set<string>();

        // First pass: Create folder structure
        for await (const entry of source.values()) {
          if (entry.kind === 'directory') {
            const folderId = uuidv4();
            if (!processedPaths.has(entry.name)) {
              processedPaths.add(entry.name);
              folderMap.set(entry.name, folderId);

              addFolder({
                id: folderId,
                name: entry.name,
                path: entry.name,
                parentId: null,
              });
            }
          }
        }

        // Second pass: Process files
        for await (const entry of source.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            // Check for duplicate files
            const existingNote = notes.find(note => note.path === entry.name);
            if (!existingNote) {
              const note = await processFile(file);
              addNote(note);
            }
          }
          set((state) => ({ scanProgress: state.scanProgress + 1 }));
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      set({ 
        isDirectorySet: false,
        directoryHandle: null,
        isScanning: false,
        scanProgress: 0,
      });
      throw error;
    }

    set({ isScanning: false, scanProgress: 100 });
  },
});