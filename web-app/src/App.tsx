import { useState, useEffect } from 'react';
import './App.css';
import { FileUpload } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { parseCSVData } from './utils/dataProcessor';
import type { BlacklistRecord } from './types';

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
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleFileLoad = (content: string) => {
    const records = parseCSVData(content);
    if (records.length === 0) {
      alert('无法解析CSV文件，请检查文件格式');
      return;
    }
    setData(records);
  };

  const handleBack = () => {
    setData(null);
  };

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ 亮色模式' : '🌙 暗色模式'}
      </button>
      {data === null ? (
        <FileUpload onFileLoad={handleFileLoad} />
      ) : (
        <ReportView data={data} onBack={handleBack} theme={theme} />
      )}
    </>
  );
}

export default App;
