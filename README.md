# BWC 專案監控儀表板

> 🚀 一個基於 Next.js 的專案監控儀表板，從 Notion 資料庫獲取資料，提供即時專案狀態監控、時間管理和資料視覺化功能。

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 📸 預覽

- **全局儀表板**：查看所有專案的整體狀態
- **個人儀表板**：查看個人負責專案的詳細資訊
- **即時監控**：自動更新，掌握最新狀態

## ✨ 功能特色

### 雙重視圖
- **全局儀表板**：查看所有專案的整體狀態和統計
- **個人儀表板**：選擇特定設計師或編輯，查看其負責的專案

### 智能時間管理
- ✅ 自動計算專案剩餘天數
- 🔴 逾期專案警示（紅色）
- 🟠 緊急專案提醒（3天內，橙色）
- 🟡 警告專案標記（7天內，黃色）
- ⚪ 已過期專案歸檔（超過365天，灰色，不計入統計）

### 資料視覺化
- 📊 時間狀態分布圖
- 📈 通知狀態分布圖
- 📉 專案型態分布圖

### 搜尋與篩選
- 🔍 關鍵字搜尋（專案名稱、編輯、設計師）
- 🎯 多維度篩選（通知狀態、專案型態、時間狀態）
- 📋 即時結果更新

### 即時監控
- ⏰ 自動每60秒刷新資料
- 🔄 手動刷新按鈕
- 📅 顯示最後更新時間

### 完整分頁支持
- 📄 自動處理 Notion API 分頁
- ♾️ 支持任意數量的專案記錄

## 技術棧

- **前端框架**：Next.js 15 (App Router)
- **UI 樣式**：Tailwind CSS
- **圖表庫**：Recharts
- **圖標**：Lucide React
- **資料來源**：Notion API (@notionhq/client)
- **資料庫**：PostgreSQL (pg)
- **語言**：TypeScript

## 架構說明

### 資料流程

```
Notion Database → Sync API → PostgreSQL → Read APIs → Frontend
```

1. **Notion 作為資料來源**：所有專案資料存儲在 Notion 資料庫中
2. **PostgreSQL 作為快取層**：提供快速查詢，減少 Notion API 調用
3. **同步機制**：通過 API 端點手動或定時同步 Notion 資料到 PostgreSQL
4. **讀取優化**：所有前端查詢直接從 PostgreSQL 讀取，大幅提升載入速度

## 快速開始

### 1. 環境準備

確保已安裝：
- Node.js 18+
- npm 或 yarn

### 2. 克隆項目

```bash
git clone <your-repo-url>
cd panel
```

### 3. 安裝依賴

```bash
npm install
```

### 4. 設定環境變數

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入您的 Notion 和 PostgreSQL 資訊：

```env
# Notion API Configuration
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_database_id_here

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Optional: Refresh interval in milliseconds
REFRESH_INTERVAL=60000
```

#### 如何獲取 Notion API Key：

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 點擊 "New integration"
3. 填寫基本資訊，選擇你的工作區
4. 創建後，複製 "Internal Integration Token"
5. 在 Notion 中，打開您的資料庫頁面
6. 點擊右上角的 "..." → "Connections" → 添加您剛創建的 integration

#### 如何獲取 Database ID：

從 Notion 資料庫 URL 中獲取：
```
https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              這就是 Database ID（32位字符）
```

**步驟：**
1. 打開您的 Notion 資料庫頁面
2. 複製瀏覽器地址欄中的 URL
3. 找到 URL 中間的 32 位字符串（由字母和數字組成）
4. 複製並貼到 `.env.local` 的 `NOTION_DATABASE_ID` 中

#### 如何設定 PostgreSQL：

1. 在 Zeabur 創建 PostgreSQL 服務
2. 獲取連接字串（Connection String）
3. 複製並貼到 `.env.local` 的 `DATABASE_URL` 中

### 5. 初始化數據庫

首次使用需要初始化數據庫表結構：

```bash
npm run db:init
```

### 6. 同步 Notion 資料

初始化數據庫後，需要從 Notion 同步資料：

```bash
# 方法一：啟動服務器後調用 API
npm run dev
# 在另一個終端執行：
curl -X POST http://localhost:3000/api/sync

# 方法二：部署到 Zeabur 後，訪問同步 API
# POST https://your-app.zeabur.app/api/sync
```

### 7. 啟動開發服務器

```bash
npm run dev
```

打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 8. 構建生產版本

```bash
npm run build
npm start
```

## 部署到 Zeabur

### 方法一：通過 GitHub（推薦）

1. 將代碼推送到 GitHub 倉庫

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. 登入 [Zeabur](https://zeabur.com/)

3. 創建新專案：
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub"
   - 選擇您的倉庫

4. 添加 PostgreSQL 服務：
   - 在 Zeabur 專案中點擊 "Add Service"
   - 選擇 "PostgreSQL"
   - 等待 PostgreSQL 服務啟動

5. 設定環境變數：
   - 在 Zeabur 專案設定中，添加環境變數：
     - `NOTION_API_KEY`
     - `NOTION_DATABASE_ID`
     - `DATABASE_URL`（從 PostgreSQL 服務獲取）
     - `REFRESH_INTERVAL`（可選）

6. 部署：
   - Zeabur 會自動檢測為 Next.js 專案並部署
   - 等待部署完成，即可獲得訪問網址

7. 初始化資料庫與同步：
   ```bash
   # 初始化資料庫表結構（使用 DATABASE_URL）
   npm run db:init

   # 同步 Notion 資料到 PostgreSQL
   curl -X POST https://your-app.zeabur.app/api/sync
   ```

### 方法二：使用 Zeabur CLI

```bash
# 安裝 Zeabur CLI
npm i -g @zeabur/cli

# 登入
zeabur auth login

# 部署
zeabur deploy
```

## 專案結構

```
panel/
├── app/
│   ├── api/
│   │   ├── projects/           # 專案資料 API
│   │   ├── stats/              # 統計資料 API
│   │   ├── people/             # 人員列表 API
│   │   ├── personal/[person]/  # 個人儀表板 API
│   │   └── sync/               # Notion → PostgreSQL 同步 API
│   ├── personal/[person]/      # 個人儀表板頁面
│   ├── globals.css             # 全局樣式
│   ├── layout.tsx              # 根佈局
│   └── page.tsx                # 全局儀表板頁面
├── components/
│   ├── Charts.tsx              # 圖表組件
│   ├── ProjectTable.tsx        # 專案表格組件
│   └── StatsCard.tsx           # 統計卡片組件
├── lib/
│   ├── notion.ts               # Notion API 整合
│   ├── db.ts                   # PostgreSQL 資料庫操作
│   └── cache.ts                # 快取工具
├── database/
│   └── schema.sql              # PostgreSQL 資料庫結構
├── scripts/
│   └── init-db.ts              # 資料庫初始化腳本
├── .env.example                # 環境變數範例
├── next.config.js              # Next.js 配置
├── package.json                # 依賴管理
├── tailwind.config.ts          # Tailwind 配置
└── tsconfig.json               # TypeScript 配置
```

## API 路由

### GET /api/projects

獲取所有專案資料，包含時間狀態計算。

**響應範例：**
```json
[
  {
    "id": "...",
    "專案名稱": "範例專案",
    "專案型態": ["數位網站"],
    "責任編輯": ["張三"],
    "責任設計": ["李四"],
    "通知狀態": "已通知",
    "工作執行區間": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "timeStatus": "on-time",
    "daysRemaining": 180
  }
]
```

### GET /api/stats

獲取統計資料。

**響應範例：**
```json
{
  "total": 100,
  "statusStats": {
    "未通知": 20,
    "通知中": 30,
    "已通知": 50
  },
  "typeStats": {
    "數位網站": 40,
    "紙本": 30,
    "設計案": 30
  },
  "timeStats": {
    "overdue": 5,
    "urgent": 10,
    "warning": 15,
    "onTime": 60,
    "noDeadline": 10
  },
  "designerWorkload": {...},
  "editorWorkload": {...}
}
```

### POST /api/sync

從 Notion 同步資料到 PostgreSQL。

**請求：**
```bash
curl -X POST https://your-app.zeabur.app/api/sync
```

**響應範例：**
```json
{
  "success": true,
  "message": "同步成功",
  "totalProjects": 156,
  "durationMs": 3421
}
```

## 自定義配置

### 修改刷新間隔

在 `.env.local` 中設定 `REFRESH_INTERVAL`（單位：毫秒）：

```env
REFRESH_INTERVAL=30000  # 30秒刷新一次
```

或在 `app/page.tsx` 中直接修改：

```typescript
const interval = setInterval(fetchData, 30000); // 30秒
```

### 自定義時間警告閾值

在 `app/api/projects/route.ts` 中修改：

```typescript
if (diffDays < 0) {
  status = 'overdue';
} else if (diffDays <= 3) {  // 修改這裡：3天內為緊急
  status = 'urgent';
} else if (diffDays <= 7) {  // 修改這裡：7天內為警告
  status = 'warning';
}
```

## 注意事項

1. **資料同步**：
   - 初次部署後需要手動調用 `/api/sync` 來同步 Notion 資料
   - 建議設定定期同步（例如使用 cron job 或 Zeabur 的 scheduled tasks）
   - 可以在 Notion 資料更新後手動觸發同步

2. **Notion API 限制**：
   - Notion API 有請求速率限制
   - 使用 PostgreSQL 快取後，只有同步操作會調用 Notion API
   - 所有讀取操作都從 PostgreSQL 讀取，不受 Notion API 限制

3. **權限設定**：確保 Notion Integration 有讀取資料庫的權限

4. **資料庫結構**：如果您的 Notion 資料庫結構與 BWC 專案列表不同，需要修改 `lib/notion.ts` 中的屬性映射

5. **PostgreSQL 連接**：確保 `DATABASE_URL` 設定正確，並且 PostgreSQL 服務正常運行

## 故障排除

### 1. 無法連接 Notion API

- 檢查 `NOTION_API_KEY` 是否正確
- 確認 Integration 已連接到資料庫
- 檢查 `NOTION_DATABASE_ID` 是否正確

### 2. 圖表無法顯示

- 確認已安裝 `recharts` 依賴
- 檢查瀏覽器控制台是否有錯誤

### 3. 部署後環境變數不生效

- 確認在 Zeabur 或其他平台設定了環境變數
- 重新部署應用

### 4. PostgreSQL 連接失敗

- 檢查 `DATABASE_URL` 是否正確
- 確認 PostgreSQL 服務正常運行
- 檢查 SSL 設定（目前設定為 `ssl: false`）
- 確認網路連接正常

### 5. 資料不顯示

- 檢查是否已執行資料庫初始化 `npm run db:init`
- 檢查是否已同步 Notion 資料 `POST /api/sync`
- 查看瀏覽器控制台和伺服器日誌

## 授權

MIT License

## 聯絡方式

如有問題或建議，請開 Issue 討論。
