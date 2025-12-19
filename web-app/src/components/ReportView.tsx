import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { BlacklistRecord } from '../types';
import {
  calculateOverallStats,
  calculateProvinceStats,
  calculateAccountStats,
  calculateAccountProvinceStats,
  getUniqueGroups,
  getUniqueAccounts,
  formatNumber,
  formatPercent,
} from '../utils/dataProcessor';
import { ProvinceMapChart } from './ProvinceMapChart';

interface ReportViewProps {
  data: BlacklistRecord[];
  onBack: () => void;
  theme: 'dark' | 'light';
}

type TabType = 'overall' | 'province' | 'account' | 'accountProvince';

export function ReportView({ data, onBack, theme }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overall');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const overallStats = useMemo(() => calculateOverallStats(data), [data]);
  const provinceStats = useMemo(() => calculateProvinceStats(data, selectedGroup || undefined), [data, selectedGroup]);
  const accountStats = useMemo(() => calculateAccountStats(data), [data]);
  const accountProvinceStats = useMemo(() => calculateAccountProvinceStats(data, selectedAccount || undefined), [data, selectedAccount]);
  const uniqueGroups = useMemo(() => getUniqueGroups(data), [data]);
  const uniqueAccounts = useMemo(() => getUniqueAccounts(data), [data]);

  // 根据主题切换颜色
  const primaryColor = theme === 'dark' ? '#4a9d6e' : '#2d7a4a';

  const renderOverallTab = () => (
    <div className="section">
      <h2>{'>'} 黑名单大盘触发</h2>
      
      {/* 顶部统计卡片区域 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总外呼量</h3>
          <div className="value normal">{formatNumber(overallStats.totalOutbound)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单外呼量</h3>
          <div className="value warning">{formatNumber(overallStats.blackOutbound)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单外呼占比</h3>
          <div className="value warning">{formatPercent(overallStats.blackOutboundRate)}</div>
        </div>
        <div className="stat-card">
          <h3>总接听量</h3>
          <div className="value normal">{formatNumber(overallStats.totalPickup)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单接听量</h3>
          <div className="value warning">{formatNumber(overallStats.blackPickup)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单接听占比</h3>
          <div className="value warning">{formatPercent(overallStats.blackPickupRate)}</div>
        </div>
        <div className="stat-card">
          <h3>总支付量</h3>
          <div className="value normal">{formatNumber(overallStats.totalPay)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单支付量</h3>
          <div className="value warning">{formatNumber(overallStats.blackPay)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单支付占比</h3>
          <div className="value warning">{formatPercent(overallStats.blackPayRate)}</div>
        </div>
        <div className="stat-card">
          <h3>总投诉量</h3>
          <div className="value normal">{formatNumber(overallStats.totalComplain)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单投诉量</h3>
          <div className="value warning">{formatNumber(overallStats.blackComplain)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单投诉占比</h3>
          <div className="value warning">{formatPercent(overallStats.blackComplainRate)}</div>
        </div>
      </div>

      {/* 布局容器：使用 CSS Grid 实现并列展示 
         如果要拓展成 2行3列 (2*3)，只需将 gridTemplateColumns 改为 'repeat(3, 1fr)' 即可
      */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* 图表 1：外呼分布 */}
        <div className="chart-container">
          <h3>外呼量分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: '非黑名单外呼', value: overallStats.totalOutbound - overallStats.blackOutbound },
                  { name: '黑名单外呼', value: overallStats.blackOutbound },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
              >
                <Cell fill={primaryColor} />
                <Cell fill="#ff6666" />
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff', 
                  border: `1px solid ${primaryColor}`, 
                  color: primaryColor 
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 图表 2：投诉分布 */}
        <div className="chart-container">
          <h3>投诉量分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: '非黑名单投诉', value: overallStats.totalComplain - overallStats.blackComplain },
                  { name: '黑名单投诉', value: overallStats.blackComplain },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
              >
                <Cell fill={primaryColor} />
                <Cell fill="#ff6666" />
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff', 
                  border: `1px solid ${primaryColor}`, 
                  color: primaryColor 
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  );

  const renderProvinceTab = () => (
    <div className="section">
      <h2>{'>'} 黑名单分省份触发</h2>
      
      <div className="filter-bar">
        <label>
          选择Group:
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{ marginLeft: '0.5em' }}
          >
            <option value="">全部</option>
            {uniqueGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="chart-container">
        <ProvinceMapChart data={provinceStats} theme={theme} />
      </div>

      <div className="table-container scrollbar">
        <table>
          <thead>
            <tr>
              <th>省份</th>
              <th>总外呼量</th>
              <th>黑名单外呼量</th>
              <th>黑名单外呼占比</th>
              <th>总接听量</th>
              <th>黑名单接听量</th>
              <th>黑名单接听占比</th>
            </tr>
          </thead>
          <tbody>
            {provinceStats.map((stat) => (
              <tr key={stat.province}>
                <td>{stat.province}</td>
                <td>{formatNumber(stat.totalOutbound)}</td>
                <td>{formatNumber(stat.blackOutbound)}</td>
                <td>{formatPercent(stat.blackOutboundRate)}</td>
                <td>{formatNumber(stat.totalPickup)}</td>
                <td>{formatNumber(stat.blackPickup)}</td>
                <td>{formatPercent(stat.blackPickupRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="section">
      <h2>{'>'} 各Account数据统计</h2>

      <div className="chart-container">
        <h3>各Account外呼量TOP15</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={accountStats.slice(0, 15)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#ddd'} />
            <XAxis type="number" stroke={primaryColor} />
            <YAxis type="category" dataKey="account" stroke={primaryColor} width={120} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff', 
                border: `1px solid ${primaryColor}`, 
                color: primaryColor 
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Bar dataKey="totalOutbound" name="总外呼量" fill={primaryColor} />
            <Bar dataKey="blackOutbound" name="黑名单外呼量" fill="#ff6666" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container scrollbar">
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>总外呼量</th>
              <th>黑名单外呼量</th>
              <th>黑名单外呼占比</th>
              <th>总接听量</th>
              <th>黑名单接听量</th>
              <th>黑名单接听占比</th>
            </tr>
          </thead>
          <tbody>
            {accountStats.map((stat) => (
              <tr key={stat.account}>
                <td>{stat.account}</td>
                <td>{formatNumber(stat.totalOutbound)}</td>
                <td>{formatNumber(stat.blackOutbound)}</td>
                <td>{formatPercent(stat.blackOutboundRate)}</td>
                <td>{formatNumber(stat.totalPickup)}</td>
                <td>{formatNumber(stat.blackPickup)}</td>
                <td>{formatPercent(stat.blackPickupRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAccountProvinceTab = () => (
    <div className="section">
      <h2>{'>'} 分Account分省份统计</h2>

      <div className="filter-bar">
        <label>
          选择Account:
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ marginLeft: '0.5em' }}
          >
            <option value="">全部</option>
            {uniqueAccounts.map((account) => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="chart-container">
        <h3>Account省份外呼量TOP20</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={accountProvinceStats.slice(0, 20)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#ddd'} />
            <XAxis type="number" stroke={primaryColor} />
            <YAxis 
              type="category" 
              dataKey={(d) => `${d.account}-${d.province}`} 
              stroke={primaryColor} 
              width={150}
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff', 
                border: `1px solid ${primaryColor}`, 
                color: primaryColor 
              }}
              formatter={(value: number) => formatNumber(value)}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return `${data.account} - ${data.province}`;
                }
                return '';
              }}
            />
            <Legend />
            <Bar dataKey="totalOutbound" name="总外呼量" fill={primaryColor} />
            <Bar dataKey="blackOutbound" name="黑名单外呼量" fill="#ff6666" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container scrollbar">
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>省份</th>
              <th>总外呼量</th>
              <th>黑名单外呼量</th>
              <th>黑名单外呼占比</th>
              <th>总接听量</th>
              <th>黑名单接听量</th>
              <th>黑名单接听占比</th>
            </tr>
          </thead>
          <tbody>
            {accountProvinceStats.map((stat, index) => (
              <tr key={`${stat.account}-${stat.province}-${index}`}>
                <td>{stat.account}</td>
                <td>{stat.province}</td>
                <td>{formatNumber(stat.totalOutbound)}</td>
                <td>{formatNumber(stat.blackOutbound)}</td>
                <td>{formatPercent(stat.blackOutboundRate)}</td>
                <td>{formatNumber(stat.totalPickup)}</td>
                <td>{formatNumber(stat.blackPickup)}</td>
                <td>{formatPercent(stat.blackPickupRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container">
      <button className="back-button" onClick={onBack}>
        {'<'} 返回上传页面
      </button>

      <div className="terminal-header">
        <h1>黑名单回测报告<span className="terminal-cursor"></span></h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveTab('overall')}
        >
          大盘触发
        </button>
        <button 
          className={`tab ${activeTab === 'province' ? 'active' : ''}`}
          onClick={() => setActiveTab('province')}
        >
          分省份统计
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          分Account统计
        </button>
        <button 
          className={`tab ${activeTab === 'accountProvince' ? 'active' : ''}`}
          onClick={() => setActiveTab('accountProvince')}
        >
          分Account分省份
        </button>
      </div>

      {activeTab === 'overall' && renderOverallTab()}
      {activeTab === 'province' && renderProvinceTab()}
      {activeTab === 'account' && renderAccountTab()}
      {activeTab === 'accountProvince' && renderAccountProvinceTab()}
    </div>
  );
}