# 使用官方 Node.js 執行環境作為基礎映像檔
FROM node:20-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案文件
COPY . .

# 暴露端口
EXPOSE 5173

# 啟動開發伺服器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
