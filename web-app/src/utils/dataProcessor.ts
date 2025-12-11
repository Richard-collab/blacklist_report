import Papa from 'papaparse';
import type { 
  BlacklistRecord, 
  OverallStats, 
  GroupStats, 
  ProvinceStats,
  AccountStats 
} from '../types';

interface CSVRow {
  dt: string;
  account: string;
  province: string;
  group: string;
  total_outbound_count: string;
  black_outbound_count: string;
  total_pickup_count: string;
  black_pickup_count: string;
  total_pay_count: string;
  black_pay_count: string;
}

export function parseCSVData(csvText: string): BlacklistRecord[] {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 || !result.data) {
    return [];
  }

  return result.data.map((row) => ({
    dt: row.dt || '',
    account: row.account || '未知',
    province: row.province || '未知',
    group: row.group || '',
    total_outbound_count: parseInt(row.total_outbound_count) || 0,
    black_outbound_count: parseInt(row.black_outbound_count) || 0,
    total_pickup_count: parseInt(row.total_pickup_count) || 0,
    black_pickup_count: parseInt(row.black_pickup_count) || 0,
    total_pay_count: parseInt(row.total_pay_count) || 0,
    black_pay_count: parseInt(row.black_pay_count) || 0,
  }));
}

export function calculateOverallStats(records: BlacklistRecord[]): OverallStats {
  let totalOutbound = 0;
  let blackOutbound = 0;
  let totalPickup = 0;
  let blackPickup = 0;
  let totalPay = 0;
  let blackPay = 0;

  records.forEach((record) => {
    totalOutbound += record.total_outbound_count;
    blackOutbound += record.black_outbound_count;
    totalPickup += record.total_pickup_count;
    blackPickup += record.black_pickup_count;
    totalPay += record.total_pay_count;
    blackPay += record.black_pay_count;
  });

  return {
    totalOutbound,
    blackOutbound,
    totalPickup,
    blackPickup,
    totalPay,
    blackPay,
    blackOutboundRate: totalOutbound > 0 ? (blackOutbound / totalOutbound) * 100 : 0,
    blackPickupRate: totalPickup > 0 ? (blackPickup / totalPickup) * 100 : 0,
    blackPayRate: totalPay > 0 ? (blackPay / totalPay) * 100 : 0,
  };
}

export function calculateGroupStats(records: BlacklistRecord[]): GroupStats[] {
  const groupMap = new Map<string, {
    totalOutbound: number;
    blackOutbound: number;
    totalPickup: number;
    blackPickup: number;
    totalPay: number;
    blackPay: number;
  }>();

  records.forEach((record) => {
    const group = record.group;
    const existing = groupMap.get(group) || {
      totalOutbound: 0,
      blackOutbound: 0,
      totalPickup: 0,
      blackPickup: 0,
      totalPay: 0,
      blackPay: 0,
    };

    groupMap.set(group, {
      totalOutbound: existing.totalOutbound + record.total_outbound_count,
      blackOutbound: existing.blackOutbound + record.black_outbound_count,
      totalPickup: existing.totalPickup + record.total_pickup_count,
      blackPickup: existing.blackPickup + record.black_pickup_count,
      totalPay: existing.totalPay + record.total_pay_count,
      blackPay: existing.blackPay + record.black_pay_count,
    });
  });

  return Array.from(groupMap.entries()).map(([group, stats]) => ({
    group,
    ...stats,
    blackOutboundRate: stats.totalOutbound > 0 ? (stats.blackOutbound / stats.totalOutbound) * 100 : 0,
    blackPickupRate: stats.totalPickup > 0 ? (stats.blackPickup / stats.totalPickup) * 100 : 0,
  }));
}

export function calculateProvinceStats(records: BlacklistRecord[], group?: string): ProvinceStats[] {
  const filteredRecords = group ? records.filter(r => r.group === group) : records;
  
  const provinceMap = new Map<string, {
    totalOutbound: number;
    blackOutbound: number;
    totalPickup: number;
    blackPickup: number;
    totalPay: number;
    blackPay: number;
  }>();

  filteredRecords.forEach((record) => {
    const province = record.province || '未知';
    const existing = provinceMap.get(province) || {
      totalOutbound: 0,
      blackOutbound: 0,
      totalPickup: 0,
      blackPickup: 0,
      totalPay: 0,
      blackPay: 0,
    };

    provinceMap.set(province, {
      totalOutbound: existing.totalOutbound + record.total_outbound_count,
      blackOutbound: existing.blackOutbound + record.black_outbound_count,
      totalPickup: existing.totalPickup + record.total_pickup_count,
      blackPickup: existing.blackPickup + record.black_pickup_count,
      totalPay: existing.totalPay + record.total_pay_count,
      blackPay: existing.blackPay + record.black_pay_count,
    });
  });

  return Array.from(provinceMap.entries())
    .map(([province, stats]) => ({
      province,
      ...stats,
      blackOutboundRate: stats.totalOutbound > 0 ? (stats.blackOutbound / stats.totalOutbound) * 100 : 0,
      blackPickupRate: stats.totalPickup > 0 ? (stats.blackPickup / stats.totalPickup) * 100 : 0,
    }))
    .sort((a, b) => b.totalOutbound - a.totalOutbound);
}

export function calculateAccountStats(records: BlacklistRecord[]): AccountStats[] {
  const accountMap = new Map<string, {
    totalOutbound: number;
    blackOutbound: number;
    totalPickup: number;
    blackPickup: number;
    totalPay: number;
    blackPay: number;
  }>();

  records.forEach((record) => {
    const account = record.account || '未知';
    const existing = accountMap.get(account) || {
      totalOutbound: 0,
      blackOutbound: 0,
      totalPickup: 0,
      blackPickup: 0,
      totalPay: 0,
      blackPay: 0,
    };

    accountMap.set(account, {
      totalOutbound: existing.totalOutbound + record.total_outbound_count,
      blackOutbound: existing.blackOutbound + record.black_outbound_count,
      totalPickup: existing.totalPickup + record.total_pickup_count,
      blackPickup: existing.blackPickup + record.black_pickup_count,
      totalPay: existing.totalPay + record.total_pay_count,
      blackPay: existing.blackPay + record.black_pay_count,
    });
  });

  return Array.from(accountMap.entries())
    .map(([account, stats]) => ({
      account,
      ...stats,
      blackOutboundRate: stats.totalOutbound > 0 ? (stats.blackOutbound / stats.totalOutbound) * 100 : 0,
      blackPickupRate: stats.totalPickup > 0 ? (stats.blackPickup / stats.totalPickup) * 100 : 0,
    }))
    .sort((a, b) => b.totalOutbound - a.totalOutbound);
}

export function getUniqueGroups(records: BlacklistRecord[]): string[] {
  const groups = new Set<string>();
  records.forEach(r => groups.add(r.group));
  return Array.from(groups).sort((a, b) => {
    if (a === '未触发黑名单部分') return -1;
    if (b === '未触发黑名单部分') return 1;
    return a.localeCompare(b);
  });
}

export function getUniqueProvinces(records: BlacklistRecord[]): string[] {
  const provinces = new Set<string>();
  records.forEach(r => provinces.add(r.province || '未知'));
  return Array.from(provinces).sort();
}

export function getUniqueAccounts(records: BlacklistRecord[]): string[] {
  const accounts = new Set<string>();
  records.forEach(r => accounts.add(r.account || '未知'));
  return Array.from(accounts).sort();
}

export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

export function formatPercent(num: number): string {
  return num.toFixed(2) + '%';
}

export function hasMultipleNumericGroups(records: BlacklistRecord[]): boolean {
  const numericGroups = new Set<string>();
  records.forEach(r => {
    if (/^\d+$/.test(r.group)) {
      numericGroups.add(r.group);
    }
  });
  return numericGroups.size > 1;
}
