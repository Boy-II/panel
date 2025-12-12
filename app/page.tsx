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

interface AnnualStats extends Stats {
  stateStats: Record<string, number>;
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [annualStats, setAnnualStats] = useState<AnnualStats | null>(null);
  const [showAnnual, setShowAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [projectsRes, statsRes, annualStatsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/stats'),
        fetch('/api/stats/annual'),
      ]);

      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();
      const annualStatsData = await annualStatsRes.json();

      setProjects(projectsData);
      setStats(statsData);
      setAnnualStats(annualStatsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/sync', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        // 同步成功，重新獲取資料
        await fetchData();
        alert(`✅ 同步成功！\n共同步 ${result.totalProjects} 個專案\n耗時 ${(result.durationMs / 1000).toFixed(2)} 秒`);
      } else {
        alert(`❌ 同步失敗：${result.error || result.message}`);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('❌ 同步失敗，請稍後再試');
    } finally {
      setSyncing(false);
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
                {showAnnual && <span className="ml-2 text-purple-600 font-medium">(年度統計模式)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnnual(!showAnnual)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showAnnual
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showAnnual ? '年度統計' : '當前統計'}
              </button>
              <button
                onClick={() => router.push('/personal')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <User size={18} />
                個人儀表板
              </button>
              <button
                onClick={syncData}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? '同步中...' : '同步資料'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計說明 */}
        {showAnnual && annualStats && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">年度統計說明</h3>
            <p className="text-sm text-purple-700">
              年度統計包含所有專案（含已結案、已完成），用於查看全年度的完整數據。
              {annualStats.stateStats && (
                <span className="ml-2">
                  狀態分布：
                  {Object.entries(annualStats.stateStats).map(([state, count]) => (
                    <span key={state} className="ml-2 font-medium">
                      {state}: {count}
                    </span>
                  ))}
                </span>
              )}
            </p>
          </div>
        )}

        {/* 統計卡片 */}
        {stats && annualStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title={showAnnual ? "總專案數（含已結案）" : "總專案數"}
                value={showAnnual ? annualStats.total : stats.total}
                icon={FolderKanban}
                color={showAnnual ? "purple" : "blue"}
              />
              <StatsCard
                title="逾期專案"
                value={showAnnual ? annualStats.timeStats.overdue : stats.timeStats.overdue}
                icon={AlertCircle}
                color="red"
                trend={
                  (showAnnual ? annualStats.timeStats.overdue : stats.timeStats.overdue) > 0
                    ? '需要立即處理'
                    : ''
                }
              />
              <StatsCard
                title="緊急專案 (3天內)"
                value={showAnnual ? annualStats.timeStats.urgent : stats.timeStats.urgent}
                icon={Clock}
                color="yellow"
                trend={
                  (showAnnual ? annualStats.timeStats.urgent : stats.timeStats.urgent) > 0
                    ? '即將到期'
                    : ''
                }
              />
              <StatsCard
                title="正常專案"
                value={showAnnual ? annualStats.timeStats.onTime : stats.timeStats.onTime}
                icon={CheckCircle2}
                color="green"
              />
            </div>

            {/* 圖表區域 */}
            <div className="mb-8">
              <Charts
                statusStats={showAnnual ? annualStats.statusStats : stats.statusStats}
                typeStats={showAnnual ? annualStats.typeStats : stats.typeStats}
                timeStats={showAnnual ? annualStats.timeStats : stats.timeStats}
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
