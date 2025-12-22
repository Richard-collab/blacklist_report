import { useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import type { BatchFileResult } from '../types';
import { formatNumber, formatPercent } from '../utils/dataProcessor';

interface BatchReportViewProps {
  data: BatchFileResult[];
  onBack: () => void;
  theme: 'dark' | 'light';
}

export function BatchReportView({ data, onBack, theme }: BatchReportViewProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    const exportData = data.map(item => ({
      '文件名': item.fileName,
      '总外呼量': item.stats.totalOutbound,
      '黑名单外呼量': item.stats.blackOutbound,
      '黑名单外呼占比': formatPercent(item.stats.blackOutboundRate),
      '总接听量': item.stats.totalPickup,
      '黑名单接听量': item.stats.blackPickup,
      '黑名单接听占比': formatPercent(item.stats.blackPickupRate),
      '总支付量': item.stats.totalPay,
      '黑名单支付量': item.stats.blackPay,
      '黑名单支付占比': formatPercent(item.stats.blackPayRate),
      '总投诉量': item.stats.totalComplain,
      '黑名单投诉量': item.stats.blackComplain,
      '黑名单投诉占比': formatPercent(item.stats.blackComplainRate),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '批量分析报告');
    XLSX.writeFile(wb, `批量分析报告_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportImage = async () => {
    if (!tableRef.current) return;

    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `批量分析报告_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('导出图片失败');
    }
  };

  const handleRowClick = (item: BatchFileResult) => {
    // Generate a unique ID for this report session
    const reportId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save raw data to localStorage
    try {
      localStorage.setItem(`reportData_${reportId}`, JSON.stringify(item.rawData));

      // Open new window with the reportId
      const url = new URL(window.location.href);
      url.searchParams.set('reportId', reportId);
      window.open(url.toString(), '_blank');
    } catch (e) {
      console.error('Failed to save data for new window', e);
      alert('无法打开新窗口: 数据存储失败');
    }
  };

  return (
    <div className="container">
      <button className="back-button" onClick={onBack}>
        {'<'} 返回上传页面
      </button>

      <div className="terminal-header">
        <h1>批量分析报告<span className="terminal-cursor"></span></h1>
      </div>

      <div className="actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1em', gap: '10px' }}>
        <button onClick={handleExport} className="export-button">
          📥 导出 Excel
        </button>
        <button onClick={handleExportImage} className="export-button">
          📷 导出图片
        </button>
      </div>

      <div className="table-container-full" ref={tableRef}>
        <table className="batch-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>总外呼量</th>
              <th>黑名单外呼量</th>
              <th>黑名单外呼占比</th>
              <th>总接听量</th>
              <th>黑名单接听量</th>
              <th>黑名单接听占比</th>
              <th>总支付量</th>
              <th>黑名单支付量</th>
              <th>黑名单支付占比</th>
              <th>总投诉量</th>
              <th>黑名单投诉量</th>
              <th>黑名单投诉占比</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(item)}
                style={{ cursor: 'pointer' }}
                title="点击查看详细报告"
                className="clickable-row"
              >
                <td style={{ fontWeight: 'bold' }}>{item.fileName}</td>
                <td>{formatNumber(item.stats.totalOutbound)}</td>
                <td className="warning-text">{formatNumber(item.stats.blackOutbound)}</td>
                <td className="warning-text">{formatPercent(item.stats.blackOutboundRate)}</td>
                <td>{formatNumber(item.stats.totalPickup)}</td>
                <td className="warning-text">{formatNumber(item.stats.blackPickup)}</td>
                <td className="warning-text">{formatPercent(item.stats.blackPickupRate)}</td>
                <td>{formatNumber(item.stats.totalPay)}</td>
                <td className="warning-text">{formatNumber(item.stats.blackPay)}</td>
                <td className="warning-text">{formatPercent(item.stats.blackPayRate)}</td>
                <td>{formatNumber(item.stats.totalComplain)}</td>
                <td className="warning-text">{formatNumber(item.stats.blackComplain)}</td>
                <td className="warning-text">{formatPercent(item.stats.blackComplainRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .export-button {
          background-color: #4a9d6e;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .export-button:hover {
          background-color: #3d8b5f;
        }
        .clickable-row:hover {
          background-color: rgba(74, 157, 110, 0.1);
        }
        .warning-text {
          color: #ff6666;
        }
        [data-theme='light'] .warning-text {
          color: #d32f2f;
        }
        .table-container-full {
          width: 100%;
          overflow: visible;
          padding: 10px; /* Add padding for image export look */
          background-color: var(--bg-color-secondary); /* Ensure background is captured */
        }
        .table-container-full table {
          width: 100%;
          border-collapse: collapse;
        }
      `}</style>
    </div>
  );
}
