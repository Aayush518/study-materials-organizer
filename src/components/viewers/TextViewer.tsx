import React from 'react';
import { ViewerProps } from '../../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const TextViewer: React.FC<ViewerProps> = ({ file }) => {
  const renderContent = () => {
    if (file.type === 'markdown') {
      const html = marked(file.content);
      return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
    }
    return <pre className="whitespace-pre-wrap font-mono text-sm">{file.content}</pre>;
  };

  return (
    <div className="prose max-w-none bg-white p-8 rounded-lg shadow-lg">
      {renderContent()}
    </div>
  );
};

export const textPlugin = {
  type: ['text', 'markdown'],
  component: TextViewer,
  thumbnail: async (file: Note) => {
    // Generate text preview thumbnail
    return '';
  },
  index: async (file: Note) => {
    // Create search index from text content
    return file.content
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2);
  }
};