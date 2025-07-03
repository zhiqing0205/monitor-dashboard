import { MonitorConfig, BalanceResponse } from '@/types/config';
import { debugLog, debugError } from './debug';

// 获取嵌套对象的值，支持点号分隔的路径
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const fetchBalance = async (config: MonitorConfig): Promise<BalanceResponse> => {
  debugLog(`🚀 [API Debug] Fetching balance for ${config.id}`);
  debugLog(`🌐 [API Debug] URL: ${config.url}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.auth?.headers
  };

  if (config.auth) {
    debugLog(`🔐 [API Debug] Auth type: ${config.auth.type}`);
    switch (config.auth.type) {
      case 'bearer':
        if (config.auth.token) {
          headers['Authorization'] = `Bearer ${config.auth.token}`;
          debugLog(`🔑 [API Debug] Added Bearer token (length: ${config.auth.token.length})`);
        }
        break;
      case 'basic':
        if (config.auth.username && config.auth.password) {
          const credentials = btoa(`${config.auth.username}:${config.auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
          debugLog(`🔑 [API Debug] Added Basic auth for user: ${config.auth.username}`);
        }
        break;
      case 'apikey':
        if (config.auth.apiKey) {
          headers['X-API-Key'] = config.auth.apiKey;
          debugLog(`🔑 [API Debug] Added API key (length: ${config.auth.apiKey.length})`);
        }
        break;
      case 'cookie':
        if (config.auth.cookie) {
          headers['Cookie'] = config.auth.cookie;
          debugLog(`🍪 [API Debug] Added Cookie (length: ${config.auth.cookie.length})`);
        }
        break;
      case 'authorization':
        if (config.auth.authorization) {
          headers['Authorization'] = config.auth.authorization;
          debugLog(`🔑 [API Debug] Added custom Authorization (length: ${config.auth.authorization.length})`);
        }
        break;
    }
  } else {
    debugLog(`🔓 [API Debug] No authentication configured`);
  }

  try {
    debugLog(`📤 [API Debug] Request headers:`, Object.keys(headers).map(key => 
      key === 'Authorization' || key === 'Cookie' ? `${key}: [HIDDEN]` : `${key}: ${headers[key]}`
    ));
    
    // 使用代理API路由来避免CORS问题
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: config.url,
        headers,
        method: 'GET'
      }),
    });

    debugLog(`📥 [API Debug] Proxy response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    debugLog(`📊 [API Debug] Raw response data:`, data);
    
    // 获取余额字段值
    const balanceField = config.balanceField || 'balance';
    const balanceValue = getNestedValue(data, balanceField);
    debugLog(`💰 [API Debug] Balance field '${balanceField}':`, balanceValue);
    
    // 获取过期字段值（可选）
    let expiryValue: number | undefined;
    if (config.expiryField) {
      const expiry = getNestedValue(data, config.expiryField);
      expiryValue = typeof expiry === 'number' ? expiry : (expiry ? parseFloat(String(expiry)) : undefined);
      debugLog(`⏰ [API Debug] Expiry field '${config.expiryField}':`, expiry, '→', expiryValue);
    }
    
    // 获取总量字段值（可选）
    let totalValue: number | undefined;
    if (config.totalField) {
      const total = getNestedValue(data, config.totalField);
      totalValue = typeof total === 'number' ? total : (total ? parseFloat(String(total)) : undefined);
      debugLog(`📊 [API Debug] Total field '${config.totalField}':`, total, '→', totalValue);
    }
    
    // 处理反转计算
    let finalBalance = typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue) || '0');
    const finalTotal = totalValue || config.total;
    
    if (config.reverse && finalTotal) {
      // 如果reverse=true，说明API返回的是已使用量，需要计算剩余余额
      const usedAmount = finalBalance;
      finalBalance = finalTotal - usedAmount;
      debugLog(`🔄 [API Debug] Reverse calculation (Total - Used): ${finalTotal} - ${usedAmount} = ${finalBalance}`);
    }
    
    debugLog(`💡 [API Debug] Balance calculation mode:`, config.reverse ? 'Reverse (API返回使用量)' : 'Direct (API返回余额)');
    
    const result = {
      balance: finalBalance,
      expiry: expiryValue,
      total: finalTotal,
      currency: data.currency || config.displayUnit,
      timestamp: Date.now()
    };
    
    debugLog(`✅ [API Debug] Final parsed result:`, result);
    
    return result;
  } catch (error) {
    debugError(`Failed to fetch balance for ${config.name}:`, error);
    throw error;
  }
};