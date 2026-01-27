// 自動從 package.json 讀取版本號
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// 版本資訊物件
export const versionInfo = {
  version: APP_VERSION,
  name: APP_NAME,
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  environment: import.meta.env.MODE,
};

export default versionInfo;
