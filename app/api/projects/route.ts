import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getProjects();

    // 計算時間相關資訊
    const now = new Date();
    const projectsWithTimeInfo = projects.map(project => {
      let status = 'on-time';
      let daysRemaining: number | null = null;

      if (project.工作執行區間?.end) {
        const endDate = new Date(project.工作執行區間.end);
        const diffTime = endDate.getTime() - now.getTime();
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
