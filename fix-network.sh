#!/bin/bash

# Docker 网络问题修复脚本
# 解决镜像拉取超时问题

echo "🔧 修复 Docker 网络问题..."

# 方案1: 配置国内镜像源
echo "📦 配置 Docker 镜像源..."
sudo mkdir -p /etc/docker

# 创建 Docker daemon 配置文件
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ],
  "dns": ["8.8.8.8", "114.114.114.114"],
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5,
  "storage-driver": "overlay2"
}
EOF

echo "🔄 重启 Docker 服务..."
sudo systemctl daemon-reload
sudo systemctl restart docker

# 等待 Docker 服务启动
echo "⏳ 等待 Docker 服务启动..."
sleep 5

# 验证 Docker 服务状态
if sudo systemctl is-active --quiet docker; then
    echo "✅ Docker 服务已重启"
else
    echo "❌ Docker 服务重启失败"
    exit 1
fi

# 方案2: 预拉取镜像
echo "📥 预拉取 Node.js 镜像..."
echo "尝试从不同镜像源拉取..."

# 尝试多个镜像源
MIRRORS=(
    "docker.io/library/node:18-alpine"
    "docker.mirrors.ustc.edu.cn/library/node:18-alpine"
    "hub-mirror.c.163.com/library/node:18-alpine"
)

for mirror in "${MIRRORS[@]}"; do
    echo "🔄 尝试从 $mirror 拉取镜像..."
    if timeout 300 docker pull "$mirror"; then
        echo "✅ 成功从 $mirror 拉取镜像"
        # 如果不是官方镜像，重新标记为官方镜像名
        if [[ "$mirror" != "docker.io/library/node:18-alpine" ]]; then
            docker tag "$mirror" "node:18-alpine"
            echo "🏷️  已重新标记为 node:18-alpine"
        fi
        break
    else
        echo "❌ 从 $mirror 拉取失败，尝试下一个..."
    fi
done

# 验证镜像是否存在
if docker images | grep -q "node.*18-alpine"; then
    echo "✅ Node.js 18-alpine 镜像准备就绪"
    echo "🚀 现在可以运行部署脚本了: ./deploy.sh"
else
    echo "❌ 所有镜像源都失败了"
    echo "💡 建议:"
    echo "   1. 检查网络连接"
    echo "   2. 配置代理服务器"
    echo "   3. 联系网络管理员"
    echo "   4. 使用离线镜像包"
fi

echo "📝 如果问题仍然存在，请尝试:"
echo "   sudo ./fix-network.sh"
echo "   然后再运行: ./deploy.sh"