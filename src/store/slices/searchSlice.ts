import { StateCreator } from 'zustand';
import { SearchResult, StoreState } from '../../types';

export interface SearchSlice {
  searchResults: SearchResult[];
  searchContent: (query: string, category?: 'all' | 'files' | 'folders') => Promise<SearchResult[]>;
}

export const createSearchSlice: StateCreator<StoreState, [], [], SearchSlice> = (set, get) => ({
  searchResults: [],

  searchContent: async (query: string, category: 'all' | 'files' | 'folders' = 'all') => {
    if (!query.trim()) {
      return [];
    }

    const { notes, folders } = get();
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ');

    const getRelevanceScore = (text: string, terms: string[]): number => {
      let score = 0;
      const lowerText = text.toLowerCase();
      terms.forEach(term => {
        const count = (lowerText.match(new RegExp(term, 'g')) || []).length;
        score += count;
      });
      return score;
    };

    const shouldInclude = (type: 'files' | 'folders') => {
      return category === 'all' || category === type;
    };

    if (shouldInclude('files')) {
      notes.forEach((note) => {
        let matched = false;
        let relevanceScore = 0;

        const matchesTitle = searchTerms.every(term => 
          note.title.toLowerCase().includes(term)
        );

        if (matchesTitle) {
          matched = true;
          relevanceScore += getRelevanceScore(note.title, searchTerms) * 2;
        }

        const matchesTags = note.tags.some(tag => 
          searchTerms.every(term => tag.toLowerCase().includes(term))
        );

        if (matchesTags) {
          matched = true;
          relevanceScore += getRelevanceScore(note.tags.join(' '), searchTerms) * 1.5;
        }

        if (matched) {
          results.push({
            id: note.id,
            title: note.title,
            type: 'note',
            path: note.path,
            relevanceScore,
          });
        }
      });
    }

    if (shouldInclude('folders')) {
      folders.forEach((folder) => {
        if (searchTerms.every(term => folder.name.toLowerCase().includes(term))) {
          results.push({
            id: folder.id,
            title: folder.name,
            type: 'folder',
            path: folder.path,
            relevanceScore: getRelevanceScore(folder.name, searchTerms) * 2,
          });
        }
      });
    }

    return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  },
});