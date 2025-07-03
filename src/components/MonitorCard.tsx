'use client';

import { MonitorStatus } from '@/types/config';
import { useEffect, useState } from 'react';

interface MonitorCardProps {
  status: MonitorStatus;
}

export default function MonitorCard({ status }: MonitorCardProps) {
  const { balance, expiry, total, displayUnit, decimals = 2, status: currentStatus, error, link } = status;
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    // 检测暗黑模式
    const checkDarkMode = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      setIsDarkMode(shouldBeDark);
    };

    checkDarkMode();
    
    // 监听主题变化
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);
  
  // 计算使用进度百分比 (已使用 / 总量)
  const usagePercentage = total ? Math.min(((total - balance) / total) * 100, 100) : 0;
  
  // 根据使用情况计算状态
  const isLowUsage = total && usagePercentage < 20;
  const isMediumUsage = total && usagePercentage >= 20 && usagePercentage <= 50;
  const isHighUsage = total && usagePercentage > 50 && usagePercentage <= 80;
  const isNearLimit = total && usagePercentage > 80;
  
  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };


  const getStatusColor = () => {
    if (currentStatus === 'error') return `border-red-500 ${isDarkMode ? 'bg-red-900/20 border-red-400' : 'bg-red-50'}`;
    if (currentStatus === 'loading') return `border-gray-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-50'}`;
    if (isNearLimit) return `border-red-600 ${isDarkMode ? 'bg-red-900/30 border-red-400' : 'bg-red-100'}`;
    if (isHighUsage) return `border-orange-500 ${isDarkMode ? 'bg-orange-900/20 border-orange-400' : 'bg-orange-50'}`;
    if (isMediumUsage) return `border-yellow-500 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-400' : 'bg-yellow-50'}`;
    if (isLowUsage) return `border-green-500 ${isDarkMode ? 'bg-green-900/20 border-green-400' : 'bg-green-50'}`;
    return `border-green-500 ${isDarkMode ? 'bg-green-900/20 border-green-400' : 'bg-green-50'}`;
  };

  const getProgressColor = () => {
    if (isNearLimit) return 'bg-red-600';
    if (isHighUsage) return 'bg-orange-500';
    if (isMediumUsage) return 'bg-yellow-500';
    if (isLowUsage) return 'bg-green-500';
    return 'bg-green-500';
  };
  
  const getStatusText = () => {
    if (isLowUsage) return '🟢 低使用量';
    if (isMediumUsage) return '🟡 中等使用量';
    if (isHighUsage) return '🟠 高使用量';
    if (isNearLimit) return '🔴 接近上限';
    return '🟢 良好';
  };

  const getStatusTextColor = () => {
    if (currentStatus === 'error') return isDarkMode ? 'text-red-400' : 'text-red-700';
    if (isNearLimit) return isDarkMode ? 'text-red-400' : 'text-red-700';
    if (isHighUsage) return isDarkMode ? 'text-orange-400' : 'text-orange-700';
    if (isMediumUsage) return isDarkMode ? 'text-yellow-400' : 'text-yellow-700';
    if (isLowUsage) return isDarkMode ? 'text-green-400' : 'text-green-700';
    return isDarkMode ? 'text-green-400' : 'text-green-700';
  };

  return (
    <div 
      className={`${link ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* 卡片主体 */}
      <div className={`relative p-6 rounded-xl border-2 ${getStatusColor()} backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-1">
          {/* 左侧：名称和总量 */}
          <div className="flex-1 pr-4">
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{status.id}</h3>
            {total && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                总量: {formatBalance(total)} {displayUnit || ''}
              </div>
            )}
            {expiry !== undefined && (
              <div className={`text-sm mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                今日过期: {formatBalance(expiry)} {displayUnit || ''}
              </div>
            )}
          </div>
          
          {/* 右侧：剩余量信息 */}
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStatusTextColor()}`}>
              {formatBalance(balance)}
            </div>
            {displayUnit && (
              <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {displayUnit}
              </div>
            )}
          </div>
        </div>

        {total && (
          <div className="mb-6">
            <div className={`flex justify-between text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>使用进度</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full ${getProgressColor()} transition-all duration-300`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        {currentStatus === 'error' && error && (
          <div className={`mt-4 p-3 border rounded text-sm ${
            isDarkMode 
              ? 'bg-red-900/30 border-red-600 text-red-400' 
              : 'bg-red-100 border-red-300 text-red-700'
          }`}>
            Error: {error}
          </div>
        )}

        {currentStatus === 'loading' && (
          <div className="mt-4 flex items-center justify-center">
            <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
          </div>
        )}
        
        {/* 链接指示器 - 右上角 */}
        {link && (
          <div className={`absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
        
        {/* 使用量状态标签 - 右下角 */}
        {total && (
          <div className={`absolute bottom-4 right-4 text-xs font-medium px-2 py-1 rounded-full shadow-sm border ${getStatusTextColor()} ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          }`}>
            {getStatusText()}
          </div>
        )}
      </div>
    </div>
  );
}