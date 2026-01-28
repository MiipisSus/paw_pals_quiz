# 使用官方 Python 執行環境作為基礎映像檔
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 複製 pyproject.toml 和其他必要文件
COPY pyproject.toml ./

# 安裝 Python 依賴
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir .

# 複製專案文件
COPY . .

# 建立靜態文件目錄
RUN mkdir -p /app/staticfiles

# 暴露端口
EXPOSE 8000

# 設定環境變數
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 預設命令
CMD ["gunicorn", "config.wsgi:application", "-c", "gunicorn.conf.py"]
