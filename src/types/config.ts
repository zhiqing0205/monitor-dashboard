export interface MonitorConfig {
  id: string;
  name: string;
  url: string;
  auth?: {
    type: 'bearer' | 'basic' | 'apikey' | 'cookie' | 'authorization';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    cookie?: string;
    authorization?: string;
    headers?: Record<string, string>;
  };
  displayUnit?: string;
  total?: number;
  balanceField?: string; // 响应体中余额字段名，默认为 'balance'
  expiryField?: string; // 响应体中当天过期金额字段名，可选
  totalField?: string; // 响应体中总量字段名，可选
  reverse?: boolean; // 是否反转计算（总量 - 使用量 = 余额），默认为 false
  decimals?: number; // 保留小数位数，默认为 2
}

export interface BalanceResponse {
  balance: number;
  expiry?: number; // 当天过期金额
  total?: number; // 总量
  currency?: string;
  timestamp: number;
}

export interface MonitorStatus {
  id: string;
  balance: number;
  expiry?: number; // 当天过期金额
  total?: number; // 总量
  displayUnit?: string;
  decimals?: number; // 保留小数位数
  lastUpdated: number;
  status: 'success' | 'error' | 'loading';
  error?: string;
}