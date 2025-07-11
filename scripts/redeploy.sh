#!/bin/bash

# 重新部署脚本 - 用于代码修改后的快速部署
# 使用方法: ./scripts/redeploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始重新部署 luckyVote 应用..."
echo "==========================================="

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "当前目录: $(pwd)"
    echo "正确用法: ./scripts/redeploy.sh"
    exit 1
fi

# 1. 备份当前版本信息
echo "📝 记录当前版本信息..."
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
echo "当前提交: $CURRENT_COMMIT"

# 2. 拉取最新代码
echo "📥 拉取最新代码..."
if git pull; then
    echo "✅ 代码拉取成功"
else
    echo "❌ 代码拉取失败，请检查网络连接或解决冲突"
    exit 1
fi

# 检查是否有新的提交
NEW_COMMIT=$(git rev-parse HEAD)
if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo "ℹ️  没有新的代码更新"
else
    echo "🆕 发现新的提交: $NEW_COMMIT"
fi

# 3. 检查依赖是否需要更新
echo "🔍 检查依赖更新..."
if git diff --name-only $CURRENT_COMMIT $NEW_COMMIT | grep -q "package.*\.json"; then
    echo "📦 发现依赖文件变化，更新依赖..."
    
    # 更新后端依赖
    echo "  - 更新后端依赖"
    npm install
    
    # 更新前端依赖
    echo "  - 更新前端依赖"
    cd client && npm install && cd ..
    
    DEPS_UPDATED=true
else
    echo "✅ 依赖文件无变化，跳过依赖更新"
    DEPS_UPDATED=false
fi

# 4. 检查前端代码是否需要重新构建
echo "🔍 检查前端代码变化..."
if git diff --name-only $CURRENT_COMMIT $NEW_COMMIT | grep -q "client/" || [ "$DEPS_UPDATED" = true ]; then
    echo "🏗️  重新构建前端..."
    npm run build
    echo "✅ 前端构建完成"
    FRONTEND_BUILT=true
else
    echo "✅ 前端代码无变化，跳过构建"
    FRONTEND_BUILT=false
fi

# 5. 重启应用
echo "🔄 重启应用..."
if pm2 restart lucky-vote; then
    echo "✅ 应用重启成功"
else
    echo "❌ 应用重启失败，尝试重新启动..."
    pm2 stop lucky-vote 2>/dev/null || true
    pm2 start server.js --name "lucky-vote"
fi

# 6. 等待应用启动
echo "⏳ 等待应用启动..."
sleep 3

# 7. 健康检查
echo "🔍 执行健康检查..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ 应用运行正常"
else
    echo "⚠️  应用可能未正常启动，请检查日志"
    echo "查看日志命令: pm2 logs lucky-vote"
fi

# 8. 显示部署摘要
echo ""
echo "📊 部署摘要"
echo "==========================================="
echo "提交变化: $CURRENT_COMMIT -> $NEW_COMMIT"
echo "依赖更新: $([ "$DEPS_UPDATED" = true ] && echo "是" || echo "否")"
echo "前端构建: $([ "$FRONTEND_BUILT" = true ] && echo "是" || echo "否")"
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 9. 显示常用命令
echo "📝 常用管理命令:"
echo "  查看应用状态: pm2 status"
echo "  查看应用日志: pm2 logs lucky-vote"
echo "  重启应用: pm2 restart lucky-vote"
echo "  查看实时日志: pm2 logs lucky-vote --lines 0 -f"
echo ""

# 10. 显示访问地址
echo "🌐 访问地址:"
echo "  本地访问: http://localhost:3001"
echo "  生产访问: http://flashmemo.site (如已配置域名)"
echo ""

echo "🎉 重新部署完成！"
echo "==========================================="