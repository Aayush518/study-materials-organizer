import React, { useState, useEffect, useRef } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { ViewerProps } from '../../../types';
import { Loader2 } from 'lucide-react';
import { Navigation } from './Navigation';
import { PageRenderer } from './PageRenderer';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PDFViewer: React.FC<ViewerProps> = ({
  file,
  scale = 1,
  currentPage = 1,
  onPageChange,
  onError
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(currentPage);
  const [isLoading, setIsLoading] = useState(true);
  const [jumpToPage, setJumpToPage] = useState('');
  const [showJumpToPage, setShowJumpToPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => parseInt(entry.target.getAttribute('data-page') || '0'))
          .filter(page => page > 0);
        
        setVisiblePages(visible);
      },
      {
        root: container,
        threshold: 0.5
      }
    );

    pageRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (!isScrollingRef.current) {
        const elements = Array.from(pageRefs.current.entries());
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const containerBottom = containerTop + containerHeight;

        for (const [pageNum, element] of elements) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const elementHeight = elementBottom - elementTop;

          const visibleHeight = Math.min(elementBottom, containerBottom) - 
                              Math.max(elementTop, containerTop);
          
          if (visibleHeight / elementHeight > 0.5) {
            if (currentPageNumber !== pageNum) {
              setCurrentPageNumber(pageNum);
              onPageChange?.(pageNum);
            }
            break;
          }
        }
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPageNumber, onPageChange]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onPageChange?.(numPages);
    setIsLoading(false);
    setError(null);
  };

  const goToPage = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= numPages) {
      isScrollingRef.current = true;
      const pageElement = pageRefs.current.get(targetPage);
      if (pageElement) {
        setCurrentPageNumber(targetPage);
        onPageChange?.(targetPage);
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpToPage);
    if (page && page > 0 && page <= numPages) {
      goToPage(page);
      setJumpToPage('');
      setShowJumpToPage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPage(currentPageNumber - 1);
    } else if (e.key === 'ArrowRight') {
      goToPage(currentPageNumber + 1);
    }
  };

  const handlePageLoadStart = (pageNumber: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  };

  return (
    <div 
      className="flex flex-col h-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Navigation Controls */}
      <Navigation
        currentPage={currentPageNumber}
        numPages={numPages}
        onPageChange={goToPage}
        showJumpToPage={showJumpToPage}
        setShowJumpToPage={setShowJumpToPage}
        jumpToPage={jumpToPage}
        setJumpToPage={setJumpToPage}
        handleJumpToPage={handleJumpToPage}
      />

      {/* PDF Document */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth bg-gray-50 flex justify-center"
      >
        <Document
          file={file.content}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error('Error loading PDF:', err);
            setError(err.message);
            onError?.(err.message);
            setIsLoading(false);
          }}
          loading={null}
          className="max-w-4xl mx-auto"
        >
          <div className="py-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNum, el);
                }}
                data-page={pageNum}
                className="mb-4 last:mb-0"
              >
                <PageRenderer
                  pageNumber={pageNum}
                  scale={scale}
                  visiblePages={visiblePages}
                  handlePageLoadStart={handlePageLoadStart}
                />
              </div>
            ))}
          </div>
        </Document>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-red-50 text-red-600 p-8 rounded-lg max-w-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Error Loading PDF</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const pdfPlugin = {
  type: ['pdf'],
  component: PDFViewer,
  thumbnail: async (file: Note) => {
    return '';
  },
  index: async (file: Note) => {
    return [];
  }
};