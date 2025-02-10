import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Folder, File, ChevronRight, Star, Clock, Tag, MoreVertical, Search, Trash2, Edit, Download, LayoutGrid, List, FolderTree, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FileViewer } from './FileViewer';
import { Note } from '../types';

const FileNameDisplay: React.FC<{ name: string; showExtension: boolean }> = ({ name, showExtension }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setIsTooltipVisible(element.scrollWidth > element.clientWidth);
    }
  }, [name]);

  const displayName = showExtension ? name : name.split('.').slice(0, -1).join('.');

  return (
    <div className="relative group">
      <div
        ref={elementRef}
        className="truncate max-w-[200px]"
        title={isTooltipVisible ? displayName : undefined}
      >
        {displayName}
      </div>
      {isTooltipVisible && (
        <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          {displayName}
        </div>
      )}
    </div>
  );
};

interface FileExplorerProps {
  filterFavorites?: boolean;
  filterRecent?: boolean;
  showTags?: boolean;
  limit?: number;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  filterFavorites = false,
  filterRecent = false,
  showTags = false,
  limit
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileData, setSelectedFileData] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'columns'>('grid');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const {
    notes,
    folders,
    currentFolder,
    toggleFavorite,
    getFolderPath,
    favorites,
    recentFiles,
    settings,
    setCurrentFolder,
    deleteNote,
    updateNote,
    getFileContent
  } = useStore();

  useEffect(() => {
    const fetchFileData = async () => {
      if (selectedFile) {
        const fileData = await getFileContent(selectedFile);
        setSelectedFileData(fileData);
      } else {
        setSelectedFileData(null);
      }
    };
    fetchFileData();
  }, [selectedFile, getFileContent]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (contextMenu && !(e.target as Element).closest('.context-menu')) {
      setContextMenu(null);
    }
  }, [contextMenu]);

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId,
    });
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteNote(noteId);
      setContextMenu(null);
    }
  };

  const handleRename = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNewTitle(note.title);
      setEditingNote(noteId);
      setContextMenu(null);
    }
  };

  const handleSaveRename = (noteId: string) => {
    if (newTitle.trim()) {
      updateNote(noteId, { title: newTitle.trim() });
      setEditingNote(null);
      setNewTitle('');
    }
  };

  const sortedNotes = useMemo(() => {
    let filteredNotes = [...notes];

    if (filterFavorites) {
      filteredNotes = filteredNotes.filter(note => favorites.includes(note.id));
    } else if (filterRecent) {
      const recentNoteIds = new Set(recentFiles);
      filteredNotes = filteredNotes.filter(note => recentNoteIds.has(note.id));
    } else if (showTags) {
      filteredNotes = filteredNotes.filter(note => note.tags.length > 0);
    } else if (currentFolder !== null) {
      filteredNotes = filteredNotes.filter(note => note.folder === currentFolder);
    }

    return filteredNotes.sort((a, b) => {
      let comparison = 0;
      switch (settings.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = b.lastModified - a.lastModified;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return settings.sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [notes, favorites, recentFiles, currentFolder, settings.sortBy, settings.sortDirection, filterFavorites, filterRecent, showTags]);

  const sortedFolders = useMemo(() => {
    if (filterFavorites || filterRecent || showTags) return [];
    return folders.filter(folder => folder.parentId === currentFolder)
      .sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return settings.sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [folders, currentFolder, settings.sortDirection, filterFavorites, filterRecent, showTags]);

  const currentPath = getFolderPath(currentFolder);

  const renderContextMenu = (note: Note) => {
    if (!contextMenu || contextMenu.noteId !== note.id) return null;

    return (
      <div
        className="context-menu fixed bg-white rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
        style={{
          left: `${contextMenu.x}px`,
          top: `${contextMenu.y}px`,
        }}
      >
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          onClick={() => handleRename(note.id)}
        >
          <Edit className="w-4 h-4" />
          Rename
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          onClick={() => toggleFavorite(note.id)}
        >
          <Star className="w-4 h-4" />
          {note.favorite ? 'Remove from favorites' : 'Add to favorites'}
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          onClick={() => {/* Implement download */}}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
          onClick={() => handleDelete(note.id)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedFolders.map((folder) => (
        <div
          key={folder.id}
          className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          onClick={() => setCurrentFolder(folder.id)}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Folder className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <FileNameDisplay 
                name={folder.name} 
                showExtension={settings.showExtensions}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                {folder.path.split('/').slice(-2, -1)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          onClick={() => setSelectedFile(note.id)}
          onContextMenu={(e) => handleContextMenu(e, note.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              note.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/30' : 
              note.type === 'markdown' ? 'bg-purple-50 dark:bg-purple-900/30' : 
              'bg-slate-50 dark:bg-slate-900/30'
            }`}>
              <File className={`w-6 h-6 ${
                note.type === 'pdf' ? 'text-rose-500' :
                note.type === 'markdown' ? 'text-purple-500' : 
                'text-slate-500'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              {editingNote === note.id ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleSaveRename(note.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(note.id)}
                  className="w-full px-2 py-1 border rounded"
                  autoFocus
                />
              ) : (
                <FileNameDisplay 
                  name={note.title} 
                  showExtension={settings.showExtensions}
                />
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {new Date(note.lastModified).toLocaleDateString()}
              </p>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(note.id);
              }}
            >
              <Star className={`w-5 h-5 ${
                note.favorite ? 'text-amber-400 fill-amber-400' : 
                'text-slate-400 hover:text-amber-400'
              }`} />
            </button>
          </div>
          {note.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {renderContextMenu(note)}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {sortedFolders.map((folder) => (
        <div
          key={folder.id}
          className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer flex items-center"
          onClick={() => setCurrentFolder(folder.id)}
        >
          <div className="p-2 bg-blue-50 rounded-lg mr-4">
            <Folder className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{folder.name}</h3>
            <p className="text-sm text-gray-500">
              {folder.path.split('/').slice(-2, -1)}
            </p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2">
            <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      ))}

      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer flex items-center"
          onClick={() => setSelectedFile(note.id)}
          onContextMenu={(e) => handleContextMenu(e, note.id)}
        >
          <div className={`p-2 rounded-lg mr-4 ${
            note.type === 'pdf' ? 'bg-red-50' : 
            note.type === 'markdown' ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <File className={`w-5 h-5 ${
              note.type === 'pdf' ? 'text-red-500' :
              note.type === 'markdown' ? 'text-purple-500' : 'text-gray-500'
            }`} />
          </div>
          <div className="flex-1">
            {editingNote === note.id ? (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => handleSaveRename(note.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(note.id)}
                className="w-full px-2 py-1 border rounded"
                autoFocus
              />
            ) : (
              <h3 className="font-medium text-gray-900">{note.title}</h3>
            )}
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-500">
                {new Date(note.lastModified).toLocaleDateString()}
              </p>
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(note.id);
            }}
          >
            <Star className={`w-5 h-5 ${note.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
          </button>
          {renderContextMenu(note)}
        </div>
      ))}
    </div>
  );

  const renderCompactView = () => (
    <div className="space-y-1">
      {sortedFolders.map((folder) => (
        <div
          key={folder.id}
          className="group px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer flex items-center"
          onClick={() => setCurrentFolder(folder.id)}
        >
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-3">
            <Folder className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200">{folder.name}</span>
        </div>
      ))}

      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className="group px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer flex items-center"
          onClick={() => setSelectedFile(note.id)}
          onContextMenu={(e) => handleContextMenu(e, note.id)}
        >
          <div className={`p-1.5 rounded-lg mr-3 ${
            note.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
            note.type === 'markdown' ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' :
            'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            <File className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200">{note.title}</span>
          {renderContextMenu(note)}
        </div>
      ))}
    </div>
  );

  const renderColumnsView = () => (
    <div className="grid grid-cols-3 gap-6">
      {sortedFolders.map((folder) => (
        <div
          key={folder.id}
          className="group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
          onClick={() => setCurrentFolder(folder.id)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Folder className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {folder.name}
              </h3>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {/* Add folder details here */}
          </div>
        </div>
      ))}

      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className="group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
          onClick={() => setSelectedFile(note.id)}
          onContextMenu={(e) => handleContextMenu(e, note.id)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-lg ${
              note.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/30' :
              note.type === 'markdown' ? 'bg-violet-50 dark:bg-violet-900/30' :
              'bg-slate-50 dark:bg-slate-800'
            }`}>
              <File className={`w-5 h-5 ${
                note.type === 'pdf' ? 'text-rose-600 dark:text-rose-400' :
                note.type === 'markdown' ? 'text-violet-600 dark:text-violet-400' :
                'text-slate-600 dark:text-slate-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {note.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(note.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {renderContextMenu(note)}
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView();
      case 'list':
        return renderListView();
      case 'compact':
        return renderCompactView();
      case 'columns':
        return renderColumnsView();
      default:
        return renderGridView();
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Breadcrumb */}
      {!filterFavorites && !filterRecent && !showTags && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                <button
                  className="hover:text-brand-500 dark:hover:text-brand-400 font-medium"
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={() => setCurrentFolder(null)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <Eye className="w-4 h-4" />
            View All Files
          </button>
        </div>
      )}

      {/* Section Title and Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-700">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
            {filterFavorites ? 'Favorites' : 
             filterRecent ? 'Recent Files' :
             showTags ? 'Browse by Tags' : 
             currentFolder === null ? 'All Files' : 'Current Folder'}
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {sortedFolders.length} folders, {sortedNotes.length} files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedNotes.length === 0 && sortedFolders.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-brand-50 dark:bg-brand-900/30 mb-4">
            <FolderTree className="w-8 h-8 text-brand-500" />
          </div>
          <p className="text-lg font-medium text-surface-600 dark:text-surface-300">
            {filterFavorites ? 'No favorite files yet' :
             filterRecent ? 'No recent files' :
             showTags ? 'No tagged files' : 'This folder is empty'}
          </p>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            {filterFavorites ? 'Mark files as favorites to see them here' :
             filterRecent ? 'Recently accessed files will appear here' :
             showTags ? 'Add tags to your files to organize them' : 'Upload some files to get started'}
          </p>
        </div>
      )}

      {/* Files Grid/List */}
      <div className="min-h-[300px]">
        {renderContent()}
      </div>

      {selectedFile && selectedFileData && (
        <FileViewer
          file={selectedFileData}
          onClose={() => {
            setSelectedFile(null);
            setSelectedFileData(null);
          }}
        />
      )}
    </div>
  );
};