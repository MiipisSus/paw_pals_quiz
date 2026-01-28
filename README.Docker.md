# Docker Compose 使用說明

## 快速開始

### 1. 環境設定

首先，在 `backend` 目錄下建立 `.env` 檔案：

```bash
cd backend
cp .env.example .env
```

編輯 `.env` 檔案，填入必要的環境變數（如 Google OAuth、Email 等）。

### 2. 啟動所有服務

在專案根目錄執行：

```bash
docker-compose up -d
```

這會啟動以下服務：

- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **Django Backend** (port 8000)
- **React Frontend** (port 5173)

### 3. 查看服務狀態

```bash
docker-compose ps
```

### 4. 查看服務日誌

```bash
# 查看所有服務的日誌
docker-compose logs -f

# 查看特定服務的日誌
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. 訪問應用

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## 常用指令

### 執行 Django 管理指令

```bash
# 執行遷移
docker-compose exec backend python manage.py migrate

# 建立超級使用者
docker-compose exec backend python manage.py createsuperuser

# 進入 Django shell
docker-compose exec backend python manage.py shell

# 載入資料
docker-compose exec backend python manage.py loaddata breeds
```

### 資料庫操作

```bash
# 進入 PostgreSQL
docker-compose exec db psql -U postgres -d dog_breed_guesser

# 備份資料庫
docker-compose exec db pg_dump -U postgres dog_breed_guesser > backup.sql

# 還原資料庫
docker-compose exec -T db psql -U postgres dog_breed_guesser < backup.sql
```

### 重新建置映像檔

```bash
# 重新建置所有服務
docker-compose build

# 重新建置特定服務
docker-compose build backend
docker-compose build frontend
```

### 停止和移除服務

```bash
# 停止服務
docker-compose stop

# 停止並移除容器
docker-compose down

# 停止並移除容器和資料卷
docker-compose down -v
```

## 開發模式

### 即時程式碼更新

由於使用了 volume 掛載，你在本機修改的程式碼會即時反映到容器中：

- **Backend**: 修改 Python 檔案後，Gunicorn 會自動重新載入（開發模式）
- **Frontend**: 修改 React 檔案後，Vite 會自動熱更新

### 安裝新的依賴

**Backend:**

```bash
# 進入容器
docker-compose exec backend bash

# 安裝新套件
pip install <package-name>

# 更新 pyproject.toml 後重新建置
docker-compose build backend
docker-compose up -d backend
```

**Frontend:**

```bash
# 進入容器
docker-compose exec frontend sh

# 安裝新套件
npm install <package-name>

# 或在本機安裝後重啟
docker-compose restart frontend
```

## 疑難排解

### 服務無法啟動

```bash
# 查看詳細錯誤訊息
docker-compose logs backend
docker-compose logs frontend

# 檢查服務健康狀態
docker-compose ps
```

### 資料庫連線錯誤

確保 `backend/.env` 中的資料庫設定正確：

```
DATABASE_HOST=db
DATABASE_PORT=5432
```

### 清理並重新開始

```bash
# 停止所有服務並清理
docker-compose down -v

# 重新建置並啟動
docker-compose build
docker-compose up -d
```

## 生產部署

對於生產環境，建議：

1. 修改 `docker-compose.yml` 中的環境變數設定
2. 將 `DEBUG=False`
3. 設定強密碼給資料庫
4. 使用環境變數管理敏感資訊
5. 設定正確的 `ALLOWED_HOSTS`
6. 考慮使用 Nginx 作為反向代理
7. 使用 Docker secrets 管理敏感資料

## 注意事項

- 初次啟動時，資料庫遷移會自動執行
- 靜態檔案會自動收集到 `staticfiles` 目錄
- PostgreSQL 資料會持久化儲存在 Docker volume 中
- 請勿將 `.env` 檔案提交到版本控制
