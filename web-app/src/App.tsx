import { useState, useEffect } from 'react';
import './App.css';
import { FileUpload } from './components/FileUpload';
import type { UploadedFile } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { BatchReportView } from './components/BatchReportView';
import { parseCSVData, calculateOverallStats } from './utils/dataProcessor';
import type { BlacklistRecord, BatchFileResult } from './types';

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      return savedTheme;
    }
  }
  return 'dark';
}

function App() {
  const [data, setData] = useState<BlacklistRecord[] | null>(null);
  const [batchData, setBatchData] = useState<BatchFileResult[] | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check for reportId in URL params on mount (for new window view)
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('reportId');
    if (reportId) {
      const storedData = localStorage.getItem(`reportData_${reportId}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          // Optional: Clear storage after loading?
          // Keeping it for now in case of refresh.
        } catch (e) {
          console.error('Failed to parse stored report data', e);
          alert('数据加载失败');
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleUpload = (files: UploadedFile[], isBatch: boolean) => {
    if (files.length === 0) return;

    if (isBatch) {
      // Batch Mode
      const results: BatchFileResult[] = [];
      files.forEach(file => {
        const records = parseCSVData(file.content);
        if (records.length > 0) {
          const stats = calculateOverallStats(records);
          results.push({
            fileName: file.name.replace(/\.csv$/i, ''),
            stats,
            rawData: records
          });
        }
      });

      if (results.length === 0) {
        alert('没有有效的 CSV 数据');
        return;
      }
      setBatchData(results);
      setData(null);
    } else {
      // Single Mode
      const records = parseCSVData(files[0].content);
      if (records.length === 0) {
        alert('无法解析CSV文件，请检查文件格式');
        return;
      }
      setData(records);
      setBatchData(null);
    }
  };

  const handleBack = () => {
    setData(null);
    setBatchData(null);
    // Clear URL params if any
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ 亮色模式' : '🌙 暗色模式'}
      </button>

      {data ? (
        <ReportView data={data} onBack={handleBack} theme={theme} />
      ) : batchData ? (
        <BatchReportView data={batchData} onBack={handleBack} theme={theme} />
      ) : (
        <FileUpload onUpload={handleUpload} />
      )}
    </>
  );
}

export default App;
