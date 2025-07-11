#!/bin/bash

# 投票系统 Docker 部署脚本
# 域名: http://flashmemo.site/

echo "🚀 开始部署投票系统到 flashmemo.site..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p ./data

# 停止现有容器（如果存在）
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动容器
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

echo "🚀 启动容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 检查服务是否正常运行
echo "🔍 检查服务健康状态..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: http://flashmemo.site/"
    echo "📊 本地测试: http://localhost:80"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
fi

echo "📝 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  更新部署: ./deploy.sh"