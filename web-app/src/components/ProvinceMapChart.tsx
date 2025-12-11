import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import type { ProvinceStats } from '../types';
import { formatNumber, formatPercent } from '../utils/dataProcessor';

interface ProvinceMapChartProps {
  data: ProvinceStats[];
  theme: 'dark' | 'light';
}

export function ProvinceMapChart({ data, theme }: ProvinceMapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Theme-aware colors
  const primaryColor = theme === 'dark' ? '#00cc66' : '#008844';
  const primaryColorDark = theme === 'dark' ? '#009944' : '#006633';
  const primaryColorLight = theme === 'dark' ? '#00ff80' : '#00aa55';
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = theme === 'dark' ? '#00cc66' : '#333333';
  const gridColor = theme === 'dark' ? '#333' : '#ddd';

  // Prepare data for chart
  const chartData = useMemo(() => {
    // Sort by totalOutbound for ranking
    const sortedData = [...data]
      .filter(d => d.totalOutbound > 0)
      .sort((a, b) => b.totalOutbound - a.totalOutbound);

    // Bar chart data - TOP 20
    const barData = sortedData.slice(0, 20).map(d => ({
      name: d.province,
      value: d.totalOutbound,
      blackValue: d.blackOutbound,
      blackRate: d.blackOutboundRate,
    }));

    return { barData, sortedData };
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
        text: '各省份外呼量排名 TOP20',
        left: 'center',
        textStyle: {
          color: textColor,
          fontFamily: 'Consolas, Monaco, monospace',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: bgColor,
        borderColor: primaryColor,
        textStyle: {
          color: textColor,
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
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.barData.map(d => d.name),
        axisLabel: {
          color: textColor,
          rotate: 45,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: { color: primaryColor },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: textColor,
          formatter: (value: number) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          },
          fontFamily: 'Consolas, Monaco, monospace',
        },
        axisLine: {
          lineStyle: { color: primaryColor },
        },
        splitLine: {
          lineStyle: { color: gridColor },
        },
      },
      series: [
        {
          name: '总外呼量',
          type: 'bar',
          data: chartData.barData.map(d => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: primaryColor },
              { offset: 1, color: primaryColorDark },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: primaryColorLight },
                { offset: 1, color: primaryColor },
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
      legend: {
        data: ['总外呼量', '黑名单外呼'],
        bottom: 0,
        textStyle: {
          color: textColor,
        },
      },
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    });

    chartInstance.current.setOption(getBarOption(), true);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [chartData, theme, primaryColor, primaryColorDark, primaryColorLight, bgColor, textColor, gridColor]);

  return (
    <div className="province-chart-container">
      <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
}
