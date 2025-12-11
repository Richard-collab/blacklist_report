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
  calculateGroupStats,
  calculateProvinceStats,
  calculateAccountStats,
  getUniqueGroups,
  formatNumber,
  formatPercent,
  hasMultipleNumericGroups,
} from '../utils/dataProcessor';
import { ProvinceMapChart } from './ProvinceMapChart';

interface ReportViewProps {
  data: BlacklistRecord[];
  onBack: () => void;
}

type TabType = 'overall' | 'group' | 'province' | 'account';

export function ReportView({ data, onBack }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overall');
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const overallStats = useMemo(() => calculateOverallStats(data), [data]);
  const groupStats = useMemo(() => calculateGroupStats(data), [data]);
  const provinceStats = useMemo(() => calculateProvinceStats(data, selectedGroup || undefined), [data, selectedGroup]);
  const accountStats = useMemo(() => calculateAccountStats(data), [data]);
  const uniqueGroups = useMemo(() => getUniqueGroups(data), [data]);
  const hasMultipleGroups = useMemo(() => hasMultipleNumericGroups(data), [data]);

  const renderOverallTab = () => (
    <div className="section">
      <h2>{'>'} 黑名单大盘触发</h2>
      
      {hasMultipleGroups && (
        <div className="warning">
          ⚠️ 警告: 当前数据中包含多个数字group，这可能意味着数据来自不同的黑名单规则。
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总外呼量</h3>
          <div className="value">{formatNumber(overallStats.totalOutbound)}</div>
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
          <div className="value">{formatNumber(overallStats.totalPickup)}</div>
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
          <div className="value">{formatNumber(overallStats.totalPay)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单支付量</h3>
          <div className="value warning">{formatNumber(overallStats.blackPay)}</div>
        </div>
        <div className="stat-card">
          <h3>黑名单支付占比</h3>
          <div className="value warning">{formatPercent(overallStats.blackPayRate)}</div>
        </div>
      </div>

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
              <Cell fill="#33ff33" />
              <Cell fill="#ff6666" />
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #33ff33', color: '#33ff33' }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderGroupTab = () => (
    <div className="section">
      <h2>{'>'} 黑名单分Group触发</h2>
      
      <div className="chart-container">
        <h3>各Group外呼量对比</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={groupStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" stroke="#33ff33" />
            <YAxis type="category" dataKey="group" stroke="#33ff33" width={150} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #33ff33', color: '#33ff33' }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Bar dataKey="totalOutbound" name="总外呼量" fill="#33ff33" />
            <Bar dataKey="blackOutbound" name="黑名单外呼量" fill="#ff6666" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container scrollbar">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>总外呼量</th>
              <th>黑名单外呼量</th>
              <th>黑名单外呼占比</th>
              <th>总接听量</th>
              <th>黑名单接听量</th>
              <th>黑名单接听占比</th>
            </tr>
          </thead>
          <tbody>
            {groupStats.map((stat) => (
              <tr key={stat.group}>
                <td>{stat.group}</td>
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

  const renderProvinceTab = () => (
    <div className="section">
      <h2>{'>'} 黑名单分Group分省份触发</h2>
      
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
        <ProvinceMapChart data={provinceStats} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" stroke="#33ff33" />
            <YAxis type="category" dataKey="account" stroke="#33ff33" width={120} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #33ff33', color: '#33ff33' }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Bar dataKey="totalOutbound" name="总外呼量" fill="#33ff33" />
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
          className={`tab ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => setActiveTab('group')}
        >
          分Group触发
        </button>
        <button 
          className={`tab ${activeTab === 'province' ? 'active' : ''}`}
          onClick={() => setActiveTab('province')}
        >
          分Group分省份触发
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          分Account统计
        </button>
      </div>

      {activeTab === 'overall' && renderOverallTab()}
      {activeTab === 'group' && renderGroupTab()}
      {activeTab === 'province' && renderProvinceTab()}
      {activeTab === 'account' && renderAccountTab()}
    </div>
  );
}
