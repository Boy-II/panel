import { Pool } from 'pg';

async function addStateColumn() {
  const pool = new Pool({
    user: 'root',
    password: 'Yc7zX0v86l43j2SZ5h9w1kEaOGpgQAIi',
    host: 'hnd1.clusters.zeabur.com',
    port: 30116,
    database: 'zeabur',
    ssl: false,
  });

  try {
    console.log('正在連接數據庫...');

    // 添加 state 欄位
    console.log('正在添加 state 欄位...');
    await pool.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT '進行中'
    `);

    // 創建索引
    console.log('正在創建索引...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state)
    `);

    console.log('✅ 遷移成功！state 欄位已添加');

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addStateColumn();
