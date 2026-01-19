#!/bin/bash

# 啟動 Gunicorn 服務器
echo "🚀 Starting Gunicorn server..."
gunicorn config.wsgi:application -c gunicorn.conf.py
