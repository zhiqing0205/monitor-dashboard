'use client';

import { useState, useEffect } from 'react';
import { MonitorConfig, MonitorStatus } from '@/types/config';
import { getConfigs } from '@/lib/config';
import { fetchWithCache, getTimeToNextUpdate } from '@/lib/cache';
import MonitorCard from '@/components/MonitorCard';
import GlobalCountdown from '@/components/GlobalCountdown';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { debugLog } from '@/lib/debug';

export default function Home() {
  const [configs, setConfigs] = useState<MonitorConfig[]>([]);
  const [statuses, setStatuses] = useState<MonitorStatus[]>([]);
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 解决 SSR 水合错误
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadConfigs = () => {
      debugLog('🔄 [App Debug] Loading configurations...');
      const savedConfigs = getConfigs();
      debugLog('📋 [App Debug] Loaded configs:', savedConfigs.length);
      setConfigs(savedConfigs);
      
      const initialStatuses = savedConfigs.map(config => ({
        id: config.id,
        balance: 0,
        expiry: undefined,
        total: config.total,
        displayUnit: config.displayUnit || '',
        decimals: config.decimals ?? 2,
        lastUpdated: 0,
        status: 'loading' as const
      }));
      debugLog('📊 [App Debug] Initial statuses created:', initialStatuses.length);
      setStatuses(initialStatuses);
    };

    loadConfigs();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || configs.length === 0) return;
    
    const fetchAllBalances = async (forceRefresh: boolean = false) => {
      debugLog('🚀 [App Debug] Starting to fetch all balances for', configs.length, 'configs', forceRefresh ? '(force refresh)' : '');
      
      const promises = configs.map(async (config) => {
        debugLog(`⏳ [App Debug] Processing config: ${config.id}`);
        try {
          const response = await fetchWithCache(config, forceRefresh);
          debugLog(`✅ [App Debug] Successfully fetched ${config.id}:`, response);
          return {
            id: config.id,
            balance: response.balance,
            expiry: response.expiry,
            total: response.total || config.total,
            displayUnit: config.displayUnit || '',
            decimals: config.decimals ?? 2,
            lastUpdated: response.timestamp,
            status: 'success' as const
          };
        } catch (error) {
          debugLog(`❌ [App Debug] Failed to fetch ${config.id}:`, error);
          return {
            id: config.id,
            balance: 0,
            expiry: undefined,
            total: config.total,
            displayUnit: config.displayUnit || '',
            decimals: config.decimals ?? 2,
            lastUpdated: Date.now(),
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const results = await Promise.all(promises);
      debugLog('🎯 [App Debug] All fetch operations completed. Results:', results);
      setStatuses(results);
    };

    fetchAllBalances();
    
    // 设置5分钟统一更新间隔
    const interval = setInterval(() => {
      debugLog('⏰ [App Debug] 5-minute interval triggered, fetching all balances with force refresh');
      fetchAllBalances(true); // 强制刷新
    }, 5 * 60 * 1000);
    
    setUpdateInterval(interval);
    return () => {
      clearInterval(interval);
      setUpdateInterval(null);
    };
  }, [configs, mounted]);


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <AnimatedBackground />
      <Navbar onThemeChange={setIsDarkMode} />
      
      <div className="relative z-10 px-4 pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              实时监控仪表板
            </h1>
            <p className={`text-xl mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              追踪您的账户余额和使用情况
            </p>
          </div>

          {!mounted ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>加载中...</p>
              </div>
            </div>
          ) : configs.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className={`backdrop-blur-lg rounded-2xl p-12 shadow-xl border ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
                    isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'
                  }`}>
                    <svg className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    未配置监控项
                  </h3>
                  <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    请设置 MONITORS_CONFIG 环境变量来配置监控项目。
                  </p>
                  <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      参考 .env.example 文件了解配置格式
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statuses.map((status) => (
                <div key={status.id} className="transform hover:scale-105 transition-transform duration-200">
                  <MonitorCard status={status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {mounted && <GlobalCountdown configIds={configs.map(c => c.id)} />}
    </div>
  );
}