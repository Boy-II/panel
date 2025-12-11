import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

async function initDatabase() {
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

    // 讀取 schema.sql 文件
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('正在執行數據庫初始化腳本...');
    await pool.query(schema);

    console.log('✅ 數據庫初始化成功！');

    // 檢查表是否創建成功
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log('\n已創建的表：');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // 檢查視圖
    const viewResult = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
    `);

    console.log('\n已創建的視圖：');
    viewResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ 數據庫初始化失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
