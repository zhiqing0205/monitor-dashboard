import { MonitorConfig } from '@/types/config';
import { debugLog, debugWarn, debugError } from './debug';

export const getConfigs = (): MonitorConfig[] => {
  try {
    const configString = process.env.NEXT_PUBLIC_MONITORS_CONFIG;
    debugLog('🔧 [Config Debug] Raw NEXT_PUBLIC_MONITORS_CONFIG:', configString ? 'Found' : 'Not found');
    
    if (configString) {
      debugLog('📝 [Config Debug] MONITORS_CONFIG length:', configString.length);
      debugLog('📄 [Config Debug] Raw config string:', configString.substring(0, 200) + '...');
      
      const configs = JSON.parse(configString) as MonitorConfig[];
      debugLog('✅ [Config Debug] Parsed configs count:', configs.length);
      
      const validatedConfigs = configs.map((config, index) => {
        debugLog(`🔍 [Config Debug] Validating config ${index + 1}:`, config.id);
        const validated = validateConfig(config);
        if (validated) {
          debugLog(`✅ [Config Debug] Config ${config.id} validated successfully`);
        } else {
          debugWarn(`❌ [Config Debug] Config ${config.id} validation failed`);
        }
        return validated;
      }).filter(Boolean) as MonitorConfig[];
      
      debugLog('🎯 [Config Debug] Final valid configs:', validatedConfigs.length);
      validatedConfigs.forEach(config => {
        debugLog(`📊 [Config Debug] ${config.id}:`, {
          url: config.url,
          balanceField: config.balanceField || 'balance',
          totalField: config.totalField || 'none',
          expiryField: config.expiryField || 'none',
          reverse: config.reverse || false,
          decimals: config.decimals,
          authType: config.auth?.type || 'none'
        });
      });
      
      return validatedConfigs;
    }
    
    debugWarn('⚠️ [Config Debug] NEXT_PUBLIC_MONITORS_CONFIG not found, using default configs');
    return getDefaultConfigs();
  } catch (error) {
    debugError('❌ [Config Debug] Failed to parse MONITORS_CONFIG environment variable:', error);
    return getDefaultConfigs();
  }
};

const validateConfig = (config: any): MonitorConfig | null => {
  if (!config || typeof config !== 'object') return null;
  
  const required = ['id', 'name', 'url'];
  for (const field of required) {
    if (!config[field]) {
      debugWarn(`Monitor config missing required field: ${field}`);
      return null;
    }
  }

  if (config.total && (typeof config.total !== 'number' || config.total <= 0)) {
    debugWarn(`Monitor config ${config.id}: total must be a positive number`);
    config.total = undefined;
  }

  if (config.auth && typeof config.auth !== 'object') {
    debugWarn(`Monitor config ${config.id}: auth must be an object`);
    config.auth = undefined;
  }

  return {
    id: String(config.id),
    name: String(config.name),
    url: String(config.url),
    displayUnit: config.displayUnit ? String(config.displayUnit) : undefined,
    total: config.total ? Number(config.total) : undefined,
    balanceField: config.balanceField ? String(config.balanceField) : undefined,
    expiryField: config.expiryField ? String(config.expiryField) : undefined,
    totalField: config.totalField ? String(config.totalField) : undefined,
    reverse: Boolean(config.reverse),
    decimals: typeof config.decimals === 'number' ? config.decimals : 2,
    auth: config.auth || undefined
  };
};

const getDefaultConfigs = (): MonitorConfig[] => [
  {
    id: 'example-1',
    name: 'Example API',
    url: 'https://api.example.com/balance',
    displayUnit: 'USD',
    total: 1000
  }
];