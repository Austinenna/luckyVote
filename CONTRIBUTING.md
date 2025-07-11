# 贡献指南

感谢您对红包局投票软件的关注！我们欢迎任何形式的贡献。

## 🚀 快速开始

### 环境准备

1. 确保安装了 Node.js 14.0 或更高版本
2. Fork 这个仓库
3. 克隆您的 fork 到本地

```bash
git clone https://github.com/YOUR_USERNAME/luckyVote.git
cd luckyVote
```

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client && npm install
```

### 启动开发服务器

```bash
# 回到根目录
cd ..

# 同时启动前后端
npm run dev
```

## 📝 贡献类型

### Bug 报告

如果您发现了 bug，请创建一个 issue 并包含以下信息：

- 详细的问题描述
- 重现步骤
- 预期行为
- 实际行为
- 环境信息（操作系统、浏览器版本等）
- 截图（如果适用）

### 功能请求

如果您有新功能的想法：

- 创建一个 issue 描述您的想法
- 解释为什么这个功能有用
- 提供可能的实现方案

### 代码贡献

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码可以正常运行

3. **测试**
   ```bash
   # 启动开发服务器测试
   npm run dev
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

5. **推送到您的 fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 提供清晰的 PR 标题和描述
   - 解释您的更改
   - 链接相关的 issue

## 📋 代码规范

### JavaScript/React

- 使用 ES6+ 语法
- 组件使用函数式组件和 Hooks
- 保持组件小而专注
- 使用有意义的变量和函数名

### CSS/Tailwind

- 优先使用 Tailwind CSS 类
- 自定义样式放在 `index.css` 中
- 保持响应式设计

### 提交信息

使用约定式提交格式：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 🔍 代码审查

所有的 Pull Request 都会经过代码审查：

- 确保代码质量
- 检查是否符合项目目标
- 验证功能是否正常工作
- 确保没有破坏现有功能

## 📞 联系方式

如果您有任何问题，可以：

- 创建 issue 进行讨论
- 在 Pull Request 中留言

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

再次感谢您的贡献！每一个贡献都让这个项目变得更好。