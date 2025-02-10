import React, { useState, useEffect, useRef } from 'react';
import { ViewerProps } from '../../types';
import { useStore } from '../../store/useStore';
import { Header } from './Header';
import { TagsBar } from './TagsBar';
import { PDFViewer } from '../viewers/PDFViewer';
import { AiChat } from '../AiChat';

export const FileViewer: React.FC<ViewerProps> = ({ file, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const { toggleFavorite, updateNote } = useStore();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (resizeRef.current?.contains(e.target as Node)) {
        isResizingRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(800, containerWidth * 0.6);

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setChatWidth(newWidth);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const handleAddTag = (tag: string) => {
    updateNote(file.id, {
      tags: [...file.tags, tag]
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNote(file.id, {
      tags: file.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = async () => {
    const viewer = document.getElementById('file-viewer');
    if (!viewer) return;

    if (!document.fullscreenElement) {
      await viewer.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        id="file-viewer"
        className="bg-surface-50 dark:bg-surface-900 w-full h-[95vh] rounded-xl flex flex-col overflow-hidden shadow-2xl border border-surface-200/20"
      >
        <Header
          file={file}
          scale={scale}
          isFullscreen={isFullscreen}
          isChatSidebarOpen={isChatSidebarOpen}
          toggleFavorite={toggleFavorite}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleDownload={handleDownload}
          toggleFullscreen={toggleFullscreen}
          toggleChatSidebar={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
          onClose={onClose}
        />

        <TagsBar
          file={file}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        <div className="flex-1 flex overflow-hidden">
          <div 
            className={`flex-1 overflow-y-auto scroll-smooth bg-surface-100 dark:bg-surface-800 transition-all duration-300`}
            style={{ width: isChatSidebarOpen ? `calc(100% - ${chatWidth}px)` : '100%' }}
          >
            <PDFViewer
              file={file}
              scale={scale}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

          {isChatSidebarOpen && (
            <>
              <div
                ref={resizeRef}
                className="w-1 hover:bg-brand-500 cursor-col-resize transition-colors"
              />
              <div 
                ref={chatContainerRef}
                style={{ width: `${chatWidth}px` }}
                className="border-l border-surface-200 dark:border-surface-700 flex flex-col bg-surface-50 dark:bg-surface-900"
              >
                <AiChat 
                  pdfContent={file.content}
                  onClose={() => setIsChatSidebarOpen(false)}
                  currentPage={currentPage}
                  fileName={file.title}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};