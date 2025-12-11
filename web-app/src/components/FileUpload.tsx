import { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('请上传 CSV 文件');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.readAsText(file, 'UTF-8');
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const loadSampleData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/sample-data.csv');
      const content = await response.text();
      onFileLoad(content);
    } catch {
      alert('无法加载示例数据');
    } finally {
      setLoading(false);
    }
  }, [onFileLoad]);

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container">
      <div className="terminal-header">
        <h1>黑名单回测报告分析系统<span className="terminal-cursor"></span></h1>
      </div>
      
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-icon">📁</div>
        <p>拖放 CSV 文件到此处</p>
        <p>或</p>
        <label>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            onChange={handleFileInput} 
          />
          <button type="button" onClick={handleSelectFile}>
            选择文件
          </button>
        </label>
        {fileName && (
          <p style={{ marginTop: '1em', color: '#33ff33' }}>
            已选择: {fileName}
          </p>
        )}
        <div style={{ marginTop: '1em' }}>
          <button type="button" onClick={loadSampleData} disabled={loading}>
            {loading ? '加载中...' : '加载示例数据'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2em', padding: '1em', backgroundColor: 'rgba(51, 255, 51, 0.05)', borderRadius: '8px' }}>
        <h3>CSV 文件格式要求:</h3>
        <pre style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '1em', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.85em'
        }}>
{`dt,account,province,group,total_outbound_count,black_outbound_count,total_pickup_count,black_pickup_count,total_pay_count,black_pay_count
2025-12-10,account1,广东,31,1000,100,500,50,10,1
2025-12-10,account1,广东,未触发黑名单部分,2000,0,800,0,20,0`}
        </pre>
      </div>
    </div>
  );
}
