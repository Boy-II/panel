-- BWC 專案監控系統數據庫表結構

-- 1. 專案表
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    project_name TEXT NOT NULL,
    project_types TEXT[], -- 專案型態（陣列）
    editors TEXT[], -- 責任編輯（陣列）
    designers TEXT[], -- 責任設計（陣列）
    notification_status VARCHAR(50), -- 通知狀態
    work_period_start TIMESTAMP, -- 工作執行區間開始
    work_period_end TIMESTAMP, -- 工作執行區間結束
    additional_notes TEXT, -- 補充說明
    unit_name TEXT, -- 單元名稱
    size_specification TEXT, -- 尺寸規格
    production_time TEXT, -- 進廠時間
    file_path TEXT, -- 檔案路徑
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 最後更新時間
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 同步時間
);

-- 2. 創建索引以提升查詢速度
CREATE INDEX IF NOT EXISTS idx_projects_notification_status ON projects(notification_status);
CREATE INDEX IF NOT EXISTS idx_projects_work_period_end ON projects(work_period_end);
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);
CREATE INDEX IF NOT EXISTS idx_projects_designers ON projects USING GIN(designers);
CREATE INDEX IF NOT EXISTS idx_projects_editors ON projects USING GIN(editors);
CREATE INDEX IF NOT EXISTS idx_projects_project_types ON projects USING GIN(project_types);

-- 3. 同步記錄表（記錄每次同步狀態）
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_completed_at TIMESTAMP,
    total_projects INTEGER,
    success BOOLEAN,
    error_message TEXT,
    duration_ms INTEGER
);

-- 4. 創建視圖：活躍專案（排除過期超過365天的專案）
CREATE OR REPLACE VIEW active_projects AS
SELECT *
FROM projects
WHERE
    work_period_end IS NULL
    OR work_period_end >= CURRENT_DATE - INTERVAL '365 days';

-- 5. 創建視圖：逾期專案
CREATE OR REPLACE VIEW overdue_projects AS
SELECT *
FROM projects
WHERE
    work_period_end IS NOT NULL
    AND work_period_end < CURRENT_DATE
    AND work_period_end >= CURRENT_DATE - INTERVAL '365 days';

-- 6. 創建視圖：緊急專案（3天內到期）
CREATE OR REPLACE VIEW urgent_projects AS
SELECT *
FROM projects
WHERE
    work_period_end IS NOT NULL
    AND work_period_end >= CURRENT_DATE
    AND work_period_end <= CURRENT_DATE + INTERVAL '3 days';

COMMENT ON TABLE projects IS 'BWC 專案主表';
COMMENT ON TABLE sync_logs IS '同步記錄表';
COMMENT ON VIEW active_projects IS '活躍專案視圖（排除過期超過365天）';
COMMENT ON VIEW overdue_projects IS '逾期專案視圖';
COMMENT ON VIEW urgent_projects IS '緊急專案視圖（3天內到期）';
