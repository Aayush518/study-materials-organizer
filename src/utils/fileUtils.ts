import { v4 as uuidv4 } from 'uuid';
import { Note, Folder } from '../types';

export async function getFileType(name: string): Promise<Note['type']> {
  const extension = name.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'doc':
      return 'doc';
    case 'docx':
      return 'docx';
    case 'ppt':
      return 'ppt';
    case 'pptx':
      return 'pptx';
    case 'xls':
      return 'xls';
    case 'xlsx':
      return 'xlsx';
    default:
      return 'text';
  }
}

export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const extension = file.name.toLowerCase().split('.').pop();
      const mimeType = getMimeType(extension);
      resolve(`data:${mimeType};base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function getMimeType(extension: string | undefined): string {
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'md':
    case 'markdown':
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

export function sanitizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '');
}

export function getParentPath(path: string): string {
  const sanitized = sanitizePath(path);
  const parts = sanitized.split('/');
  return parts.slice(0, -1).join('/');
}

export function getFolderName(path: string): string {
  const sanitized = sanitizePath(path);
  const parts = sanitized.split('/');
  return parts[parts.length - 1];
}

export function generateSearchIndex(content: string): string[] {
  return content
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2);
}