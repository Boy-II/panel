import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/notion';
import { bulkUpsertProjects, logSync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const startTime = Date.now();

  try {
    console.log('開始從 Notion 同步專案...');

    // 1. 從 Notion 獲取所有專案
    const projects = await getProjects();
    console.log(`從 Notion 獲取了 ${projects.length} 個專案`);

    // 2. 批量寫入 PostgreSQL
    await bulkUpsertProjects(projects);
    console.log('專案已成功同步到 PostgreSQL');

    // 3. 記錄同步日誌
    const durationMs = Date.now() - startTime;
    await logSync(projects.length, true, null, durationMs);

    return NextResponse.json({
      success: true,
      message: '同步成功',
      totalProjects: projects.length,
      durationMs,
    });
  } catch (error) {
    console.error('同步失敗:', error);
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';

    // 記錄失敗的同步
    try {
      await logSync(0, false, errorMessage, durationMs);
    } catch (logError) {
      console.error('記錄同步日誌失敗:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        message: '同步失敗',
        error: errorMessage,
        durationMs,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用 POST 請求來觸發同步',
    usage: 'POST /api/sync',
  });
}
