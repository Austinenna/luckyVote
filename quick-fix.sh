#!/bin/bash

# 快速修复脚本 - 解决端口冲突问题

echo "🚀 快速修复 Nginx 端口冲突..."

# 检查当前状态
echo "📊 当前端口占用情况:"
sudo lsof -i :80 | head -5
echo ""

# 方案选择
echo "请选择解决方案:"
echo "1. 配置 Nginx 反向代理（推荐）"
echo "2. 停止 Nginx，直接使用 Node.js"
echo "3. 更改 Node.js 端口到 8080"
read -p "请输入选择 (1/2/3): " choice

case $choice in
    1)
        echo "🔧 配置 Nginx 反向代理..."
        
        # 停止 PM2 应用
        pm2 stop lucky-vote 2>/dev/null || true
        
        # 修改端口到 3001
        cd /root/luckyVote
        echo "PORT=3001" > .env
        echo "NODE_ENV=production" >> .env
        
        # 重启应用
        pm2 start server.js --name "lucky-vote"
        
        # 创建 Nginx 配置
        sudo tee /etc/nginx/sites-available/flashmemo.site > /dev/null <<EOF
server {
    listen 80;
    server_name flashmemo.site www.flashmemo.site;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
        
        # 启用配置
        sudo ln -sf /etc/nginx/sites-available/flashmemo.site /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
        
        echo "✅ 配置完成！访问: http://flashmemo.site/"
        ;;
        
    2)
        echo "🛑 停止 Nginx 服务..."
        sudo systemctl stop nginx
        sudo systemctl disable nginx
        
        # 重启应用在80端口
        pm2 stop lucky-vote 2>/dev/null || true
        cd /root/luckyVote
        echo "PORT=80" > .env
        echo "NODE_ENV=production" >> .env
        pm2 start server.js --name "lucky-vote"
        
        echo "✅ Node.js 应用现在运行在80端口"
        ;;
        
    3)
        echo "🔄 更改应用端口到 8080..."
        pm2 stop lucky-vote 2>/dev/null || true
        cd /root/luckyVote
        echo "PORT=8080" > .env
        echo "NODE_ENV=production" >> .env
        pm2 start server.js --name "lucky-vote"
        
        echo "✅ 应用现在运行在8080端口"
        echo "🌐 访问地址: http://flashmemo.site:8080/"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 检查最终状态
echo "\n📊 最终状态:"
echo "PM2 状态:"
pm2 status

echo "\n端口占用:"
sudo lsof -i :80 | head -3
sudo lsof -i :3001 | head -3
sudo lsof -i :8080 | head -3

echo "\n🔍 测试访问:"
if [ "$choice" = "1" ] || [ "$choice" = "2" ]; then
    curl -I http://localhost:80 2>/dev/null | head -1
elif [ "$choice" = "3" ]; then
    curl -I http://localhost:8080 2>/dev/null | head -1
fi