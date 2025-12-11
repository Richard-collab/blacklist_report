import { useEffect, useRef, useMemo, useState } from 'react';
import * as echarts from 'echarts';
import type { ProvinceStats } from '../types';
import { formatNumber, formatPercent } from '../utils/dataProcessor';

interface ProvinceMapChartProps {
  data: ProvinceStats[];
}

// China provinces GeoJSON coordinates (simplified version)
const PROVINCE_COORDS: Record<string, [number, number]> = {
  '北京': [116.4, 39.9],
  '天津': [117.2, 39.1],
  '河北': [114.5, 38.0],
  '山西': [112.5, 37.9],
  '内蒙古': [111.7, 40.8],
  '辽宁': [123.4, 41.8],
  '吉林': [125.3, 43.9],
  '黑龙江': [126.6, 45.8],
  '上海': [121.5, 31.2],
  '江苏': [118.8, 32.1],
  '浙江': [120.2, 30.3],
  '安徽': [117.3, 31.9],
  '福建': [119.3, 26.1],
  '江西': [115.9, 28.7],
  '山东': [117.0, 36.7],
  '河南': [113.7, 34.8],
  '湖北': [114.3, 30.6],
  '湖南': [113.0, 28.2],
  '广东': [113.3, 23.1],
  '广西': [108.3, 22.8],
  '海南': [110.3, 20.0],
  '重庆': [106.5, 29.6],
  '四川': [104.1, 30.7],
  '贵州': [106.7, 26.6],
  '云南': [102.7, 25.0],
  '西藏': [91.1, 29.7],
  '陕西': [108.9, 34.3],
  '甘肃': [103.8, 36.1],
  '青海': [101.8, 36.6],
  '宁夏': [106.3, 38.5],
  '新疆': [87.6, 43.8],
};

export function ProvinceMapChart({ data }: ProvinceMapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [viewMode, setViewMode] = useState<'bar' | 'map'>('bar');

  // Prepare data for both views
  const chartData = useMemo(() => {
    // Sort by totalOutbound for ranking
    const sortedData = [...data]
      .filter(d => d.totalOutbound > 0)
      .sort((a, b) => b.totalOutbound - a.totalOutbound);

    // Bar chart data
    const barData = sortedData.slice(0, 20).map(d => ({
      name: d.province,
      value: d.totalOutbound,
      blackValue: d.blackOutbound,
      blackRate: d.blackOutboundRate,
    }));

    // Map scatter data (for geo visualization)
    const mapData = sortedData
      .filter(d => PROVINCE_COORDS[d.province])
      .map(d => ({
        name: d.province,
        value: [...PROVINCE_COORDS[d.province], d.totalOutbound],
        blackValue: d.blackOutbound,
        blackRate: d.blackOutboundRate,
      }));

    return { barData, mapData, sortedData };
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;

    // Dispose existing chart
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // Create new chart
    chartInstance.current = echarts.init(chartRef.current);

    const getBarOption = (): echarts.EChartsOption => ({
      backgroundColor: 'transparent',
      title: {
        text: '各省份外呼量排名',
        left: 'center',
        textStyle: {
          color: '#33ff33',
          fontFamily: 'Consolas, Monaco, monospace',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: '#1a1a1a',
        borderColor: '#33ff33',
        textStyle: {
          color: '#33ff33',
        },
        formatter: (params: unknown) => {
          const paramArr = params as { name: string; value: number; dataIndex: number }[];
          const item = chartData.barData[paramArr[0].dataIndex];
          return `
            <div style="font-family: Consolas, Monaco, monospace;">
              <strong>${item.name}</strong><br/>
              总外呼量: ${formatNumber(item.value)}<br/>
              黑名单外呼: ${formatNumber(item.blackValue)}<br/>
              黑名单占比: ${formatPercent(item.blackRate)}
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.barData.map(d => d.name),
        axisLabel: {
          color: '#33ff33',
          rotate: 45,
          fontFamily: 'Consolas, Monaco, monospace',
        },
        axisLine: {
          lineStyle: { color: '#33ff33' },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#33ff33',
          formatter: (value: number) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          },
          fontFamily: 'Consolas, Monaco, monospace',
        },
        axisLine: {
          lineStyle: { color: '#33ff33' },
        },
        splitLine: {
          lineStyle: { color: '#333' },
        },
      },
      series: [
        {
          name: '总外呼量',
          type: 'bar',
          data: chartData.barData.map(d => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#33ff33' },
              { offset: 1, color: '#00aa00' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#55ff55' },
                { offset: 1, color: '#33ff33' },
              ]),
            },
          },
          animationDelay: (idx: number) => idx * 50,
        },
        {
          name: '黑名单外呼',
          type: 'bar',
          data: chartData.barData.map(d => d.blackValue),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff6666' },
              { offset: 1, color: '#cc3333' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff8888' },
                { offset: 1, color: '#ff6666' },
              ]),
            },
          },
          animationDelay: (idx: number) => idx * 50 + 100,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    });

    const getMapOption = (): echarts.EChartsOption => ({
      backgroundColor: 'transparent',
      title: {
        text: '各省份外呼量分布',
        left: 'center',
        textStyle: {
          color: '#33ff33',
          fontFamily: 'Consolas, Monaco, monospace',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1a1a1a',
        borderColor: '#33ff33',
        textStyle: {
          color: '#33ff33',
        },
        formatter: (params: unknown) => {
          const param = params as { name: string; value: [number, number, number]; data: { blackValue: number; blackRate: number } };
          if (!param.value) return '';
          return `
            <div style="font-family: Consolas, Monaco, monospace;">
              <strong>${param.name}</strong><br/>
              总外呼量: ${formatNumber(param.value[2])}<br/>
              黑名单外呼: ${formatNumber(param.data.blackValue)}<br/>
              黑名单占比: ${formatPercent(param.data.blackRate)}
            </div>
          `;
        },
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: '#1a1a1a',
          borderColor: '#33ff33',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#2a2a2a',
          },
          label: {
            show: true,
            color: '#33ff33',
          },
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...chartData.mapData.map(d => d.value[2])),
        calculable: true,
        inRange: {
          color: ['#003300', '#33ff33'],
        },
        textStyle: {
          color: '#33ff33',
        },
        left: 'left',
        top: 'bottom',
      },
      series: [
        {
          name: '外呼量',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: chartData.mapData,
          symbolSize: (val: number[]) => {
            const maxVal = Math.max(...chartData.mapData.map(d => d.value[2]));
            return Math.max(10, (val[2] / maxVal) * 50);
          },
          itemStyle: {
            color: '#33ff33',
            shadowBlur: 10,
            shadowColor: '#33ff33',
          },
          emphasis: {
            scale: 1.5,
          },
          animationDelay: (idx: number) => idx * 100,
        },
      ],
    });

    // Set initial option
    const option = viewMode === 'bar' ? getBarOption() : getMapOption();
    chartInstance.current.setOption(option, true);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [chartData, viewMode]);

  // Toggle animation between views
  const handleToggleView = () => {
    setViewMode(prev => prev === 'bar' ? 'map' : 'bar');
  };

  return (
    <div className="province-chart-container">
      <div className="chart-controls">
        <button 
          className={`view-toggle ${viewMode === 'bar' ? 'active' : ''}`}
          onClick={handleToggleView}
        >
          {viewMode === 'bar' ? '📊 柱状图' : '🗺️ 散点图'} - 点击切换
        </button>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
      <style>{`
        .province-chart-container {
          position: relative;
        }
        .chart-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1em;
        }
        .view-toggle {
          background: transparent;
          border: 1px solid #33ff33;
          color: #33ff33;
          padding: 0.5em 1em;
          cursor: pointer;
          font-family: Consolas, Monaco, monospace;
          transition: all 0.3s ease;
        }
        .view-toggle:hover {
          background: rgba(51, 255, 51, 0.1);
          box-shadow: 0 0 10px rgba(51, 255, 51, 0.5);
        }
        .view-toggle.active {
          background: rgba(51, 255, 51, 0.2);
        }
      `}</style>
    </div>
  );
}
