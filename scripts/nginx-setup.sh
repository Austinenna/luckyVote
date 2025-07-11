#!/bin/bash

# Nginx 配置脚本 - 将域名代理到 Node.js 应用
# 适用于已部署的 Node.js 应用

echo "🔧 配置 Nginx 反向代理..."

# 1. 停止当前的 PM2 应用（如果在80端口运行）
echo "🛑 停止 PM2 应用..."
pm2 stop lucky-vote 2>/dev/null || true
pm2 delete lucky-vote 2>/dev/null || true

# 2. 修改应用端口为 3001
echo "⚙️  配置应用端口..."
cd /root/luckyVote

# 更新环境变量
echo "PORT=3001" > .env
echo "NODE_ENV=production" >> .env
echo "DATA_FILE_PATH=/root/luckyVote/vote-data.json" >> .env
echo "CORS_ORIGIN=http://flashmemo.site,https://flashmemo.site" >> .env

# 3. 重新启动应用在3001端口
echo "🚀 启动应用在3001端口..."
pm2 start server.js --name "lucky-vote"
pm2 save

# 4. 创建 Nginx 站点配置
echo "📝 创建 Nginx 配置..."
sudo tee /etc/nginx/sites-available/flashmemo.site > /dev/null <<EOF
server {
    listen 80;
    server_name flashmemo.site www.flashmemo.site;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 代理到 Node.js 应用
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 5. 启用站点
echo "🔗 启用 Nginx 站点..."
sudo ln -sf /etc/nginx/sites-available/flashmemo.site /etc/nginx/sites-enabled/

# 6. 删除默认站点（可选）
echo "🗑️  移除默认站点..."
sudo rm -f /etc/nginx/sites-enabled/default

# 7. 测试 Nginx 配置
echo "🧪 测试 Nginx 配置..."
if sudo nginx -t; then
    echo "✅ Nginx 配置测试通过"
else
    echo "❌ Nginx 配置有误，请检查"
    exit 1
fi

# 8. 重新加载 Nginx
echo "🔄 重新加载 Nginx..."
sudo systemctl reload nginx

# 9. 检查服务状态
echo "📊 检查服务状态..."
echo "PM2 状态:"
pm2 status

echo "\nNginx 状态:"
sudo systemctl status nginx --no-pager -l

# 10. 测试应用
echo "\n🔍 测试应用访问..."
sleep 3

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Node.js 应用运行正常 (端口 3001)"
else
    echo "❌ Node.js 应用访问失败"
    echo "请检查 PM2 日志: pm2 logs lucky-vote"
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Nginx 代理工作正常 (端口 80)"
    echo "🌐 访问地址: http://flashmemo.site/"
else
    echo "❌ Nginx 代理访问失败"
    echo "请检查 Nginx 日志: sudo tail -f /var/log/nginx/error.log"
fi

echo "\n📝 常用命令:"
echo "  查看 PM2 状态: pm2 status"
echo "  查看 PM2 日志: pm2 logs lucky-vote"
echo "  重启应用: pm2 restart lucky-vote"
echo "  查看 Nginx 状态: sudo systemctl status nginx"
echo "  重新加载 Nginx: sudo systemctl reload nginx"
echo "  查看 Nginx 日志: sudo tail -f /var/log/nginx/access.log"