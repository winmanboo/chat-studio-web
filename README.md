# Chat Studio Web

基于 Next.js 构建的智能对话平台，集成了环境感知的版本管理系统和自动更新通知功能。

## 功能特性

- 💬 **智能对话**: 支持多轮对话和上下文理解
- 📚 **知识库管理**: 文档上传和知识库构建
- 🔄 **环境感知版本管理**: 开发、测试、生产环境独立版本控制
- 📦 **pnpm 脚本集成**: 简化版本迭代和构建部署流程
- 🚀 **自动更新通知**: 基于 Service Worker 的版本检测和用户通知
- 💾 **离线支持**: 环境隔离的缓存策略

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 开发版本更新
pnpm version:dev

# 构建开发版本
pnpm release:dev
```

### 测试环境

```bash
# 生成测试版本
pnpm version:beta

# 构建测试版本
pnpm release:beta
```

### 生产环境

```bash
# 正式版本发布
pnpm version:minor  # 或 version:major

# 构建生产版本
pnpm release:prod
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 版本管理系统

项目集成了智能的环境感知版本管理系统：

### 可用脚本

```bash
# 版本管理
pnpm version:patch    # 补丁版本 (0.1.0 → 0.1.1)
pnpm version:minor    # 次要版本 (0.1.0 → 0.2.0)
pnpm version:major    # 主要版本 (0.1.0 → 1.0.0)
pnpm version:dev      # 开发版本 (0.1.0 → 0.1.1-dev.timestamp)
pnpm version:beta     # 测试版本 (0.1.0 → 0.1.1-beta.timestamp)

# 构建部署
pnpm release:dev      # 开发环境构建
pnpm release:beta     # 测试环境构建
pnpm release:prod     # 生产环境构建
```

### 环境隔离

- **开发环境**: 10秒版本检查，网络优先缓存，详细日志
- **测试环境**: 30秒版本检查，缓存优先策略，适中日志
- **生产环境**: 60秒版本检查，缓存优先策略，最小日志

## 项目结构

```
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
├── lib/                    # 工具库和 Hooks
├── config/                 # 配置文件
│   └── version.config.js   # 环境版本配置
├── scripts/                # 构建脚本
│   └── update-version.js   # 版本更新脚本
├── public/                 # 静态资源
│   ├── sw.js              # Service Worker
│   └── version.json       # 版本信息文件
└── docs/                   # 文档
    └── version-update-guide.md
```

## 文档

- [版本管理系统使用指南](./docs/version-update-guide.md) - 详细的版本管理和更新通知功能说明

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **包管理**: pnpm
- **版本管理**: 自定义环境感知系统
- **离线支持**: Service Worker

## 部署

推荐使用 [Vercel Platform](https://vercel.com/new) 部署，也可以部署到其他支持 Next.js 的平台。

详细部署说明请参考 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
