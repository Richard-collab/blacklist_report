export interface BlacklistRecord {
  dt: string;
  account: string;
  province: string;
  group: string;
  total_outbound_count: number;
  black_outbound_count: number;
  total_pickup_count: number;
  black_pickup_count: number;
  total_pay_count: number;
  black_pay_count: number;
}

export interface OverallStats {
  totalOutbound: number;
  blackOutbound: number;
  totalPickup: number;
  blackPickup: number;
  totalPay: number;
  blackPay: number;
  blackOutboundRate: number;
  blackPickupRate: number;
  blackPayRate: number;
}

export interface GroupStats {
  group: string;
  totalOutbound: number;
  blackOutbound: number;
  totalPickup: number;
  blackPickup: number;
  totalPay: number;
  blackPay: number;
  blackOutboundRate: number;
  blackPickupRate: number;
}

export interface ProvinceStats {
  province: string;
  totalOutbound: number;
  blackOutbound: number;
  totalPickup: number;
  blackPickup: number;
  totalPay: number;
  blackPay: number;
  blackOutboundRate: number;
  blackPickupRate: number;
}

export interface AccountStats {
  account: string;
  totalOutbound: number;
  blackOutbound: number;
  totalPickup: number;
  blackPickup: number;
  totalPay: number;
  blackPay: number;
  blackOutboundRate: number;
  blackPickupRate: number;
}

export interface AccountProvinceStats {
  account: string;
  province: string;
  totalOutbound: number;
  blackOutbound: number;
  totalPickup: number;
  blackPickup: number;
  totalPay: number;
  blackPay: number;
  blackOutboundRate: number;
  blackPickupRate: number;
}
