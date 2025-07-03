import { MonitorConfig, BalanceResponse } from '@/types/config';
import { fetchBalance } from './api';
import { debugLog, debugError } from './debug';

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存时间
const CACHE_KEY_PREFIX = 'monitor_cache_';

interface CacheItem {
  data: BalanceResponse;
  timestamp: number;
  config: MonitorConfig;
}

export const getCachedData = (configId: string): CacheItem | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${configId}`);
    if (!cached) return null;
    
    const item: CacheItem = JSON.parse(cached);
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - item.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${configId}`);
      return null;
    }
    
    debugLog(`💾 [Cache Debug] Using cached data for ${configId}, age: ${Math.round((now - item.timestamp) / 1000)}s`);
    return item;
  } catch (error) {
    debugError('Failed to read cache:', error);
    return null;
  }
};

export const setCachedData = (configId: string, data: BalanceResponse, config: MonitorConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      config
    };
    
    localStorage.setItem(`${CACHE_KEY_PREFIX}${configId}`, JSON.stringify(item));
    debugLog(`💾 [Cache Debug] Cached data for ${configId}`);
  } catch (error) {
    debugError('Failed to write cache:', error);
  }
};

export const fetchWithCache = async (config: MonitorConfig, forceRefresh: boolean = false): Promise<BalanceResponse> => {
  // 如果强制刷新，先清除缓存
  if (forceRefresh) {
    clearCache(config.id);
    debugLog(`🔄 [Cache Debug] Force refresh for ${config.id}, cache cleared`);
  }
  
  // 先检查缓存
  const cached = getCachedData(config.id);
  if (cached && !forceRefresh) {
    return cached.data;
  }
  
  // 缓存未命中，从API获取新数据
  debugLog(`🌐 [Cache Debug] Cache miss for ${config.id}, fetching from API`);
  const data = await fetchBalance(config);
  
  // 缓存新数据
  setCachedData(config.id, data, config);
  
  return data;
};

export const clearCache = (configId?: string): void => {
  if (typeof window === 'undefined') return;
  
  if (configId) {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${configId}`);
    debugLog(`🗑️ [Cache Debug] Cleared cache for ${configId}`);
  } else {
    // 清除所有缓存
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    debugLog('🗑️ [Cache Debug] Cleared all cache');
  }
};

export const getCacheAge = (configId: string): number => {
  const cached = getCachedData(configId);
  if (!cached) return 0;
  
  return Date.now() - cached.timestamp;
};

export const getTimeToNextUpdate = (configId: string): number => {
  const cached = getCachedData(configId);
  if (!cached) return 0;
  
  const elapsed = Date.now() - cached.timestamp;
  const remaining = CACHE_DURATION - elapsed;
  
  return Math.max(0, remaining);
};