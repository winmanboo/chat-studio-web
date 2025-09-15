/**
 * 版本配置文件
 * 用于管理不同环境的版本设置
 * 根据 NODE_ENV 使用字面量定义配置
 */

// 加载 dotenv 以读取环境变量（仅用于其他配置）
require('dotenv').config();

// 环境配置定义（根据NODE_ENV使用字面量）
const environmentConfigs = {
  development: {
    name: 'development',
    displayName: '开发环境',
    versionPrefix: 'dev',
    checkInterval: 10000,
    disableServiceWorker: true  // 开发环境下禁用 Service Worker
  },
  production: {
    name: 'production',
    displayName: '生产环境',
    versionPrefix: '',
    checkInterval: 60000,
    disableServiceWorker: false  // 生产环境下启用 Service Worker
  }
};

/**
 * 获取当前环境配置
 * 根据 NODE_ENV 使用字面量定义，不依赖 env 文件中的 APP_ENV 等配置
 */
function getCurrentEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const config = environmentConfigs[nodeEnv] || environmentConfigs.development;
  
  return {
    name: config.name,
    displayName: config.displayName,
    versionPrefix: config.versionPrefix,
    checkInterval: parseInt(process.env.SW_VERSION_CHECK_INTERVAL) || config.checkInterval,
    disableServiceWorker: process.env.DISABLE_SERVICE_WORKER_IN_DEV === 'true' ? true : config.disableServiceWorker
  };
}

/**
 * 生成版本号
 * @param {string} type - 版本类型: major, minor, patch, dev, beta, rc
 * @param {string} currentVersion - 当前版本号
 * @returns {string} 新版本号
 */
function generateVersion(type, currentVersion = '0.1.0') {
  const env = getCurrentEnvironment();
  
  // 解析版本号，处理预发布版本
  const versionParts = currentVersion.split('-')[0]; // 去掉预发布后缀
  const [major, minor, patch] = versionParts.split('.').map(v => parseInt(v) || 0);
  
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').slice(0, 14);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'dev':
      return `${major}.${minor}.${patch + 1}-dev.${timestamp}`;
    case 'beta':
      return `${major}.${minor}.${patch + 1}-beta.${Math.floor(now.getTime() / 1000)}`;
    case 'rc':
      return `${major}.${minor}.${patch + 1}-rc.${Math.floor(now.getTime() / 1000)}`;
    default:
      throw new Error(`Unknown version type: ${type}`);
  }
}

/**
 * 获取版本显示名称
 * @param {string} version - 版本号
 * @returns {string} 显示名称
 */
function getVersionDisplayName(version) {
  const env = getCurrentEnvironment();
  
  if (version.includes('-dev')) {
    return `${version} (${env.displayName})`;
  } else if (version.includes('-beta')) {
    return `${version} (Beta)`;
  } else if (version.includes('-rc')) {
    return `${version} (Release Candidate)`;
  }
  
  return version;
}

/**
 * 判断是否为预发布版本
 * @param {string} version - 版本号
 * @returns {boolean}
 */
function isPrerelease(version) {
  return /-dev|-beta|-rc/.test(version);
}

module.exports = {
  getCurrentEnvironment,
  generateVersion,
  getVersionDisplayName,
  isPrerelease
};