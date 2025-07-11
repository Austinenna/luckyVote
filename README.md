# 🧧 红包局投票软件

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

一个轻量级的匿名投票系统，专为游戏红包局设计，支持网页和手机端使用。

## ✨ 功能特点

- 🎯 **匿名投票** - 保护投票者隐私
- 📱 **响应式设计** - 完美支持手机和电脑
- ⚡ **实时更新** - 投票进度实时显示
- 💾 **数据持久化** - 设置和投票数据自动保存
- 🎨 **现代UI** - 使用Tailwind CSS，界面美观
- 🔧 **灵活配置** - 可自定义人数和选项

## 🚀 快速开始

### 环境要求

- Node.js 14.0 或更高版本
- npm 或 yarn

### 安装步骤

1. **安装后端依赖**
```bash
npm install
```

2. **安装前端依赖**
```bash
npm run install-client
```

3. **启动开发服务器（前后端同时启动）**
```bash
npm run dev
```

此命令会同时启动：
- 后端服务器（Express.js）- 端口 3001
- 前端开发服务器（React）- 端口 3000

4. **访问应用**
   - 打开浏览器访问 `http://localhost:3000`
   - 手机端可通过局域网IP访问

### 生产环境部署

1. **构建前端**
```bash
npm run build
```

2. **启动生产服务器（集成前后端）**
```bash
npm start
```

生产环境下，Express 后端服务器会：
- 提供 API 接口服务
- 托管前端构建后的静态文件
- 统一在端口 3001 提供完整应用

3. **使用重新部署脚本**

项目提供了自动化重新部署脚本，可在代码更新后快速部署：
```bash
# 给脚本添加执行权限
chmod +x scripts/redeploy.sh

# 在项目根目录执行
./scripts/redeploy.sh
```

该脚本会自动拉取最新代码、更新依赖、重新构建并重启应用。

## 📖 使用说明

### 基本流程

1. **设置投票** - 在"设置"页面配置参与人数和投票选项
2. **开始投票** - 参与者在"投票"页面选择选项并提交
3. **查看结果** - 所有人投票完成后自动显示结果

### 主要功能

#### 投票设置
- 设置参与人数（1-20人）
- 自定义投票选项（至少2个）
- 修改设置会自动重置投票状态

#### 投票过程
- 匿名投票，只需输入标识符
- 实时显示投票进度
- 防止重复投票

#### 结果展示
- 直观的图表显示
- 获胜者高亮显示
- 支持平局情况
- 详细统计信息

## 🛠️ 技术栈

本项目是一个**全栈应用**，包含前端和后端两部分：

### 前端
- **React 18** - 用户界面框架
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP客户端

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web框架
- **fs-extra** - 文件系统操作

### 架构说明
- **开发环境**：前后端分离，前端运行在3000端口，后端运行在3001端口
- **生产环境**：后端服务器托管前端静态文件，统一在3001端口提供服务

## 📁 项目结构

```
luckyVote/
├── client/                 # React前端
│   ├── public/
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── App.js         # 主应用组件
│   │   └── index.js       # 入口文件
│   └── package.json
├── server.js              # Express后端服务器
├── package.json           # 后端依赖
├── vote-data.json         # 投票数据存储（自动生成）
└── README.md
```

## 🔧 配置说明

### 默认配置
- 默认人数：5人
- 默认选项：选项1、选项2
- 后端服务器端口：3001
- 前端开发端口：3000（仅开发环境）

### 数据存储
- 投票数据存储在 `vote-data.json` 文件中
- 包含设置、投票记录和结果
- 支持自动备份和恢复

## 📱 移动端优化

- 响应式布局，适配各种屏幕尺寸
- 触摸友好的交互设计
- 优化的字体大小和按钮尺寸
- 支持横屏和竖屏模式

## 🔒 隐私保护

- 匿名投票，不记录个人信息
- 投票标识符仅用于防重复投票
- 数据仅存储在本地服务器
- 不涉及任何第三方服务

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！请查看 [CONTRIBUTING.md](docs/CONTRIBUTING.md) 了解详细的贡献指南。

### 快速贡献

1. Fork 这个仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个 ⭐！

## 🔗 相关链接

- [问题反馈](../../issues)
- [功能请求](../../issues/new?template=feature_request.md)
- [贡献指南](docs/CONTRIBUTING.md)

## 🆘 常见问题

**Q: 如何重置投票？**
A: 在投票页面或结果页面点击"重置投票"按钮。

**Q: 可以修改已提交的投票吗？**
A: 不可以，为保证公平性，投票一旦提交无法修改。

**Q: 支持多少人同时投票？**
A: 理论上支持任意数量，建议不超过20人以保证最佳体验。

**Q: 数据会丢失吗？**
A: 数据存储在本地文件中，除非手动删除否则不会丢失。