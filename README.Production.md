# Docker Compose 生產環境部署指南

## 🚀 生產環境部署

### 1. 環境準備

建立生產環境變數檔案：

```bash
cp .env.prod.example .env.prod
```

編輯 `.env.prod` 並設定安全的密碼和允許的主機名稱。

### 2. 建置並啟動

```bash
# 建置 images
docker-compose -f docker-compose.prod.yml build

# 啟動服務
docker-compose -f docker-compose.prod.yml up -d

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. 初始化資料

```bash
# 載入品種資料
docker-compose -f docker-compose.prod.yml exec backend python manage.py load_breeds

# 建立超級使用者
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 4. 訪問應用

- **應用程式**: http://localhost
- **API**: http://localhost/api
- **Django Admin**: http://localhost/api/admin

## 📊 架構說明

### 生產環境架構

```
                    ┌──────────────┐
                    │   Client     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    Nginx     │ (Port 80)
                    │  (Frontend)  │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      Static Files    /api requests    Media Files
            │              │              │
            │        ┌─────▼──────┐       │
            │        │  Gunicorn  │       │
            │        │  (Backend) │       │
            │        └─────┬──────┘       │
            │              │              │
            │     ┌────────┼────────┐     │
            │     │        │        │     │
            │  ┌──▼───┐ ┌──▼────┐  │     │
            │  │  DB  │ │ Redis │  │     │
            │  └──────┘ └───────┘  │     │
            └──────────────────────┘
```

### 主要改進

1. **Frontend - Nginx + 多階段構建**
   - 使用 Node.js 建置生產版本
   - 靜態檔案由 Nginx 提供（高效能）
   - Image 大小從 ~1GB 減少到 ~20MB

2. **Backend - 優化的 Python Image**
   - 多階段構建減少 Image 體積
   - collectstatic 在建置時執行
   - 使用非 root 使用者執行（安全性）
   - 內建健康檢查

3. **Nginx 反向代理**
   - 統一入口點（Port 80）
   - 自動處理靜態檔案快取
   - 反向代理 API 請求到 Backend
   - Gzip 壓縮優化傳輸

4. **資料持久化**
   - PostgreSQL 資料持久化
   - Redis AOF 持久化模式
   - 靜態檔案和媒體檔案 volume

5. **安全性**
   - Backend 不對外暴露 port，僅透過 Nginx
   - 使用獨立的 Docker network
   - 環境變數管理敏感資訊
   - 非 root 使用者執行應用

## 🔧 開發 vs 生產環境

### 開發環境 (docker-compose.yml)

```bash
docker-compose up -d
```

- Frontend: Vite 開發伺服器 (熱更新)
- 直接掛載程式碼（即時修改）
- DEBUG=True
- 暴露所有服務的 ports

### 生產環境 (docker-compose.prod.yml)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

- Frontend: Nginx 提供靜態檔案
- 優化的 Docker images
- DEBUG=False
- 僅暴露 Nginx (Port 80)

## 📝 常用指令

```bash
# 檢視服務狀態
docker-compose -f docker-compose.prod.yml ps

# 重新建置特定服務
docker-compose -f docker-compose.prod.yml build nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# 查看資源使用
docker stats

# 清理未使用的 images
docker system prune -a

# 備份資料庫
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres dog_breed_guesser > backup.sql
```

## 🌐 Nginx 配置說明

Nginx 負責：

- 提供 React 靜態檔案
- 反向代理 `/api/` 請求到 Backend
- 提供 Django 靜態檔案 `/static/`
- Gzip 壓縮
- 靜態資源快取（1年）

所有請求統一透過 Port 80 進入，前端不再需要配置 `VITE_API_URL`，因為 API 請求和前端在同一個域名下。

## ⚠️ 注意事項

1. **生產環境前**：
   - 修改 `.env.prod` 中的密碼
   - 設定正確的 `ALLOWED_HOSTS`
   - 確保 Django `SECRET_KEY` 是隨機生成的
   - 考慮使用 HTTPS（需要設定 SSL 憑證）

2. **效能調整**：
   - Gunicorn workers 數量（在 `gunicorn.conf.py` 中）
   - PostgreSQL 連線池設定
   - Redis 記憶體限制

3. **監控**：
   - 設定日誌收集（ELK, Loki 等）
   - 使用 Prometheus + Grafana 監控
   - 設定告警機制
