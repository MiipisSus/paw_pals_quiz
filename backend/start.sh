#!/bin/bash

# 啟動 Gunicorn HTTPS 服務器
echo "🔒 Starting Gunicorn HTTPS server on https://localhost:8000"
gunicorn config.wsgi:application -c gunicorn.conf.py
