import { useState } from 'react';
import './App.css';
import { FileUpload } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { parseCSVData } from './utils/dataProcessor';
import type { BlacklistRecord } from './types';

function App() {
  const [data, setData] = useState<BlacklistRecord[] | null>(null);

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
      {data === null ? (
        <FileUpload onFileLoad={handleFileLoad} />
      ) : (
        <ReportView data={data} onBack={handleBack} />
      )}
    </>
  );
}

export default App;
