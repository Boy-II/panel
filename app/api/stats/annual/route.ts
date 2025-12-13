import { NextResponse } from 'next/server';
import { getAllProjectsIncludingClosed } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const allProjects = await getAllProjectsIncludingClosed(); // 包含已結案項目

    // 過濾空值項目（與 getAllProjects 一致的過濾邏輯）
    const projects = allProjects.filter(project =>
      project.進廠時間 && project.進廠時間 !== '' &&
      project.專案名稱 && project.專案名稱 !== '' &&
      project.責任編輯 && project.責任編輯.length > 0
    );

    const now = new Date();

    // 狀態統計（包含所有項目）
    const stateStats = projects.reduce((acc: any, project) => {
      const state = project.state || '進行中';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // 通知狀態統計（包含所有項目）
    const statusStats = projects.reduce((acc: any, project) => {
      const status = project.通知狀態 || '未知';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // 專案型態統計（包含所有項目）
    const typeStats = projects.reduce((acc: any, project) => {
      project.專案型態.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});

    // 時間狀態統計（包含所有項目）
    const timeStats = {
      overdue: 0,
      urgent: 0,
      warning: 0,
      onTime: 0,
      noDeadline: 0,
      expired: 0,
    };

    projects.forEach(project => {
      if (!project.進廠時間) {
        timeStats.noDeadline++;
        return;
      }

      try {
        const productionDate = new Date(project.進廠時間);
        if (isNaN(productionDate.getTime())) {
          timeStats.noDeadline++;
          return;
        }

        const diffTime = productionDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // 逾期超過365天標記為已過期
          if (Math.abs(diffDays) > 365) {
            timeStats.expired++;
          } else {
            timeStats.overdue++;
          }
        } else if (diffDays <= 3) {
          timeStats.urgent++;
        } else if (diffDays <= 7) {
          timeStats.warning++;
        } else {
          timeStats.onTime++;
        }
      } catch {
        timeStats.noDeadline++;
      }
    });

    // 責任設計師工作量（包含所有項目）
    const designerWorkload = projects.reduce((acc: any, project) => {
      project.責任設計.forEach(designer => {
        if (!acc[designer]) {
          acc[designer] = { total: 0, overdue: 0, urgent: 0, completed: 0, closed: 0 };
        }
        acc[designer].total++;

        // 統計已完成和已結案
        if (project.state === '已完成') {
          acc[designer].completed++;
        } else if (project.state === '已結案') {
          acc[designer].closed++;
        }

        if (project.進廠時間) {
          try {
            const productionDate = new Date(project.進廠時間);
            if (!isNaN(productionDate.getTime())) {
              const diffDays = Math.ceil((productionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) {
                acc[designer].overdue++;
              } else if (diffDays <= 3) {
                acc[designer].urgent++;
              }
            }
          } catch {
            // 日期解析失敗，不計入逾期或緊急
          }
        }
      });
      return acc;
    }, {});

    // 責任編輯工作量（包含所有項目）
    const editorWorkload = projects.reduce((acc: any, project) => {
      project.責任編輯.forEach(editor => {
        if (!acc[editor]) {
          acc[editor] = { total: 0, overdue: 0, urgent: 0, completed: 0, closed: 0 };
        }
        acc[editor].total++;

        // 統計已完成和已結案
        if (project.state === '已完成') {
          acc[editor].completed++;
        } else if (project.state === '已結案') {
          acc[editor].closed++;
        }

        if (project.進廠時間) {
          try {
            const productionDate = new Date(project.進廠時間);
            if (!isNaN(productionDate.getTime())) {
              const diffDays = Math.ceil((productionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) {
                acc[editor].overdue++;
              } else if (diffDays <= 3) {
                acc[editor].urgent++;
              }
            }
          } catch {
            // 日期解析失敗，不計入逾期或緊急
          }
        }
      });
      return acc;
    }, {});

    return NextResponse.json({
      total: projects.length,
      stateStats,
      statusStats,
      typeStats,
      timeStats,
      designerWorkload,
      editorWorkload,
    });
  } catch (error) {
    console.error('Error in annual stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual stats' },
      { status: 500 }
    );
  }
}
