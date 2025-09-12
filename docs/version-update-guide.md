# 版本管理系统使用指南

本项目实现了基于 pnpm 脚本的智能版本管理系统，支持开发、测试、生产环境的完整隔离，以及基于 Service Worker 的自动版本检测和更新通知功能。

## 功能特性

- 🔄 **环境感知版本管理**: 支持开发、测试、生产三种环境的独立版本控制
- 📦 **pnpm 脚本集成**: 通过简单的 pnpm 命令完成版本迭代和构建部署
- 🏷️ **智能版本生成**: 自动生成带时间戳的预发布版本号
- 📱 **友好的更新提醒**: 环境感知的更新通知，显示版本类型和环境信息
- 🚀 **多种更新方式**: 支持刷新当前页面或在新标签页打开
- 💾 **环境隔离缓存**: 不同环境使用独立的缓存策略
- 🎯 **无需后端参与**: 完全基于前端技术实现版本管理

## 技术架构

### 核心文件

- `package.json` - pnpm 版本管理脚本配置
- `config/version.config.js` - 环境配置文件，定义不同环境的版本策略
- `scripts/update-version.js` - 智能版本更新脚本，支持环境感知
- `public/version.json` - 版本配置文件，包含环境感知的版本信息
- `public/sw.js` - 环境感知的 Service Worker 脚本
- `components/VersionUpdateModal.tsx` - 版本更新通知弹窗组件
- `lib/hooks/useServiceWorker.ts` - 环境感知的 Service Worker 管理 Hook

### 工作流程

1. **环境检测**: 系统自动检测当前运行环境（开发/测试/生产）
2. **Service Worker 注册**: 应用启动时注册环境感知的 Service Worker
3. **环境隔离检查**: 根据环境配置设置不同的检查间隔（开发10秒，测试30秒，生产60秒）
4. **版本对比**: 比较本地版本与服务器版本，支持预发布版本识别
5. **环境感知通知**: 显示包含环境标识和版本类型的更新弹窗
6. **用户操作**: 用户可选择立即刷新或在新标签页打开

## 使用方法

### 1. 开发阶段版本管理

在开发过程中，使用以下命令进行版本迭代：

```bash
# 开发版本更新（生成带时间戳的开发版本）
pnpm version:dev

# 补丁版本更新（修复bug）
pnpm version:patch

# 构建开发版本
pnpm release:dev
```

### 2. 测试阶段版本管理

准备测试时，使用测试版本命令：

```bash
# 生成beta测试版本
pnpm version:beta

# 构建测试版本
pnpm release:beta
```

### 3. 生产发布版本管理

正式发布时，使用生产版本命令：

```bash
# 次要版本更新（新功能）
pnpm version:minor

# 主要版本更新（重大变更）
pnpm version:major

# 构建生产版本
pnpm release:prod
```

### 4. 自定义更新内容

编辑 `public/version.json` 文件，自定义功能列表。新版本支持环境感知格式：

```json
{
  "currentVersion": "0.2.0",
  "newVersion": "0.2.1",
  "environment": "development",
  "buildTime": "2024-01-15T10:00:00.000Z",
  "isPrerelease": false,
  "updateNotes": {
    "0.2.1": {
      "title": "重大功能更新",
      "description": "Chat Studio 0.2.1 版本带来了全新的用户体验",
      "environment": "development",
      "versionType": "patch",
      "isPrerelease": false,
      "features": [
        "✨ 新增用户注册和登录功能",
        "🔐 完善的权限管理系统",
        "📊 全新的数据统计面板",
        "🎨 优化了界面设计和交互体验",
        "🐛 修复了已知的若干问题"
      ],
      "releaseDate": "2024-01-15",
      "buildTime": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

### 5. 环境配置

系统会根据 `config/version.config.js` 中的环境配置自动处理不同环境的版本策略：

```javascript
// 开发环境：快速迭代，详细日志
development: {
  checkInterval: 10000,  // 10秒检查一次
  cacheStrategy: 'networkFirst',
  versionPrefix: 'dev'
},

// 测试环境：稳定测试，适中频率
testing: {
  checkInterval: 30000,  // 30秒检查一次
  cacheStrategy: 'cacheFirst',
  versionPrefix: 'beta'
},

// 生产环境：稳定运行，最小干扰
production: {
  checkInterval: 60000,  // 60秒检查一次
  cacheStrategy: 'cacheFirst',
  versionPrefix: ''
}
```

### 6. 用户体验

当用户访问应用时，会根据环境显示不同的更新体验：

1. **环境感知检测**: Service Worker 根据环境配置自动检测新版本
2. **环境标识提示**: 页面显示包含环境信息的更新提示，如 "[开发] DEV 版本更新可用"
3. **版本类型识别**: 自动识别并显示版本类型（PATCH、MINOR、MAJOR、DEV、BETA）
4. **预发布版本标识**: 预发布版本会特别标注，如 "0.1.2-dev.20250912T08064"
5. **详细弹窗**: 点击提示显示包含环境信息和版本类型的详细更新内容
6. **用户选择**: 用户可以选择立即刷新或稍后更新

## 配置选项

### 环境配置

在 `config/version.config.js` 中可以调整环境相关配置：

```javascript
const environments = {
  development: {
    name: '开发',
    checkInterval: 10000,        // 10秒检查间隔
    cacheStrategy: 'networkFirst', // 网络优先策略
    versionPrefix: 'dev',
    logLevel: 'verbose'          // 详细日志
  },
  testing: {
    name: '测试',
    checkInterval: 30000,        // 30秒检查间隔
    cacheStrategy: 'cacheFirst', // 缓存优先策略
    versionPrefix: 'beta',
    logLevel: 'normal'
  },
  production: {
    name: '生产',
    checkInterval: 60000,        // 60秒检查间隔
    cacheStrategy: 'cacheFirst', // 缓存优先策略
    versionPrefix: '',
    logLevel: 'minimal'          // 最小日志
  }
};
```

### Service Worker 环境感知配置

在 `public/sw.js` 中，系统会根据环境自动调整：

```javascript
// 环境感知的缓存名称
const CACHE_NAME = `chat-studio-${environment}-v${version}`;

// 环境感知的检查间隔
const VERSION_CHECK_INTERVAL = config.checkInterval;

// 环境感知的缓存策略
const CACHE_STRATEGY = config.cacheStrategy;
```

### 更新通知环境感知配置

在 `lib/hooks/useServiceWorker.ts` 中，通知会显示环境信息：

```typescript
// 环境感知的消息提示
const environmentText = data.updateNotes[data.newVersion]?.environment === 'development' ? '开发' : 
                       data.updateNotes[data.newVersion]?.environment === 'testing' ? '测试' : '生产';
const versionTypeText = data.updateNotes[data.newVersion]?.versionType?.toUpperCase() || 'RELEASE';

message.info({
  content: `[${environmentText}] ${versionTypeText} 版本更新可用 ${data.newVersion}`,
  duration: 5,
  key: 'version-update'
});
```

## 最佳实践

### 1. 环境隔离工作流程

推荐的开发到生产的完整工作流程：

```bash
# 开发阶段
pnpm version:dev      # 开发版本迭代
pnpm release:dev      # 构建开发版本

# 测试阶段
pnpm version:beta     # 生成测试版本
pnpm release:beta     # 构建测试版本

# 生产发布
pnpm version:minor    # 正式版本发布
pnpm release:prod     # 构建生产版本
```

### 2. 版本号规范

系统支持语义化版本控制 (Semantic Versioning) 和环境感知版本：

- `1.0.0` - 主版本号.次版本号.修订号
- `1.1.0` - 新增功能，向下兼容
- `1.0.1` - 问题修复，向下兼容
- `2.0.0` - 重大变更，可能不向下兼容
- `1.0.1-dev.20250912T08064` - 开发版本（带时间戳）
- `1.0.1-beta.1757664516` - 测试版本（带时间戳）

### 3. 环境配置最佳实践

- **开发环境**: 快速检查间隔（10秒），网络优先缓存，详细日志
- **测试环境**: 适中检查间隔（30秒），缓存优先策略，正常日志
- **生产环境**: 较长检查间隔（60秒），缓存优先策略，最小日志

### 4. 更新说明编写

- **标题**: 简洁明了，突出重点
- **描述**: 概括性介绍本次更新的主要内容
- **环境信息**: 明确标注环境和版本类型
- **功能列表**: 详细列出新功能、改进和修复
- **使用表情符号**: 让更新说明更加生动易读

### 5. 发布流程

1. 开发完成 → 使用 `pnpm version:dev` 进行开发版本迭代
2. 功能稳定 → 使用 `pnpm version:beta` 生成测试版本
3. 测试验证 → 使用 `pnpm release:beta` 构建测试版本
4. 生产发布 → 使用 `pnpm version:minor/major` 和 `pnpm release:prod`
5. 监控用户反馈 → 及时处理问题

### 6. 环境感知缓存策略

系统根据环境自动调整缓存策略：

- **开发环境**: 
  - 网络优先策略，确保获取最新代码
  - 版本文件总是从网络获取
  - 详细的缓存日志
- **测试环境**: 
  - 缓存优先策略，提高稳定性
  - 适中的缓存更新频率
- **生产环境**: 
  - 缓存优先策略，最佳性能
  - 最小的网络请求
  - 版本文件仍从网络获取以确保更新检测

## 故障排除

### 常见问题

**Q: pnpm 版本脚本执行失败？**
A: 确保已安装 pnpm，检查 `config/version.config.js` 和 `scripts/update-version.js` 文件是否存在。

**Q: 版本号生成出现 NaN？**
A: 检查当前版本号格式，确保预发布版本能正确解析。系统已修复此问题。

**Q: Service Worker 没有注册成功？**
A: 检查浏览器控制台是否有错误信息，确保在 HTTPS 环境下运行。

**Q: 环境检测不正确？**
A: 检查 `NODE_ENV` 环境变量设置，确保 `config/version.config.js` 中有对应的环境配置。

**Q: 版本检测不工作？**
A: 检查 `public/version.json` 文件是否可访问，确认环境配置中的检查间隔设置。

**Q: 更新弹窗没有显示环境信息？**
A: 检查 `version.json` 中的 `updateNotes` 是否包含 `environment` 和 `versionType` 字段。

**Q: 不同环境的缓存冲突？**
A: 系统使用环境感知的缓存名称，如 `chat-studio-development-v0.1.2`，自动隔离不同环境。

### 调试方法

1. **pnpm 脚本调试**: 使用 `pnpm version:dev --verbose` 查看详细执行过程
2. **环境变量检查**: 确认 `NODE_ENV` 和相关环境变量设置
3. **开发者工具**: 使用浏览器的 Application → Service Workers 面板
4. **控制台日志**: 查看环境感知的 Service Worker 日志输出
5. **网络面板**: 检查 `/version.json` 请求，确认环境信息正确
6. **版本文件检查**: 验证 `public/version.json` 中的环境字段
7. **手动测试**: 使用不同的 pnpm 脚本测试各环境版本生成

## 可用的 pnpm 脚本

```bash
# 版本管理脚本
pnpm version:patch    # 补丁版本更新
pnpm version:minor    # 次要版本更新  
pnpm version:major    # 主要版本更新
pnpm version:dev      # 开发版本更新
pnpm version:beta     # 测试版本更新

# 构建部署脚本
pnpm release:dev      # 开发环境构建
pnpm release:beta     # 测试环境构建
pnpm release:prod     # 生产环境构建
```

## 浏览器兼容性

- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ❌ IE (不支持 Service Worker)

对于不支持 Service Worker 的浏览器，功能会优雅降级，不影响正常使用。

## 安全考虑

- Service Worker 只在 HTTPS 环境下工作 (localhost 除外)
- 版本检查请求使用 `no-cache` 策略，防止缓存干扰
- 环境隔离确保不同环境的版本和缓存不会相互干扰
- 所有用户操作都需要明确确认，不会自动刷新页面

---

通过这套环境感知的版本管理系统，您可以在开发、测试、生产环境中独立管理版本迭代，使用简单的 pnpm 脚本完成整个版本生命周期，大大提升开发效率和用户体验。