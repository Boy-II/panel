import { Pool, QueryResult } from 'pg';
import { ProjectProperty } from './notion';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

// 將 Notion 專案轉換為數據庫行
export function projectToDbRow(project: ProjectProperty) {
  return {
    id: project.id,
    project_name: project.專案名稱,
    project_types: project.專案型態,
    editors: project.責任編輯,
    designers: project.責任設計,
    notification_status: project.通知狀態,
    state: project.state,
    work_period_start: project.工作執行區間?.start || null,
    work_period_end: project.工作執行區間?.end || null,
    additional_notes: project.補充說明,
    unit_name: project.單元名稱,
    size_specification: project.尺寸規格,
    production_time: project.進廠時間,
    color_draft_time: project.色稿時間,
    file_path: project.檔案路徑,
    last_updated_at: project.最後更新時間 || new Date().toISOString(),
  };
}

// 將數據庫行轉換為 ProjectProperty
export function dbRowToProject(row: any): ProjectProperty {
  return {
    id: row.id,
    專案名稱: row.project_name,
    專案型態: row.project_types || [],
    責任編輯: row.editors || [],
    責任設計: row.designers || [],
    通知狀態: row.notification_status,
    state: row.state || '進行中',
    工作執行區間: row.work_period_start || row.work_period_end ? {
      start: row.work_period_start,
      end: row.work_period_end,
    } : null,
    補充說明: row.additional_notes || '',
    單元名稱: row.unit_name || '',
    尺寸規格: row.size_specification || '',
    進廠時間: row.production_time || '',
    色稿時間: row.color_draft_time || '',
    檔案路徑: row.file_path || '',
    最後更新時間: row.last_updated_at,
  };
}

// 獲取所有專案（排除已結案和已完成）
export async function getAllProjects(): Promise<ProjectProperty[]> {
  const pool = getPool();
  const result = await pool.query(`
    SELECT * FROM projects
    WHERE state NOT IN ('已結案', '已完成')
    ORDER BY last_updated_at DESC
  `);
  return result.rows.map(dbRowToProject);
}

// 獲取所有專案（包含已結案和已完成，用於年度統計）
export async function getAllProjectsIncludingClosed(): Promise<ProjectProperty[]> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM projects ORDER BY last_updated_at DESC');
  return result.rows.map(dbRowToProject);
}

// 獲取活躍專案（排除過期超過365天）
export async function getActiveProjects(): Promise<ProjectProperty[]> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM active_projects ORDER BY last_updated_at DESC');
  return result.rows.map(dbRowToProject);
}

// 插入或更新專案
export async function upsertProject(project: ProjectProperty): Promise<void> {
  const pool = getPool();
  const row = projectToDbRow(project);

  await pool.query(`
    INSERT INTO projects (
      id, project_name, project_types, editors, designers,
      notification_status, state, work_period_start, work_period_end,
      additional_notes, unit_name, size_specification,
      production_time, color_draft_time, file_path, last_updated_at, synced_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      project_name = EXCLUDED.project_name,
      project_types = EXCLUDED.project_types,
      editors = EXCLUDED.editors,
      designers = EXCLUDED.designers,
      notification_status = EXCLUDED.notification_status,
      state = EXCLUDED.state,
      work_period_start = EXCLUDED.work_period_start,
      work_period_end = EXCLUDED.work_period_end,
      additional_notes = EXCLUDED.additional_notes,
      unit_name = EXCLUDED.unit_name,
      size_specification = EXCLUDED.size_specification,
      production_time = EXCLUDED.production_time,
      color_draft_time = EXCLUDED.color_draft_time,
      file_path = EXCLUDED.file_path,
      last_updated_at = EXCLUDED.last_updated_at,
      synced_at = CURRENT_TIMESTAMP
  `, [
    row.id, row.project_name, row.project_types, row.editors, row.designers,
    row.notification_status, row.state, row.work_period_start, row.work_period_end,
    row.additional_notes, row.unit_name, row.size_specification,
    row.production_time, row.color_draft_time, row.file_path, row.last_updated_at
  ]);
}

// 批量更新專案
export async function bulkUpsertProjects(projects: ProjectProperty[]): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const project of projects) {
      const row = projectToDbRow(project);
      await client.query(`
        INSERT INTO projects (
          id, project_name, project_types, editors, designers,
          notification_status, state, work_period_start, work_period_end,
          additional_notes, unit_name, size_specification,
          production_time, color_draft_time, file_path, last_updated_at, synced_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          project_name = EXCLUDED.project_name,
          project_types = EXCLUDED.project_types,
          editors = EXCLUDED.editors,
          designers = EXCLUDED.designers,
          notification_status = EXCLUDED.notification_status,
          state = EXCLUDED.state,
          work_period_start = EXCLUDED.work_period_start,
          work_period_end = EXCLUDED.work_period_end,
          additional_notes = EXCLUDED.additional_notes,
          unit_name = EXCLUDED.unit_name,
          size_specification = EXCLUDED.size_specification,
          production_time = EXCLUDED.production_time,
          color_draft_time = EXCLUDED.color_draft_time,
          file_path = EXCLUDED.file_path,
          last_updated_at = EXCLUDED.last_updated_at,
          synced_at = CURRENT_TIMESTAMP
      `, [
        row.id, row.project_name, row.project_types, row.editors, row.designers,
        row.notification_status, row.state, row.work_period_start, row.work_period_end,
        row.additional_notes, row.unit_name, row.size_specification,
        row.production_time, row.color_draft_time, row.file_path, row.last_updated_at
      ]);
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// 記錄同步日誌
export async function logSync(totalProjects: number, success: boolean, errorMessage: string | null, durationMs: number): Promise<void> {
  const pool = getPool();
  await pool.query(`
    INSERT INTO sync_logs (total_projects, success, error_message, duration_ms, sync_completed_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
  `, [totalProjects, success, errorMessage, durationMs]);
}

// 獲取最後同步時間
export async function getLastSyncTime(): Promise<Date | null> {
  const pool = getPool();
  const result = await pool.query(`
    SELECT sync_completed_at FROM sync_logs
    WHERE success = true
    ORDER BY sync_completed_at DESC
    LIMIT 1
  `);

  return result.rows[0]?.sync_completed_at || null;
}
