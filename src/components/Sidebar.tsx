import React, { useState } from 'react';
import { FolderTree, Search, Settings, Home, Star, Clock, Tag, FolderPlus, X, ChevronDown, ChevronRight, Folder, FileText, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'home' | 'search' | 'favorites' | 'recent' | 'tags' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'library']);
  
  const { 
    favorites,
    recentFiles,
    notes,
    isDirectorySet,
    folders,
    currentFolder,
    setCurrentFolder,
    settings
  } = useStore();

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const subfolders = folders.filter(f => f.parentId === parentId);
    
    if (subfolders.length === 0) return null;

    return (
      <div className={`pl-${level > 0 ? '4' : '0'}`}>
        {subfolders.map(folder => {
          const folderNotes = notes.filter(note => note.folder === folder.id);
          const hasSubfolders = folders.some(f => f.parentId === folder.id);
          
          return (
            <div key={folder.id}>
              <button
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  currentFolder === folder.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-300 hover:bg-indigo-900/30'
                }`}
                onClick={() => setCurrentFolder(folder.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Folder className={`w-4 h-4 ${currentFolder === folder.id ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="truncate">{folder.name}</span>
                </div>
                {(folderNotes.length > 0 || hasSubfolders) && (
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    {folderNotes.length}
                  </span>
                )}
              </button>
              {renderFolderTree(folder.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className={`bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white h-screen flex flex-col transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Decorative background pattern - Added pointer-events-none */}
      <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none" />
      
      {/* Header - Added z-10 */}
      <div className="relative shrink-0 z-10">
        <div className="p-6 flex items-center justify-between border-b border-brand-700/50">
          <h1 className={`font-bold flex items-center gap-3 ${isCollapsed ? 'hidden' : 'text-2xl'}`}>
            <div className="p-2.5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl shadow-lg">
              <FolderTree className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold tracking-tight text-shadow">
                Study Hub
              </span>
            )}
          </h1>
          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-2 hover:bg-brand-700/50 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isDirectorySet && !isCollapsed && (
          <div className="px-4 py-4">
            <label 
              htmlFor="fileInput"
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <FolderPlus className="w-5 h-5" />
              Add Files
            </label>
            <input 
              id="fileInput"
              type="file"
              className="hidden"
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  useStore.getState().importDirectory(Array.from(e.target.files));
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Scrollable Navigation - Added z-10 */}
      <div className="flex-1 flex flex-col min-h-0 z-10">
        <nav className="flex-1 px-2 py-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h2 className="px-4 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
                  Navigation
                </h2>
              )}
              <button
                onClick={() => onViewChange('home')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'home'
                    ? 'bg-brand-400/20 text-brand-300 shadow-lg'
                    : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <Home className="w-5 h-5" />
                {!isCollapsed && 'Home'}
              </button>
              <button
                onClick={() => onViewChange('search')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'search'
                    ? 'bg-brand-400/20 text-brand-300 shadow-lg'
                    : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <Search className="w-5 h-5" />
                {!isCollapsed && 'Search'}
              </button>
            </div>

            {/* Library section */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h2 className="px-4 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
                  Library
                </h2>
              )}
              <button
                onClick={() => onViewChange('favorites')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'favorites'
                    ? 'bg-brand-400/20 text-brand-300 shadow-lg'
                    : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5" />
                  {!isCollapsed && 'Favorites'}
                </div>
                {!isCollapsed && favorites.length > 0 && (
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => onViewChange('recent')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'recent'
                    ? 'bg-brand-400/20 text-brand-300 shadow-lg'
                    : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  {!isCollapsed && 'Recent'}
                </div>
                {!isCollapsed && recentFiles.length > 0 && (
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                    {recentFiles.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => onViewChange('tags')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'tags'
                    ? 'bg-brand-400/20 text-brand-300 shadow-lg'
                    : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <Tag className="w-5 h-5" />
                {!isCollapsed && 'Tags'}
              </button>
            </div>

            {/* Folders section */}
            {!isCollapsed && (
              <div className="space-y-1">
                <h2 className="px-4 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
                  Folders
                </h2>
                <div className="overflow-y-auto max-h-[calc(100vh-24rem)]">
                  {renderFolderTree()}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer - Added z-10 */}
      <div className="shrink-0 p-4 border-t border-brand-700/50 z-10">
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentView === 'settings'
              ? 'bg-brand-400/20 text-brand-300 shadow-lg'
              : 'text-brand-100 hover:bg-brand-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && 'Settings'}
        </button>
      </div>
    </div>
  );
};