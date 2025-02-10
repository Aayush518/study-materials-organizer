import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { Note } from '../../types';

interface TagsBarProps {
  file: Note;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TagsBar: React.FC<TagsBarProps> = ({ file, onAddTag, onRemoveTag }) => {
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !file.tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag('');
      setIsTagInputVisible(false);
    }
  };

  return (
    <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-surface-400" />
        <div className="flex flex-wrap gap-2 flex-1">
          {file.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="hover:text-brand-800 dark:hover:text-brand-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {isTagInputVisible ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="px-2 py-1 text-sm border border-surface-200 dark:border-surface-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-800 dark:text-white"
                autoFocus
              />
              <button
                onClick={() => setIsTagInputVisible(false)}
                className="text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsTagInputVisible(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add tag
            </button>
          )}
        </div>
      </div>
    </div>
  );
};