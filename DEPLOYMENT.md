# 投票系统 Docker 部署指南

## 部署到 flashmemo.site

### 前置要求

1. **服务器准备**
   - 一台 Linux 服务器（推荐 Ubuntu 20.04+）
   - 域名 `flashmemo.site` 已解析到服务器 IP
   - 服务器开放 80 和 443 端口

2. **安装 Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### 快速部署

1. **上传代码到服务器**
   ```bash
   # 方式1: 使用 git
   git clone <your-repo-url>
   cd luckyVote
   
   # 方式2: 使用 scp 上传
   scp -r ./luckyVote user@your-server:/home/user/
   ```

2. **执行部署脚本**
   ```bash
   cd luckyVote
   ./deploy.sh
   ```

3. **配置域名（可选 - 使用 Nginx 反向代理）**
   ```bash
   # 安装 Nginx
   sudo apt update
   sudo apt install nginx
   
   # 创建 Nginx 配置
   sudo nano /etc/nginx/sites-available/flashmemo.site
   ```
   
   配置内容：
   ```nginx
   server {
       listen 80;
       server_name flashmemo.site www.flashmemo.site;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # 启用站点
   sudo ln -s /etc/nginx/sites-available/flashmemo.site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 直接访问（推荐）

如果你的域名直接解析到服务器，并且服务器上没有其他服务占用 80 端口，可以直接访问：

- **访问地址**: http://flashmemo.site/
- **本地测试**: http://localhost:80

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
git pull  # 如果使用 git
./deploy.sh

# 备份数据
cp -r ./data ./data-backup-$(date +%Y%m%d)
```

### 故障排除

1. **端口被占用**
   ```bash
   sudo lsof -i :80
   sudo systemctl stop apache2  # 如果是 Apache
   sudo systemctl stop nginx    # 如果是 Nginx
   ```

2. **容器启动失败**
   ```bash
   docker-compose logs
   docker-compose down
   docker-compose up -d
   ```

3. **域名无法访问**
   - 检查域名 DNS 解析是否正确
   - 检查服务器防火墙设置
   - 检查服务是否正常运行

### 安全建议

1. **配置 HTTPS（推荐）**
   ```bash
   # 使用 Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d flashmemo.site
   ```

2. **配置防火墙**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

3. **定期备份数据**
   ```bash
   # 添加到 crontab
   0 2 * * * cp -r /path/to/luckyVote/data /path/to/backup/vote-data-$(date +\%Y\%m\%d)
   ```

### 监控和维护

1. **设置自动重启**
   ```bash
   # 添加到 crontab，每5分钟检查一次
   */5 * * * * cd /path/to/luckyVote && docker-compose ps | grep -q "Up" || docker-compose up -d
   ```

2. **日志轮转**
   ```bash
   # 配置 Docker 日志大小限制
   # 在 docker-compose.yml 中添加：
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

## 成功部署后

访问 http://flashmemo.site/ 即可看到投票系统界面！

系统特性：
- ✅ 实时投票和结果显示
- ✅ 多客户端同步
- ✅ 数据持久化
- ✅ 响应式设计
- ✅ 投票重置功能