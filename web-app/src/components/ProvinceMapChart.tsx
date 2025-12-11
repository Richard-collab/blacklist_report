import { useEffect, useRef, useMemo, useState } from 'react';
import * as echarts from 'echarts';
import type { ProvinceStats } from '../types';
import { formatNumber, formatPercent } from '../utils/dataProcessor';

// China map GeoJSON - simplified version with province boundaries
const CHINA_MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

interface ProvinceMapChartProps {
  data: ProvinceStats[];
  theme: 'dark' | 'light';
}

// Province name mapping for GeoJSON
const provinceNameMap: Record<string, string> = {
  '北京': '北京市',
  '天津': '天津市',
  '上海': '上海市',
  '重庆': '重庆市',
  '河北': '河北省',
  '山西': '山西省',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '海南': '海南省',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '台湾': '台湾省',
  '内蒙古': '内蒙古自治区',
  '广西': '广西壮族自治区',
  '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区',
};

// Reverse mapping
const reverseProvinceNameMap: Record<string, string> = Object.fromEntries(
  Object.entries(provinceNameMap).map(([k, v]) => [v, k])
);

export function ProvinceMapChart({ data, theme }: ProvinceMapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [viewType, setViewType] = useState<'bar' | 'map'>('bar');

  // Theme-aware colors - using less bright green
  const primaryColor = theme === 'dark' ? '#4a9d6e' : '#2d7a4a';
  const primaryColorDark = theme === 'dark' ? '#2d7a4a' : '#1d5a3a';
  const primaryColorLight = theme === 'dark' ? '#6bb88a' : '#4a9d6e';
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = theme === 'dark' ? '#4a9d6e' : '#333333';
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

    // Map data - all provinces
    const mapData = data.map(d => {
      const mapName = provinceNameMap[d.province] || d.province;
      return {
        name: mapName,
        value: d.totalOutbound,
        blackValue: d.blackOutbound,
        blackRate: d.blackOutboundRate,
        originalName: d.province,
      };
    });

    return { barData, sortedData, mapData };
  }, [data]);

  // Load China map
  useEffect(() => {
    const loadMap = async () => {
      try {
        const response = await fetch(CHINA_MAP_URL);
        if (!response.ok) throw new Error('Failed to load map');
        const geoJson = await response.json();
        echarts.registerMap('china', geoJson);
        setMapLoaded(true);
      } catch {
        console.error('Failed to load China map');
        setMapError(true);
      }
    };
    loadMap();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    if (viewType === 'map' && !mapLoaded) return;

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
          if (!paramArr || paramArr.length === 0) return '';
          const item = chartData.barData[paramArr[0].dataIndex];
          if (!item) return '';
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

    const getMapOption = (): echarts.EChartsOption => {
      const maxValue = Math.max(...chartData.mapData.map(d => d.value), 1);
      return {
        backgroundColor: 'transparent',
        title: {
          text: '各省份外呼量地图分布',
          left: 'center',
          textStyle: {
            color: textColor,
            fontFamily: 'Consolas, Monaco, monospace',
          },
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: bgColor,
          borderColor: primaryColor,
          textStyle: {
            color: textColor,
          },
          formatter: (params: unknown) => {
            const param = params as { name: string; value?: number; data?: { blackValue: number; blackRate: number; originalName: string } };
            const originalName = param.data?.originalName || reverseProvinceNameMap[param.name] || param.name;
            const value = param.value || 0;
            const blackValue = param.data?.blackValue || 0;
            const blackRate = param.data?.blackRate || 0;
            return `
              <div style="font-family: Consolas, Monaco, monospace;">
                <strong>${originalName}</strong><br/>
                总外呼量: ${formatNumber(value)}<br/>
                黑名单外呼: ${formatNumber(blackValue)}<br/>
                黑名单占比: ${formatPercent(blackRate)}
              </div>
            `;
          },
        },
        visualMap: {
          min: 0,
          max: maxValue,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          inRange: {
            color: [theme === 'dark' ? '#1a3a2a' : '#e8f5e9', primaryColor],
          },
          textStyle: {
            color: textColor,
          },
        },
        series: [
          {
            name: '外呼量',
            type: 'map',
            map: 'china',
            roam: true,
            label: {
              show: true,
              color: textColor,
              fontSize: 8,
            },
            emphasis: {
              label: {
                show: true,
                color: theme === 'dark' ? '#fff' : '#000',
              },
              itemStyle: {
                areaColor: primaryColorLight,
              },
            },
            itemStyle: {
              borderColor: primaryColor,
              borderWidth: 0.5,
            },
            data: chartData.mapData,
          },
        ],
      };
    };

    const option = viewType === 'map' ? getMapOption() : getBarOption();
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
  }, [chartData, theme, viewType, mapLoaded, primaryColor, primaryColorDark, primaryColorLight, bgColor, textColor, gridColor]);

  return (
    <div className="province-chart-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1em', gap: '0.5em' }}>
        <button 
          onClick={() => setViewType('bar')}
          style={{
            padding: '0.5em 1em',
            backgroundColor: viewType === 'bar' ? primaryColor : 'transparent',
            color: viewType === 'bar' ? bgColor : primaryColor,
            border: `1px solid ${primaryColor}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          📊 柱状图
        </button>
        <button 
          onClick={() => setViewType('map')}
          disabled={mapError}
          style={{
            padding: '0.5em 1em',
            backgroundColor: viewType === 'map' ? primaryColor : 'transparent',
            color: viewType === 'map' ? bgColor : primaryColor,
            border: `1px solid ${primaryColor}`,
            borderRadius: '4px',
            cursor: mapError ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: mapError ? 0.5 : 1,
          }}
        >
          🗺️ 地图 {!mapLoaded && !mapError && '(加载中...)'}
        </button>
      </div>
      {viewType === 'map' && !mapLoaded && !mapError && (
        <div style={{ textAlign: 'center', padding: '2em', color: textColor }}>
          正在加载地图数据...
        </div>
      )}
      <div ref={chartRef} style={{ width: '100%', height: '500px', display: (viewType === 'map' && !mapLoaded) ? 'none' : 'block' }} />
    </div>
  );
}
