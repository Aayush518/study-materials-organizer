import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, StoreState } from '../../types';

export interface FileSlice {
  notes: Note[];
  favorites: string[];
  recentFiles: string[];
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  toggleFavorite: (noteId: string) => void;
  getFileContent: (fileId: string) => Note | null;
  addToRecentFiles: (fileId: string) => void;
}

export const createFileSlice: StateCreator<StoreState, [], [], FileSlice> = (set, get) => ({
  notes: [],
  favorites: [],
  recentFiles: [],

  addNote: (note) =>
    set((state) => {
      try {
        // Check if note with same path already exists
        const existingNote = state.notes.find(n => n.path === note.path);
        if (existingNote) {
          return state;
        }

        // Store full content in IndexedDB
        const db = indexedDB.open('studyMaterialsDB');
        db.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          const transaction = database.transaction(['fileContent'], 'readwrite');
          const store = transaction.objectStore('fileContent');
          store.put(note.content, note.id);
        };

        // Store metadata in state
        const noteMetadata = {
          ...note,
          content: note.type === 'text' || note.type === 'markdown' 
            ? note.content.slice(0, 1000) 
            : null
        };

        return {
          notes: [...state.notes, noteMetadata],
          recentFiles: [note.id, ...state.recentFiles.filter(id => id !== note.id).slice(0, 9)],
        };
      } catch (error) {
        console.error('Error adding note:', error);
        return state;
      }
    }),

  deleteNote: (id) =>
    set((state) => {
      try {
        // Remove content from IndexedDB
        const db = indexedDB.open('studyMaterialsDB');
        db.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          const transaction = database.transaction(['fileContent'], 'readwrite');
          const store = transaction.objectStore('fileContent');
          store.delete(id);
        };

        return {
          notes: state.notes.filter((note) => note.id !== id),
          favorites: state.favorites.filter((fav) => fav !== id),
          recentFiles: state.recentFiles.filter((recent) => recent !== id),
        };
      } catch (error) {
        console.error('Error deleting note:', error);
        return state;
      }
    }),

  updateNote: (id, updatedNote) =>
    set((state) => {
      try {
        if (updatedNote.content) {
          // Update content in IndexedDB
          const db = indexedDB.open('studyMaterialsDB');
          db.onsuccess = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            const transaction = database.transaction(['fileContent'], 'readwrite');
            const store = transaction.objectStore('fileContent');
            store.put(updatedNote.content, id);
          };
        }

        return {
          notes: state.notes.map((note) =>
            note.id === id 
              ? { 
                  ...note, 
                  ...updatedNote,
                  content: updatedNote.content 
                    ? (note.type === 'text' || note.type === 'markdown'
                        ? updatedNote.content.slice(0, 1000)
                        : null)
                    : note.content
                } 
              : note
          ),
        };
      } catch (error) {
        console.error('Error updating note:', error);
        return state;
      }
    }),

  toggleFavorite: (noteId) =>
    set((state) => ({
      favorites: state.favorites.includes(noteId)
        ? state.favorites.filter((id) => id !== noteId)
        : [...state.favorites, noteId],
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, favorite: !note.favorite } : note
      ),
    })),

  getFileContent: (fileId) => {
    const { notes } = get();
    const note = notes.find((note) => note.id === fileId);
    if (!note) return null;

    // Get full content from IndexedDB
    return new Promise((resolve) => {
      const db = indexedDB.open('studyMaterialsDB');
      db.onsuccess = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        const transaction = database.transaction(['fileContent'], 'readonly');
        const store = transaction.objectStore('fileContent');
        const request = store.get(fileId);

        request.onsuccess = () => {
          const fullContent = request.result;
          resolve({
            ...note,
            content: fullContent || note.content
          });
        };

        request.onerror = () => {
          resolve(note);
        };
      };
    });
  },

  addToRecentFiles: (fileId) =>
    set((state) => {
      const fileExists = state.notes.some(note => note.id === fileId);
      if (!fileExists) return state;

      return {
        recentFiles: [fileId, ...state.recentFiles.filter(id => id !== fileId).slice(0, 9)]
      };
    }),
});