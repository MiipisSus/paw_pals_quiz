# Backend API

Django REST API for Paw Pals Quiz

## 安裝依賴

```bash
uv sync
```

## 資料庫遷移

```bash
python manage.py migrate
```

## 啟動伺服器

**快速啟動（推薦）：**
```bash
./start.sh
```

**或使用完整指令：**
```bash
gunicorn config.wsgi:application -c gunicorn.conf.py
```

**開發模式（使用 Django 開發伺服器）：**
```bash
python manage.py runserver
```

## 背景任務

啟動定時任務調度器：
```bash
python manage.py shell
>>> from api.scheduler import start_scheduler
>>> start_scheduler()
```

## 管理命令

載入品種資料：
```bash
python manage.py load_breeds
```

創建假數據：
```bash
python manage.py create_fake_data --count 20
```

重置品種統計：
```bash
python manage.py create_fake_data --reset
```
