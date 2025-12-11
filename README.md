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
- **API 整合**：Notion API (@notionhq/client)
- **語言**：TypeScript

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

編輯 `.env.local`，填入您的 Notion 資訊：

```env
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
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

### 5. 啟動開發服務器

```bash
npm run dev
```

打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 6. 構建生產版本

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

4. 設定環境變數：
   - 在 Zeabur 專案設定中，添加環境變數：
     - `NOTION_API_KEY`
     - `NOTION_DATABASE_ID`
     - `REFRESH_INTERVAL`（可選）

5. 部署：
   - Zeabur 會自動檢測為 Next.js 專案並部署
   - 等待部署完成，即可獲得訪問網址

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
│   │   ├── projects/      # 專案資料 API
│   │   └── stats/         # 統計資料 API
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根佈局
│   └── page.tsx           # 主頁面
├── components/
│   ├── Charts.tsx         # 圖表組件
│   ├── ProjectTable.tsx   # 專案表格組件
│   └── StatsCard.tsx      # 統計卡片組件
├── lib/
│   └── notion.ts          # Notion API 整合
├── .env.example           # 環境變數範例
├── next.config.js         # Next.js 配置
├── package.json           # 依賴管理
├── tailwind.config.ts     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
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

1. **Notion API 限制**：Notion API 有請求速率限制，建議不要設定過短的刷新間隔
2. **權限設定**：確保 Notion Integration 有讀取資料庫的權限
3. **資料庫結構**：如果您的 Notion 資料庫結構與 BWC 專案列表不同，需要修改 `lib/notion.ts` 中的屬性映射

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

## 授權

MIT License

## 聯絡方式

如有問題或建議，請開 Issue 討論。
