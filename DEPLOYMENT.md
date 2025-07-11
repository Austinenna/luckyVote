# 投票系统手动部署指南

## 部署到 flashmemo.site

### 前置要求

1. **服务器准备**
   - 一台 Linux 服务器（推荐 Ubuntu 20.04+）
   - 域名 `flashmemo.site` 已解析到服务器 IP
   - 服务器开放 80 和 443 端口

### 手动部署步骤

#### 1. 连接服务器
```bash
ssh root@your-server-ip
```

#### 2. 安装 Node.js 和 npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. 安装 PM2（进程管理器）
```bash
npm install -g pm2
```

#### 4. 克隆项目
```bash
git clone https://github.com/your-username/luckyVote.git
cd luckyVote
```

#### 5. 安装依赖
```bash
npm install
npm run install-client
```

#### 6. 构建前端
```bash
npm run build
```

#### 7. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置生产环境端口
echo "PORT=3001" >> .env
echo "NODE_ENV=production" >> .env
```

#### 8. 启动应用
```bash
pm2 start server.js --name "lucky-vote"
```

#### 9. 设置开机自启
```bash
pm2 startup
pm2 save
```

### 配置 Nginx 反向代理

#### 1. 安装 Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 2. 创建 Nginx 配置文件
```bash
sudo nano /etc/nginx/sites-available/flashmemo.site
```

配置内容：
```nginx
server {
    listen 80;
    server_name flashmemo.site www.flashmemo.site;
    
    # 静态文件缓存
    location /static/ {
        alias /root/luckyVote/client/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 主应用代理
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

#### 3. 启用站点配置
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/flashmemo.site /etc/nginx/sites-enabled/

# 移除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 常用管理命令

#### PM2 进程管理
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs lucky-vote

# 重启应用
pm2 restart lucky-vote

# 停止应用
pm2 stop lucky-vote

# 删除应用
pm2 delete lucky-vote
```

#### Nginx 管理
```bash
# 检查配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

### 故障排除

#### 1. 检查端口占用
```bash
sudo lsof -i :80
sudo lsof -i :3001
```

#### 2. 检查应用日志
```bash
pm2 logs lucky-vote --lines 50
```

#### 3. 检查 Nginx 日志
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### 4. 重新部署
```bash
cd /root/luckyVote
git pull
npm install
npm run install-client
npm run build
pm2 restart lucky-vote
```

### 安全配置

#### 1. 配置 HTTPS（推荐）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d flashmemo.site -d www.flashmemo.site

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. 配置防火墙
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 数据备份

```bash
# 手动备份
cp -r /root/luckyVote/data /root/backup/vote-data-$(date +%Y%m%d)

# 自动备份（添加到 crontab）
0 2 * * * cp -r /root/luckyVote/data /root/backup/vote-data-$(date +\%Y\%m\%d)
```

### 监控和维护

#### 1. 设置应用监控
```bash
# PM2 监控
pm2 monit

# 设置自动重启（如果内存使用过高）
pm2 start server.js --name "lucky-vote" --max-memory-restart 500M
```

#### 2. 日志轮转
```bash
# 配置 PM2 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 成功部署后

访问 http://flashmemo.site/ 即可看到投票系统界面！

### 系统特性
- ✅ 实时投票和结果显示
- ✅ 多客户端同步
- ✅ 数据持久化
- ✅ 响应式设计
- ✅ 投票重置功能
- ✅ PM2 进程管理
- ✅ Nginx 反向代理
- ✅ 静态文件缓存
- ✅ 安全头配置

### 访问地址
- **生产环境**: http://flashmemo.site/
- **HTTPS（配置SSL后）**: https://flashmemo.site/
- **直接IP访问**: http://your-server-ip/

### 性能优化建议
1. 启用 Gzip 压缩
2. 配置静态文件缓存
3. 使用 CDN 加速
4. 定期清理日志文件
5. 监控服务器资源使用情况