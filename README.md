# Chat Studio Web

基于 Next.js 和 Ant Design 构建的现代化智能对话平台。

## 功能特性

- 💬 **智能对话**: 支持多轮对话、流式响应和上下文理解
- 🤖 **多模型支持**: 集成多种大语言模型，支持 Thinking 模式
- 📚 **知识库管理**: 支持文档上传、解析和基于知识库的问答
- � **MCP 集成**: 支持 Model Context Protocol (MCP) 服务器管理
- �️ **管理员控制台**: 提供用户管理和系统设置功能
- � **Markdown 渲染**: 基于 @ant-design/x-markdown 的高性能渲染，支持数学公式、代码高亮和 Mermaid 图表

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务
pnpm start
```

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── admin/             # 管理员控制台
│   ├── chat/              # 聊天界面
│   ├── documents/         # 文档管理
│   ├── knowledgebase/     # 知识库管理
│   └── mcp/               # MCP 服务器管理
├── components/             # React 组件
│   ├── chat/              # 聊天相关组件
│   └── ...
├── lib/                    # 工具库和 Hooks
│   ├── api/               # API 接口定义
│   └── utils/             # 通用工具函数
└── styles/                 # 全局样式
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI 组件库**: Ant Design 6.0
- **AI 组件库**: Ant Design X 2.1
- **语言**: TypeScript
- **包管理**: pnpm

## 部署

推荐使用 [Vercel Platform](https://vercel.com/new) 部署，也可以部署到其他支持 Next.js 的平台。

详细部署说明请参考 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
