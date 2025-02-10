import React, { useRef, useState } from 'react';
import { FolderUp, AlertCircle, Loader2, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

export const DirectorySetup: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importDirectory, isScanning, scanProgress, setDirectorySet } = useStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = Array.from(e.dataTransfer.items);
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          try {
            // @ts-ignore
            const dirHandle = await entry.getAsFileSystemHandle();
            await importDirectory(dirHandle);
            setDirectorySet(true);
            break;
          } catch (error) {
            console.error('Error accessing directory:', error);
          }
        }
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      try {
        await importDirectory(files);
        setDirectorySet(true);
      } catch (error) {
        console.error('Error processing files:', error);
      }
    }
  };

  return (
    <div className="relative">
      <div 
        className={`bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl shadow-2xl transition-all ${
          dragActive ? 'ring-4 ring-emerald-400 ring-opacity-50' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-start gap-6">
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <FolderUp className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3">
              Set Up Your Study Directory
            </h3>
            <p className="text-slate-300 text-lg mb-6">
              Choose your study materials or drag and drop a folder here. We'll organize and index your files automatically.
            </p>
            {isScanning ? (
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-300 mt-2">
                    Scanning and indexing files... {Math.round(scanProgress)}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  className="hidden"
                  webkitdirectory=""
                  directory=""
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 justify-center group shadow-lg shadow-emerald-500/20"
                >
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Select Files
                </button>
                <p className="text-sm text-slate-400 text-center">
                  or drag and drop a folder here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <AlertCircle className="w-4 h-4 text-slate-500" />
        <p>Your files remain on your device. We only create an index for better organization.</p>
      </div>
    </div>
  );
};