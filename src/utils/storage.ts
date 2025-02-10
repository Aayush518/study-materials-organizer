export const customStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch (err) {
      console.warn('Storage error:', err);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const chunkSize = 500000; // 500KB chunks
      const chunks = Math.ceil(value.length / chunkSize);
      
      // Clear existing chunks
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${name}_chunk`)) {
          localStorage.removeItem(key);
        }
      }

      // Store new chunks
      for (let i = 0; i < chunks; i++) {
        const chunk = value.slice(i * chunkSize, (i + 1) * chunkSize);
        localStorage.setItem(`${name}_chunk_${i}`, chunk);
      }
      
      localStorage.setItem(`${name}_chunks`, chunks.toString());
    } catch (err) {
      console.warn('Storage error:', err);
    }
  },
  removeItem: (name: string) => {
    try {
      const chunks = parseInt(localStorage.getItem(`${name}_chunks`) || '0');
      for (let i = 0; i < chunks; i++) {
        localStorage.removeItem(`${name}_chunk_${i}`);
      }
      localStorage.removeItem(`${name}_chunks`);
    } catch (err) {
      console.warn('Storage error:', err);
    }
  },
};