import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getAllProjects(); // 已在 getAllProjects() 中過濾 state

    // 計算時間相關資訊（使用進廠時間作為基準）
    const now = new Date();
    const projectsWithTimeInfo = projects.map(project => {
      let status = 'on-time';
      let daysRemaining: number | null = null;

      // 使用進廠時間作為判斷基準
      if (project.進廠時間) {
        try {
          const productionDate = new Date(project.進廠時間);
          // 檢查日期是否有效
          if (!isNaN(productionDate.getTime())) {
            const diffTime = productionDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysRemaining = diffDays;

            if (diffDays < 0) {
              // 逾期超過365天標記為已過期，不計入統計
              if (Math.abs(diffDays) > 365) {
                status = 'expired';
              } else {
                status = 'overdue';
              }
            } else if (diffDays <= 3) {
              status = 'urgent';
            } else if (diffDays <= 7) {
              status = 'warning';
            }
          }
        } catch (error) {
          // 日期解析失敗，保持預設狀態 'on-time'
          console.warn(`無法解析進廠時間: ${project.進廠時間}`, error);
        }
      }

      return {
        ...project,
        timeStatus: status,
        daysRemaining,
      };
    });

    return NextResponse.json(projectsWithTimeInfo);
  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
