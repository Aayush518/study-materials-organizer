import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Note } from '../types';

// Cache for converted PDFs
const pdfCache = new Map<string, string>();

export class PDFConverter {
  private static async convertMarkdownToPDF(content: string): Promise<string> {
    try {
      const doc = new jsPDF();
      const html = DOMPurify.sanitize(marked(content));
      
      // Create a temporary element to render markdown
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Split content into pages
      const lines = temp.innerText.split('\n');
      let y = 10;
      let page = 1;
      
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 10;
          page++;
        }
        
        doc.text(line, 10, y);
        y += 7;
      });
      
      return doc.output('dataurlstring');
    } catch (error) {
      console.error('Error converting markdown to PDF:', error);
      throw error;
    }
  }

  private static async convertTextToPDF(content: string): Promise<string> {
    try {
      const doc = new jsPDF();
      const lines = content.split('\n');
      let y = 10;
      let page = 1;
      
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 10;
          page++;
        }
        
        doc.text(line, 10, y);
        y += 7;
      });
      
      return doc.output('dataurlstring');
    } catch (error) {
      console.error('Error converting text to PDF:', error);
      throw error;
    }
  }

  private static async convertOfficeToPDF(content: string, type: string): Promise<string> {
    try {
      // Create a simple PDF with a message since we can't convert office documents client-side
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Document Preview Not Available', 20, 30);
      doc.setFontSize(12);
      doc.text([
        'This document cannot be previewed in the browser.',
        'Please download the original file to view it.',
        '',
        `File type: ${type.toUpperCase()}`,
        `File name: ${content.substring(0, 50)}...`
      ], 20, 50);
      
      return doc.output('dataurlstring');
    } catch (error) {
      console.error('Error creating PDF message:', error);
      throw error;
    }
  }

  static async convertToPDF(note: Note): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${note.id}-${note.lastModified}`;
      if (pdfCache.has(cacheKey)) {
        return pdfCache.get(cacheKey)!;
      }

      let pdfContent: string;

      switch (note.type) {
        case 'markdown':
          pdfContent = await this.convertMarkdownToPDF(note.content);
          break;
        case 'text':
          pdfContent = await this.convertTextToPDF(note.content);
          break;
        case 'doc':
        case 'docx':
        case 'ppt':
        case 'pptx':
        case 'xls':
        case 'xlsx':
          pdfContent = await this.convertOfficeToPDF(note.content, note.type);
          break;
        case 'pdf':
          pdfContent = note.content;
          break;
        default:
          throw new Error(`Unsupported file type: ${note.type}`);
      }

      // Cache the result
      pdfCache.set(cacheKey, pdfContent);

      // Implement cache size limit (100MB)
      let cacheSize = 0;
      for (const [key, value] of pdfCache.entries()) {
        cacheSize += value.length;
        if (cacheSize > 100 * 1024 * 1024) { // 100MB limit
          pdfCache.delete(key);
        }
      }

      return pdfContent;
    } catch (error) {
      console.error('Error converting to PDF:', error);
      throw error;
    }
  }

  static clearCache() {
    pdfCache.clear();
  }

  static removeFromCache(noteId: string) {
    for (const key of pdfCache.keys()) {
      if (key.startsWith(noteId)) {
        pdfCache.delete(key);
      }
    }
  }
}