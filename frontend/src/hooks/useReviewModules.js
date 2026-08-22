// 📁 useReviewModules.js
import { useState, useEffect, useCallback } from 'react';
import modulesApi from '../api/modulesApi';

export function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Module shape (from backend):
 * { id, title, description, category, fileName, fileType, fileSize,
 *   fileUrl, uploadedBy, uploadedAt }
 */
export default function useReviewModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await modulesApi.getModules();
      const list = Array.isArray(data) ? data : (data.results || []);
      setModules(list);
    } catch (err) {
      console.error('Failed to load review modules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const addModule = async ({ title, description, category, file }) => {
    const saved = await modulesApi.createModule({ title, description, category, file });
    await fetchModules(); // refresh list so uploadedBy/uploadedAt come from server
    return saved;
  };

  const removeModule = async (id) => {
    await modulesApi.deleteModule(id);
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const downloadModule = (meta) => {
    if (!meta.fileUrl) {
      alert('File is not available for download.');
      return;
    }
    const a = document.createElement('a');
    a.href = meta.fileUrl;
    a.download = meta.fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return { modules, loading, addModule, removeModule, downloadModule, refetch: fetchModules };
}