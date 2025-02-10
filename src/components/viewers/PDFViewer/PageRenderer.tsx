import React from 'react';
import { Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';

interface PageRendererProps {
  pageNumber: number;
  scale: number;
  visiblePages: number[];
  handlePageLoadStart: (pageNum: number) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pageNumber,
  scale,
  visiblePages,
  handlePageLoadStart,
}) => {
  return (
    <Page
      key={`page_${pageNumber}`}
      pageNumber={pageNumber}
      scale={scale}
      loading={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
      className="shadow-lg bg-white"
      renderAnnotationLayer={true}
      renderTextLayer={visiblePages.includes(pageNumber)}
      onLoadStart={() => handlePageLoadStart(pageNumber)}
    />
  );
};