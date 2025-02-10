import React from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

interface NavigationProps {
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  showJumpToPage: boolean;
  setShowJumpToPage: (show: boolean) => void;
  jumpToPage: string;
  setJumpToPage: (page: string) => void;
  handleJumpToPage: (e: React.FormEvent) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  numPages,
  onPageChange,
  showJumpToPage,
  setShowJumpToPage,
  jumpToPage,
  setJumpToPage,
  handleJumpToPage,
}) => {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between p-2 bg-white/90 backdrop-blur-sm border-b">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowJumpToPage(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors font-medium text-emerald-700 flex items-center gap-2"
          >
            <span>Page {currentPage}</span>
            <span className="text-emerald-400">of {numPages}</span>
          </button>

          {showJumpToPage && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-xl border z-50 min-w-[200px]">
              <form onSubmit={handleJumpToPage} className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Jump to Page
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    placeholder={`1-${numPages}`}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Go to Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJumpToPage(false)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= numPages}
          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(currentPage / numPages) * 100}%` }}
        />
      </div>
    </div>
  );
};