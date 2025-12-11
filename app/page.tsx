'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, AlertCircle, Clock, CheckCircle2, RefreshCw, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import ProjectTable from '@/components/ProjectTable';
import Charts from '@/components/Charts';

interface Stats {
  total: number;
  statusStats: Record<string, number>;
  typeStats: Record<string, number>;
  timeStats: {
    overdue: number;
    urgent: number;
    warning: number;
    onTime: number;
    noDeadline: number;
  };
  designerWorkload: Record<string, { total: number; overdue: number; urgent: number }>;
  editorWorkload: Record<string, { total: number; overdue: number; urgent: number }>;
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [projectsRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/stats'),
      ]);

      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();

      setProjects(projectsData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 自動刷新：每60秒
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BWC 專案監控儀表板 - 全局視圖</h1>
              <p className="text-sm text-gray-600 mt-1">
                最後更新：{lastUpdate.toLocaleString('zh-TW')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/personal')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <User size={18} />
                個人儀表板
              </button>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                刷新資料
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="總專案數"
                value={stats.total}
                icon={FolderKanban}
                color="blue"
              />
              <StatsCard
                title="逾期專案"
                value={stats.timeStats.overdue}
                icon={AlertCircle}
                color="red"
                trend={stats.timeStats.overdue > 0 ? '需要立即處理' : ''}
              />
              <StatsCard
                title="緊急專案 (3天內)"
                value={stats.timeStats.urgent}
                icon={Clock}
                color="yellow"
                trend={stats.timeStats.urgent > 0 ? '即將到期' : ''}
              />
              <StatsCard
                title="正常專案"
                value={stats.timeStats.onTime}
                icon={CheckCircle2}
                color="green"
              />
            </div>

            {/* 圖表區域 */}
            <div className="mb-8">
              <Charts
                statusStats={stats.statusStats}
                typeStats={stats.typeStats}
                timeStats={stats.timeStats}
              />
            </div>
          </>
        )}

        {/* 專案表格 */}
        <ProjectTable projects={projects} />
      </main>
    </div>
  );
}
