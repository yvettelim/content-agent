# 内容工厂 Agent

一个基于 Next.js 的智能内容创作与发布管理平台，帮助用户进行选题分析、AI内容创作和多平台发布管理。

## 功能特性

### 🔍 选题分析
- 关键词搜索公众号文章
- AI 文章概要分析
- 生成综合洞察报告
- 点赞量TOP5、互动率TOP5分析
- 高频词云生成
- 选题洞察总结

### ✍️ 内容创作
- 基于选题洞察进行AI创作
- 自动插入Unsplash相关图片
- 支持多种写作风格和文章长度
- 可视化内容编辑器
- 图片管理和优化

### 📱 发布管理
- 多平台发布支持（小红书、公众号）
- 文章状态管理（草稿、待审核、已发布等）
- 批量操作功能
- 发布预览和适配
- 发布历史追踪

### ⚙️ 系统设置
- API密钥配置管理
- 系统参数自定义
- 历史记录管理
- 数据导出功能

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI框架**: Tailwind CSS
- **语言**: TypeScript
- **数据库**: SQLite (待实现)
- **状态管理**: React Hooks
- **组件库**: 自定义组件

## 项目结构

```
content-agent/
├── src/
│   ├── app/                    # Next.js App Router页面
│   │   ├── dashboard/          # 仪表盘
│   │   ├── analysis/           # 选题分析
│   │   ├── create/             # 内容创作
│   │   ├── publish/            # 发布管理
│   │   ├── settings/           # 设置页面
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页
│   ├── components/             # React组件
│   │   ├── common/             # 通用组件
│   │   ├── analysis/           # 分析相关组件
│   │   ├── creation/           # 创作相关组件
│   │   ├── publish/            # 发布相关组件
│   │   └── settings/           # 设置相关组件
│   ├── lib/                    # 工具函数
│   │   ├── db.ts              # 数据库连接
│   │   ├── api.ts             # API调用封装
│   │   └── utils.ts           # 通用工具
│   ├── types/                  # TypeScript类型定义
│   │   └── index.ts
│   └── app/                    # 全局样式
│       └── globals.css
├── public/                     # 静态资源
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 安装和运行

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 核心页面说明

### 仪表盘 (/)
- 数据统计概览
- 快速操作入口
- 最近分析记录
- 最近发布记录

### 选题分析 (/analysis)
- 搜索配置界面
- 分析状态监控
- 洞察报告展示
- 历史分析记录

### 内容创作 (/create)
- 选题来源选择
- 创作参数配置
- 文章生成和编辑
- 图片管理功能

### 发布管理 (/publish)
- 文章列表管理
- 状态筛选和搜索
- 批量操作
- 发布预览

### 设置 (/settings)
- API密钥配置
- 系统参数设置
- 历史记录管理

## 数据库设计

系统使用SQLite数据库，主要包含以下表：

- `topic_analyses` - 选题分析记录
- `articles` - 文章数据
- `topic_insights` - 选题洞察报告
- `contents` - 内容创作数据
- `publish_records` - 发布记录
- `system_config` - 系统配置

## API设计

### 选题分析相关
- `GET /api/analysis` - 获取分析列表
- `POST /api/analysis/start` - 开始新的分析
- `GET /api/analysis/:id` - 获取分析结果

### 内容创作相关
- `POST /api/content/generate` - AI生成文章
- `GET /api/content` - 获取内容列表
- `PUT /api/content/:id` - 更新内容

### 发布相关
- `POST /api/publish/:platform` - 发布到指定平台
- `GET /api/publish/records` - 获取发布记录

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。