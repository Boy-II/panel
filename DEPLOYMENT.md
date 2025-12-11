# 部署前檢查清單

在將專案上傳到 GitHub 或其他公開倉庫之前，請確認以下事項：

## ✅ 已完成項目

### 1. 敏感信息已移除
- [x] `.env.example` 中不包含真實的 API Key 和 Database ID
- [x] `lib/notion.ts` 中移除了硬編碼的 Database ID
- [x] README 中的示例已使用佔位符

### 2. .gitignore 配置正確
- [x] `.env.local` 已加入 .gitignore
- [x] `.env` 已加入 .gitignore
- [x] `node_modules` 已加入 .gitignore

### 3. 文件檢查
確保以下文件**不會**被提交到倉庫：
```bash
# 檢查是否有敏感文件會被提交
git status

# 應該看不到以下文件：
# - .env.local
# - .env
# - node_modules/
```

## 📝 上傳到 GitHub 步驟

### 1. 初始化 Git 倉庫（如果尚未初始化）
```bash
git init
```

### 2. 添加所有文件
```bash
git add .
```

### 3. 提交更改
```bash
git commit -m "Initial commit: BWC 專案監控儀表板"
```

### 4. 連接到 GitHub 倉庫
```bash
# 替換為您的倉庫 URL
git remote add origin https://github.com/your-username/your-repo-name.git
```

### 5. 推送到 GitHub
```bash
git branch -M main
git push -u origin main
```

## 🔐 部署到 Zeabur

### 環境變數設定
在 Zeabur 控制台中設定以下環境變數：

```
NOTION_API_KEY=your_actual_notion_integration_token
NOTION_DATABASE_ID=your_actual_database_id
REFRESH_INTERVAL=60000
```

**重要：** 永遠不要將真實的 API Key 和 Database ID 提交到倉庫中！

## ⚠️ 安全提醒

1. **永遠不要提交 .env.local 或 .env 文件**
2. **確認 .gitignore 正確配置**
3. **在 GitHub 上檢查提交歷史，確保沒有敏感信息**
4. **如果不小心提交了敏感信息：**
   - 立即更換 Notion API Key
   - 從 Git 歷史中移除敏感信息
   - 使用 `git filter-branch` 或 `BFG Repo-Cleaner`

## 📋 其他用戶如何使用此專案

1. Clone 倉庫
2. 複製 `.env.example` 為 `.env.local`
3. 填入自己的 Notion API Key 和 Database ID
4. 安裝依賴並啟動：
   ```bash
   npm install
   npm run dev
   ```

## 🎯 後續維護

當您需要更新部署時：
```bash
git add .
git commit -m "描述您的更改"
git push origin main
```

Zeabur 會自動檢測到更新並重新部署。
