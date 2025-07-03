'use client';

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 渐变背景 */}
      <div className={`absolute inset-0 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`} />
      
      {/* 浮动圆圈 */}
      <div className="absolute inset-0">
        {/* 大圆圈 */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* 中等圆圈 */}
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-bounce delay-500" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-gradient-to-r from-indigo-400/15 to-cyan-400/15 rounded-full blur-2xl animate-bounce delay-1500" style={{ animationDuration: '4s' }} />
        
        {/* 小圆圈 */}
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-full blur-xl animate-ping delay-700" style={{ animationDuration: '2s' }} />
      </div>
      
      {/* 网格图案 */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDarkMode ? 'opacity-10' : 'opacity-5'
      }`} style={{
        backgroundImage: isDarkMode 
          ? 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)'
          : 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* 光线效果 */}
      <div className={`absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-pulse delay-300 transition-opacity duration-300 ${
        isDarkMode ? 'opacity-30' : 'opacity-20'
      }`} />
      <div className={`absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse delay-700 transition-opacity duration-300 ${
        isDarkMode ? 'opacity-30' : 'opacity-20'
      }`} />
    </div>
  );
}