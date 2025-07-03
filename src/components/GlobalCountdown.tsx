'use client';

import { useState, useEffect } from 'react';
import { getTimeToNextUpdate } from '@/lib/cache';

interface GlobalCountdownProps {
  configIds: string[];
}

export default function GlobalCountdown({ configIds }: GlobalCountdownProps) {
  const [timeToUpdate, setTimeToUpdate] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 解决 SSR 水合错误
  useEffect(() => {
    setMounted(true);
    
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

  useEffect(() => {
    if (!mounted) return;
    
    const updateCountdown = () => {
      if (configIds.length === 0) return;
      
      // 获取第一个配置的剩余时间（因为是统一更新，所以都一样）
      const remaining = getTimeToNextUpdate(configIds[0]);
      setTimeToUpdate(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [configIds, mounted]);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '即将更新...';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')} 后更新`;
    }
    return `${seconds}s 后更新`;
  };

  // 当倒计时结束时，显示更新状态
  const isUpdating = timeToUpdate <= 0;

  if (!mounted || configIds.length === 0) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-lg shadow-lg rounded-full px-6 py-3 border transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/90 border-gray-600' 
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${isUpdating ? 'bg-green-500' : 'bg-blue-500'}`}></div>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {isUpdating ? '正在更新...' : formatCountdown(timeToUpdate)}
        </span>
      </div>
    </div>
  );
}