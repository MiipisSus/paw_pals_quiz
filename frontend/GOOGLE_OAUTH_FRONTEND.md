# Google OAuth 前端整合說明

## 已完成的修改

### 1. 新增檔案
- **[src/pages/LoginCallback.jsx](src/pages/LoginCallback.jsx)** - 處理 Google OAuth 回調的頁面

### 2. 修改的檔案

#### [src/pages/Login.jsx](src/pages/Login.jsx)
- 新增 `handleGoogleLogin()` 函數來處理 Google 登入
- 為 Google 登入按鈕添加 `onClick` 和 `type="button"` 屬性

#### [src/App.jsx](src/App.jsx)
- 導入 `LoginCallback` 組件
- 新增路由 `/login/callback` 來處理 OAuth 回調

#### [src/i18n/locales/en.json](src/i18n/locales/en.json) & [src/i18n/locales/zh.json](src/i18n/locales/zh.json)
- 新增以下翻譯鍵值：
  - `errorInvalidState` - 無效的安全標記
  - `errorNoCode` - 未收到授權碼
  - `errorNoEmail` - 未收到 email
  - `errorOAuthFailed` - OAuth 認證失敗
  - `errorServerError` - 伺服器錯誤
  - `processing` - 處理登入中
  - `redirecting` - 重定向中

## 使用流程

1. **用戶點擊 "Sign in with Google" 按鈕**
   - 觸發 `handleGoogleLogin()` 函數
   - 重定向到 `/api/auth/google/login/`

2. **後端處理**
   - 重定向到 Google 授權頁面
   - 用戶授權後，Google 回調到 `/api/auth/google/callback/`

3. **回調處理**
   - 後端驗證並生成 JWT tokens
   - 重定向到前端 `/login/callback?access_token=xxx&refresh_token=xxx`

4. **前端處理回調**
   - `LoginCallback` 組件提取 URL 參數中的 tokens
   - 使用 `useAuth` 的 `login()` 函數儲存 tokens
   - 重定向到首頁

## 錯誤處理

所有錯誤都會：
1. 在 `LoginCallback` 頁面顯示 3 秒
2. 自動重定向回登入頁面
3. 顯示對應的錯誤訊息

## 測試步驟

1. 確保後端已設置 Google OAuth 憑證
2. 啟動前端開發服務器
3. 訪問登入頁面
4. 點擊 "使用 Google 登入" 按鈕
5. 完成 Google 授權
6. 應該自動登入並重定向到首頁

## 注意事項

- 確保後端的 `FRONTEND_URL` 設定正確
- 確保 Google Cloud Console 的回調 URL 正確設定
- 開發環境使用 `http://localhost:5173`
- 生產環境需要使用 HTTPS
