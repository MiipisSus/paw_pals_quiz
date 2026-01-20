"""
Gunicorn 配置文件
"""
import multiprocessing
import os

# 綁定地址和端口
bind = "0.0.0.0:8000"

# SSL 憑證配置（用於 HTTPS）
certfile = os.path.join(os.path.dirname(__file__), "certs", "localhost+1.pem")
keyfile = os.path.join(os.path.dirname(__file__), "certs", "localhost+1-key.pem")

# Worker 數量（建議為 CPU 核心數的 2-4 倍）
workers = multiprocessing.cpu_count() * 2 + 1

# Worker 類型（sync, gevent, eventlet, tornado）
worker_class = "sync"

# 每個 worker 的最大請求數（防止記憶體洩漏）
max_requests = 1000
max_requests_jitter = 50

# Worker 超時時間（秒）
timeout = 30

# 保持連接的時間（秒）
keepalive = 2

# 日誌級別
loglevel = "info"

# 訪問日誌格式
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# 日誌文件路徑（None 表示輸出到 stdout/stderr）
accesslog = "-"
errorlog = "-"

# 守護進程模式（生產環境可設為 True）
daemon = False

# PID 文件路徑
pidfile = None

# 優雅重啟的超時時間
graceful_timeout = 30

# Preload 應用（可提升性能，但可能影響代碼重載）
preload_app = False
