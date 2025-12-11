import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getProjects();
    const now = new Date();

    // 過濾掉逾期超過365天的專案（不計入統計）
    const activeProjects = projects.filter(project => {
      if (!project.工作執行區間?.end) return true;
      const endDate = new Date(project.工作執行區間.end);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // 排除逾期超過365天的專案
      return !(diffDays < 0 && Math.abs(diffDays) > 365);
    });

    // 通知狀態統計（僅計算活躍專案）
    const statusStats = activeProjects.reduce((acc: any, project) => {
      const status = project.通知狀態 || '未知';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // 專案型態統計（僅計算活躍專案）
    const typeStats = activeProjects.reduce((acc: any, project) => {
      project.專案型態.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});

    // 時間狀態統計（僅計算活躍專案）
    const timeStats = {
      overdue: 0,
      urgent: 0,
      warning: 0,
      onTime: 0,
      noDeadline: 0,
      expired: projects.length - activeProjects.length, // 已過期專案數
    };

    activeProjects.forEach(project => {
      if (!project.工作執行區間?.end) {
        timeStats.noDeadline++;
        return;
      }

      const endDate = new Date(project.工作執行區間.end);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        timeStats.overdue++;
      } else if (diffDays <= 3) {
        timeStats.urgent++;
      } else if (diffDays <= 7) {
        timeStats.warning++;
      } else {
        timeStats.onTime++;
      }
    });

    // 責任設計師工作量（僅計算活躍專案）
    const designerWorkload = activeProjects.reduce((acc: any, project) => {
      project.責任設計.forEach(designer => {
        if (!acc[designer]) {
          acc[designer] = { total: 0, overdue: 0, urgent: 0 };
        }
        acc[designer].total++;

        if (project.工作執行區間?.end) {
          const endDate = new Date(project.工作執行區間.end);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            acc[designer].overdue++;
          } else if (diffDays <= 3) {
            acc[designer].urgent++;
          }
        }
      });
      return acc;
    }, {});

    // 責任編輯工作量（僅計算活躍專案）
    const editorWorkload = activeProjects.reduce((acc: any, project) => {
      project.責任編輯.forEach(editor => {
        if (!acc[editor]) {
          acc[editor] = { total: 0, overdue: 0, urgent: 0 };
        }
        acc[editor].total++;

        if (project.工作執行區間?.end) {
          const endDate = new Date(project.工作執行區間.end);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            acc[editor].overdue++;
          } else if (diffDays <= 3) {
            acc[editor].urgent++;
          }
        }
      });
      return acc;
    }, {});

    return NextResponse.json({
      total: activeProjects.length, // 僅計算活躍專案
      totalWithExpired: projects.length, // 包含過期的總數
      statusStats,
      typeStats,
      timeStats,
      designerWorkload,
      editorWorkload,
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
