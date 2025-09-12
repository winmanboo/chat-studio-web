#!/usr/bin/env node

/**
 * 版本更新脚本 - 支持环境隔离
 * 用于更新 package.json 和 public/version.json 中的版本信息
 * 
 * 使用方法:
 * node scripts/update-version.js <version-type> [update-title] [update-description] [features] [optimizations] [bugfixes]
 * 
 * 版本类型:
 * - major: 主版本号 (1.0.0 -> 2.0.0)
 * - minor: 次版本号 (1.0.0 -> 1.1.0)
 * - patch: 修订版本号 (1.0.0 -> 1.0.1)
 * - dev: 开发版本 (1.0.0 -> 1.0.1-dev.20240115101530)
 * - beta: 测试版本 (1.0.0 -> 1.0.1-beta.1705312345)
 * - rc: 候选版本 (1.0.0 -> 1.0.1-rc.1705312345)
 * 
 * 参数说明:
 * - features: 新功能列表，用逗号分隔，如 "用户管理,权限系统,数据导出"
 * - optimizations: 优化内容列表，用逗号分隔，如 "页面加载速度提升,内存使用优化"
 * - bugfixes: 修复的bug列表，用逗号分隔，如 "修复登录问题,解决数据同步错误"
 * 
 * 示例:
 * pnpm version:patch
 * pnpm version:dev
 * node scripts/update-version.js patch "重大功能更新" "新增了用户管理和权限系统" "用户管理,权限系统" "性能优化,UI改进" "修复登录bug,解决数据问题"
 */

const fs = require('fs');
const path = require('path');
const { generateVersion, getCurrentEnvironment, getVersionDisplayName, isPrerelease } = require('../config/version.config.js');
const { injectConfigToServiceWorker } = require('./inject-sw-config.js');

// 获取命令行参数
const args = process.argv.slice(2);
const versionType = args[0];
const updateTitle = args[1];
const updateDescription = args[2];
const featuresStr = args[3];
const optimizationsStr = args[4];
const bugfixesStr = args[5];

// 解析列表参数
const parseList = (str) => str ? str.split(',').map(item => item.trim()).filter(item => item) : [];
const customFeatures = parseList(featuresStr);
const customOptimizations = parseList(optimizationsStr);
const customBugfixes = parseList(bugfixesStr);

// 获取当前环境配置
const env = getCurrentEnvironment();

if (!versionType) {
  console.error('❌ 错误: 请提供版本类型');
  console.log('使用方法: node scripts/update-version.js <version-type> [update-title] [update-description] [features] [optimizations] [bugfixes]');
  console.log('版本类型: major, minor, patch, dev, beta, rc');
  console.log('参数说明:');
  console.log('  - features: 新功能列表，用逗号分隔');
  console.log('  - optimizations: 优化内容列表，用逗号分隔');
  console.log('  - bugfixes: 修复的bug列表，用逗号分隔');
  console.log('示例: node scripts/update-version.js patch "重大功能更新" "新增了用户管理和权限系统" "用户管理,权限系统" "性能优化,UI改进" "修复登录bug,解决数据问题"');
  console.log('或使用 pnpm 脚本: pnpm version:patch, pnpm version:dev');
  process.exit(1);
}

// 验证版本类型
const validTypes = ['major', 'minor', 'patch', 'dev', 'beta', 'rc'];
if (!validTypes.includes(versionType)) {
  console.error(`❌ 错误: 无效的版本类型 "${versionType}"`);
  console.log(`支持的版本类型: ${validTypes.join(', ')}`);
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const versionJsonPath = path.join(rootDir, 'public', 'version.json');
const swPath = path.join(rootDir, 'public', 'sw.js');

// 读取当前版本
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// 生成新版本号
const newVersion = generateVersion(versionType, currentVersion);
const versionDisplayName = getVersionDisplayName(newVersion);

// 生成默认的更新信息
const defaultTitle = "版本更新";
const defaultDescription = `Chat Studio ${newVersion} 版本更新`;

const finalTitle = updateTitle || defaultTitle;
const finalDescription = updateDescription || defaultDescription;

console.log('🚀 开始更新版本信息...');
console.log(`🌍 当前环境: ${env.displayName} (${env.name})`);
console.log(`📦 版本类型: ${versionType}`);
console.log(`📦 当前版本: ${currentVersion}`);
console.log(`📦 新版本: ${newVersion}`);
console.log(`📝 更新标题: ${finalTitle}`);
console.log(`📄 更新描述: ${finalDescription}`);
console.log('');

try {
  // 1. 更新 package.json
  console.log('📦 更新 package.json...');
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`   ✅ package.json 版本已从 ${currentVersion} 更新到 ${newVersion}`);

  // 2. 更新 public/version.json
  console.log('📄 更新 version.json...');
  let versionData;
  
  if (fs.existsSync(versionJsonPath)) {
    versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
  } else {
    versionData = {
      version: newVersion,
      buildTime: new Date().toISOString(),
      updateNotes: {}
    };
  }

  // 更新版本信息
  versionData.version = newVersion;
  versionData.buildTime = new Date().toISOString();

  // 添加新版本的更新说明
  const defaultFeatures = [
    '✨ 新功能和改进',
    '🚀 性能优化和问题修复',
    '🎯 用户体验提升'
  ];

  const defaultOptimizations = [
    '⚡ 系统性能优化',
    '💾 资源使用优化',
    '🔄 用户体验提升'
  ];

  const defaultBugfixes = [
    '🐛 修复已知问题',
    '🔧 解决系统稳定性问题',
    '🛠️ 改进异常处理'
  ];

  // 使用自定义内容或默认内容
  const finalFeatures = customFeatures.length > 0 ? customFeatures.map(f => `✨ ${f}`) : defaultFeatures;
  const finalOptimizations = customOptimizations.length > 0 ? customOptimizations.map(o => `⚡ ${o}`) : defaultOptimizations;
  const finalBugfixes = customBugfixes.length > 0 ? customBugfixes.map(b => `🐛 ${b}`) : defaultBugfixes;

  versionData.updateNotes[newVersion] = {
    title: finalTitle,
    description: finalDescription,
    environment: env.name,
    versionType: versionType,
    isPrerelease: isPrerelease(newVersion),
    features: finalFeatures,
    optimizations: finalOptimizations,
    bugfixes: finalBugfixes,
    releaseDate: new Date().toISOString().split('T')[0],
    buildTime: new Date().toISOString()
  };

  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n');
  console.log(`   ✅ version.json 已更新`);

  // 3. 更新 Service Worker 中的缓存名称
  console.log('🔧 更新 Service Worker 缓存名称...');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // 生成环境感知的缓存名称
    const cachePrefix = env.name === 'production' ? 'chat-studio' : `chat-studio-${env.name}`;
    const newCacheName = `${cachePrefix}-v${newVersion}`;
    
    // 更新缓存名称
    swContent = swContent.replace(
      /const CACHE_NAME = ['"'][^'"]*['"']/,
      `const CACHE_NAME = '${newCacheName}'`
    );
    
    // 更新环境配置
    swContent = swContent.replace(
      /const ENVIRONMENT = ['"'][^'"]*['"']/,
      `const ENVIRONMENT = '${env.name}'`
    );
    
    fs.writeFileSync(swPath, swContent);
    console.log(`   ✅ Service Worker 缓存名称已更新为: ${newCacheName}`);
    console.log(`   ✅ Service Worker 环境已设置为: ${env.name}`);
    
    // 注入统一配置到 Service Worker
    console.log('⚙️  同步 Service Worker 配置...');
    injectConfigToServiceWorker();
  } else {
    console.log('   ⚠️  警告: 未找到 Service Worker 文件');
  }

  console.log('');
  console.log('🎉 版本更新完成!');
  console.log(`\n📋 当前环境: ${env.displayName} (${env.name})`);
  console.log(`📦 版本信息: ${currentVersion} → ${newVersion}`);
  console.log(`🏷️  版本类型: ${versionType}`);
  console.log(`🔖 版本标识: ${versionDisplayName}`);
  
  console.log('\n📋 接下来的步骤:');
  if (env.name === 'development') {
    console.log('1. 🔍 在开发环境中测试新功能');
    console.log('2. 🚀 使用 pnpm release:dev 构建开发版本');
    console.log('3. 📱 准备就绪后使用 pnpm version:beta 发布测试版');
  } else if (env.name === 'staging') {
    console.log('1. 🔍 在预发布环境中全面测试');
    console.log('2. 🚀 使用 pnpm release:beta 构建测试版本');
    console.log('3. 📱 测试通过后使用 pnpm version:minor 发布正式版');
  } else {
    console.log('1. 🔍 检查生产环境配置');
    console.log('2. 🚀 使用 pnpm release:prod 构建生产版本');
    console.log('3. 📱 用户访问时会自动收到更新提醒');
  }
  
  console.log('\n💡 常用 pnpm 脚本:');
  console.log('   pnpm version:patch  - 补丁版本更新');
  console.log('   pnpm version:minor  - 次要版本更新');
  console.log('   pnpm version:dev    - 开发版本更新');
  console.log('   pnpm version:beta   - 测试版本更新');
  console.log('\n💡 提示: 可以通过编辑 public/version.json 来自定义更新内容');

} catch (error) {
  console.error('❌ 更新版本时发生错误:', error.message);
  process.exit(1);
}