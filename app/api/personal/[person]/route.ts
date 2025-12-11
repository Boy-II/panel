import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: { params: Promise<{ person: string }> }
) {
  const params = await context.params;
  try {
    const personName = decodeURIComponent(params.person);
    const projects = await getProjects();
    const now = new Date();

    // 過濾該人員相關的專案
    const personalProjects = projects.filter(project =>
      project.責任設計.includes(personName) ||
      project.責任編輯.includes(personName)
    );

    // 計算時間相關資訊
    const projectsWithTimeInfo = personalProjects.map(project => {
      let status = 'on-time';
      let daysRemaining: number | null = null;

      if (project.工作執行區間?.end) {
        const endDate = new Date(project.工作執行區間.end);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (diffDays < 0) {
          // 逾期超過365天標記為已過期
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
        role: project.責任設計.includes(personName) ? '設計' : '編輯',
      };
    });

    // 過濾掉已過期的專案（不計入統計）
    const activeProjects = projectsWithTimeInfo.filter(p => p.timeStatus !== 'expired');

    // 計算個人統計（僅計算活躍專案）
    const stats = {
      total: activeProjects.length,
      overdue: activeProjects.filter(p => p.timeStatus === 'overdue').length,
      urgent: activeProjects.filter(p => p.timeStatus === 'urgent').length,
      warning: activeProjects.filter(p => p.timeStatus === 'warning').length,
      onTime: activeProjects.filter(p => p.timeStatus === 'on-time').length,
      noDeadline: activeProjects.filter(p => !p.工作執行區間?.end).length,
      expired: projectsWithTimeInfo.length - activeProjects.length,

      // 通知狀態統計（僅計算活躍專案）
      statusStats: activeProjects.reduce((acc: any, p) => {
        acc[p.通知狀態] = (acc[p.通知狀態] || 0) + 1;
        return acc;
      }, {}),

      // 專案型態統計（僅計算活躍專案）
      typeStats: activeProjects.reduce((acc: any, p) => {
        p.專案型態.forEach(type => {
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, {}),

      // 角色統計（僅計算活躍專案）
      roleStats: activeProjects.reduce((acc: any, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      person: personName,
      projects: projectsWithTimeInfo,
      stats,
    });
  } catch (error) {
    console.error('Error in personal API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal data' },
      { status: 500 }
    );
  }
}
