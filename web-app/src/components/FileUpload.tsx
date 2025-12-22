import { useCallback, useState, useRef } from 'react';

export interface UploadedFile {
  name: string;
  content: string;
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[], isBatch: boolean) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    if (!isBatch && files.length > 1) {
      alert('单文件模式下只能上传一个文件，请切换到批量分析模式或只上传一个文件。');
      return;
    }

    const validFiles = files.filter(f => f.name.endsWith('.csv'));
    if (validFiles.length !== files.length) {
      alert('部分文件不是 CSV 格式，已被忽略');
    }

    if (validFiles.length === 0) {
      alert('请上传 CSV 文件');
      return;
    }

    setLoading(true);
    setFileNames(validFiles.map(f => f.name));

    try {
      const results: UploadedFile[] = await Promise.all(
        validFiles.map(file => new Promise<UploadedFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              content: e.target?.result as string
            });
          };
          reader.onerror = reject;
          reader.readAsText(file, 'UTF-8');
        }))
      );

      onUpload(results, isBatch);
    } catch (error) {
      console.error(error);
      alert('读取文件时出错');
    } finally {
      setLoading(false);
    }
  }, [isBatch, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, [processFiles]);

  const loadSampleData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/sample-data.csv');
      const content = await response.text();
      onUpload([{ name: 'sample-data.csv', content }], false);
    } catch {
      alert('无法加载示例数据');
    } finally {
      setLoading(false);
    }
  }, [onUpload]);

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container">
      <div className="terminal-header">
        <h1>黑名单回测报告分析系统<span className="terminal-cursor"></span></h1>
      </div>

      <div className="mode-switch" style={{ marginBottom: '1.5em', display: 'flex', justifyContent: 'center', gap: '1em' }}>
        <button
          className={`tab ${!isBatch ? 'active' : ''}`}
          onClick={() => {
            setIsBatch(false);
            setFileNames([]);
          }}
        >
          单文件分析
        </button>
        <button
          className={`tab ${isBatch ? 'active' : ''}`}
          onClick={() => {
            setIsBatch(true);
            setFileNames([]);
          }}
        >
          批量分析
        </button>
      </div>
      
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-icon">📁</div>
        <p>{isBatch ? '拖放多个 CSV 文件到此处' : '拖放 CSV 文件到此处'}</p>
        <p>或</p>
        <label>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            multiple={isBatch}
            onChange={handleFileInput} 
          />
          <button type="button" onClick={handleSelectFile}>
            {isBatch ? '选择多个文件' : '选择文件'}
          </button>
        </label>
        {fileNames.length > 0 && (
          <div style={{ marginTop: '1em', color: '#33ff33', textAlign: 'left', maxHeight: '100px', overflowY: 'auto' }}>
            <p>已选择 ({fileNames.length}):</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {fileNames.map(name => <li key={name}>{name}</li>)}
            </ul>
          </div>
        )}
        <div style={{ marginTop: '1em' }}>
          <button type="button" onClick={loadSampleData} disabled={loading || isBatch}>
            {loading ? '加载中...' : '加载示例数据 (单文件)'}
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
{`dt,account,province,group,total_outbound_count,black_outbound_count,total_pickup_count,black_pickup_count,total_pay_count,black_pay_count,total_complain_count,black_complain_count
2025-12-10,account1,广东,31,1000,100,500,50,10,1,5,1
2025-12-10,account1,广东,未触发黑名单部分,2000,0,800,0,20,0,0,0`}
        </pre>
      </div>
    </div>
  );
}
