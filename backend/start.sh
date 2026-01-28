#!/bin/bash

# 啟動 Gunicorn HTTP 服務器
echo "🚀 Starting Gunicorn HTTP server on http://localhost:8000"
gunicorn config.wsgi:application -c gunicorn.conf.py
