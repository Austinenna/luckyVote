#!/bin/bash

# 投票系统 Docker 部署脚本（带网络修复）
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

# 检查网络连接
echo "🌐 检查网络连接..."
if ! ping -c 1 8.8.8.8 &> /dev/null; then
    echo "❌ 网络连接异常，请检查网络设置"
    exit 1
fi

# 尝试拉取镜像
echo "📥 预拉取 Docker 镜像..."
if ! timeout 120 docker pull node:18-alpine; then
    echo "⚠️  镜像拉取失败，尝试使用国内镜像源..."
    
    # 配置镜像加速器
    echo "🔧 配置 Docker 镜像加速器..."
    sudo mkdir -p /etc/docker
    
    # 备份原配置
    if [ -f /etc/docker/daemon.json ]; then
        sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
    fi
    
    # 创建新配置
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
    
    # 重启 Docker
    echo "🔄 重启 Docker 服务..."
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    sleep 5
    
    # 再次尝试拉取
    echo "📥 重新尝试拉取镜像..."
    if ! timeout 120 docker pull node:18-alpine; then
        echo "❌ 镜像拉取仍然失败"
        echo "💡 建议手动执行: sudo ./fix-network.sh"
        exit 1
    fi
fi

echo "✅ 镜像准备完成"

# 停止现有容器（如果存在）
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动容器
echo "🔨 构建 Docker 镜像..."
if ! docker-compose build --no-cache; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo "🚀 启动容器..."
if ! docker-compose up -d; then
    echo "❌ 容器启动失败"
    docker-compose logs
    exit 1
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 检查服务是否正常运行
echo "🔍 检查服务健康状态..."
for i in {1..5}; do
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        echo "✅ 部署成功！"
        echo "🌐 访问地址: http://flashmemo.site/"
        echo "📊 本地测试: http://localhost:80"
        echo "📊 服务器IP测试: http://$(curl -s ifconfig.me):80"
        break
    else
        echo "⏳ 等待服务启动... ($i/5)"
        sleep 5
    fi
    
    if [ $i -eq 5 ]; then
        echo "❌ 服务启动失败，请检查日志:"
        docker-compose logs
        exit 1
    fi
done

echo "📝 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  更新部署: ./deploy-with-fix.sh"