import React, { useState, useEffect } from 'react';
import { ViewerProps } from '../../types';
import { FileText, Download, File, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { PDFViewer } from './PDFViewer';

// Cloud conversion service URL (you would need to set this up)
const CONVERSION_API = 'https://api.cloudconvert.com/v2/convert';

export const OfficeViewer: React.FC<ViewerProps> = ({ file, scale = 1, currentPage = 1, onPageChange, onError }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const convertToPdf = async () => {
      setIsConverting(true);
      setHasError(false);

      try {
        // For demonstration, we're using a mock conversion
        // In production, you would send the file to a conversion service
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate conversion time
        
        // For now, we'll just pass through the content
        // In production, this would be the converted PDF content
        setPdfContent(file.content);
      } catch (error) {
        console.error('Conversion error:', error);
        setHasError(true);
        onError?.('Failed to convert document to PDF');
      } finally {
        setIsConverting(false);
      }
    };

    if (file.type !== 'pdf') {
      convertToPdf();
    }
  }, [file]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => {
    setPdfContent(null);
    setHasError(false);
    setIsConverting(true);
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Conversion Failed</h3>
          <p className="text-red-600 mb-4">There was an error converting the document to PDF.</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Conversion
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Original
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Converting Document</h3>
          <p className="text-gray-600">Please wait while we convert your document to PDF...</p>
        </div>
      </div>
    );
  }

  if (pdfContent) {
    return (
      <div className="w-full h-[calc(100vh-200px)] min-h-[600px]">
        <PDFViewer
          file={{ ...file, content: pdfContent, type: 'pdf' }}
          scale={scale}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onError={onError}
        />
      </div>
    );
  }

  return null;
};

export const officePlugin = {
  type: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  component: OfficeViewer,
  thumbnail: async (file: Note) => {
    // Generate office document thumbnail
    return '';
  },
  index: async (file: Note) => {
    // Extract text from office documents for search indexing
    return [];
  }
};