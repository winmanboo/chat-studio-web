/**
 * Service Worker 配置注入脚本
 * 在构建时将统一配置注入到 Service Worker 中
 * 现在从 .env 文件读取配置
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { getCurrentEnvironment } = require('../config/version.config.js');

/**
 * 注入配置到 Service Worker
 */
function injectConfigToServiceWorker() {
  const swPath = path.join(__dirname, '../public/sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ Service Worker 文件不存在:', swPath);
    return;
  }
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // 从当前环境和 .env 文件获取配置
  const currentEnv = getCurrentEnvironment();
  
  // 构建配置对象（从 .env 文件或默认值）
  const configObject = {
    development: process.env.NODE_ENV === 'development' ? currentEnv.checkInterval : 10000,
    production: process.env.NODE_ENV === 'production' ? currentEnv.checkInterval : 60000
  };
  
  // 如果有具体的环境变量配置，使用它们
  if (process.env.SW_VERSION_CHECK_INTERVAL) {
    const interval = parseInt(process.env.SW_VERSION_CHECK_INTERVAL);
    if (process.env.APP_ENV === 'development') configObject.development = interval;
    else if (process.env.APP_ENV === 'production') configObject.production = interval;
  }
  
  // 替换配置部分
  const configPattern = /const VERSION_CHECK_INTERVALS = \{[\s\S]*?\};/;
  const newConfig = `const VERSION_CHECK_INTERVALS = {
  development: ${configObject.development},  // 开发环境：${configObject.development / 1000}秒
  production: ${configObject.production}    // 生产环境：${configObject.production / 1000}秒（与 version.config.js 保持一致）
};`;
  
  if (configPattern.test(swContent)) {
    swContent = swContent.replace(configPattern, newConfig);
    
    // 写回文件
    fs.writeFileSync(swPath, swContent, 'utf8');
    
    console.log('✅ Service Worker 配置已更新:');
  console.log(`   - 开发环境: ${configObject.development}ms (${configObject.development / 1000}秒)`);
  console.log(`   - 生产环境: ${configObject.production}ms (${configObject.production / 1000}秒)`);
  } else {
    console.warn('⚠️  未找到配置模式，跳过配置注入');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🔧 开始注入 Service Worker 配置...');
  injectConfigToServiceWorker();
  console.log('🎉 配置注入完成!');
}

module.exports = {
  injectConfigToServiceWorker
};