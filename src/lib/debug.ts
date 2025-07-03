// 检测是否为开发环境
export const isDevelopment = process.env.NODE_ENV === 'development';

// 开发环境调试日志
export const debugLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};

// 开发环境警告日志
export const debugWarn = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
};

// 开发环境错误日志
export const debugError = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.error(message, ...args);
  }
};