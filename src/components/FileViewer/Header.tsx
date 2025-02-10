import React from 'react';
import { Star, Download, Maximize2, Minimize2, PanelRightClose, PanelRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Note } from '../../types';

interface HeaderProps {
  file: Note;
  scale: number;
  isFullscreen: boolean;
  isChatSidebarOpen: boolean;
  toggleFavorite: (id: string) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleDownload: () => void;
  toggleFullscreen: () => void;
  toggleChatSidebar: () => void;
  onClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  file,
  scale,
  isFullscreen,
  isChatSidebarOpen,
  toggleFavorite,
  handleZoomIn,
  handleZoomOut,
  handleDownload,
  toggleFullscreen,
  toggleChatSidebar,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-semibold tracking-tight">
          {file.title}
        </h3>
        <button
          onClick={() => toggleFavorite(file.id)}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <Star className={`w-5 h-5 ${file.favorite ? 'text-amber-400 fill-amber-400' : 'text-white/70'}`} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleChatSidebar}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isChatSidebarOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70'
          }`}
          title={isChatSidebarOpen ? 'Hide Chat' : 'Show Chat'}
        >
          {isChatSidebarOpen ? (
            <PanelRightClose className="w-5 h-5" />
          ) : (
            <PanelRight className="w-5 h-5" />
          )}
        </button>
        <div className="h-6 w-px bg-white/20" />
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium w-16 text-center text-white/90">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-white/20" />
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-rose-500 rounded-lg transition-all duration-200 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};