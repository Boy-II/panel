'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, AlertCircle, Clock, CheckCircle2, RefreshCw, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import ProjectTable from '@/components/ProjectTable';
import Charts from '@/components/Charts';

interface Person {
  name: string;
  role: string;
}

interface PersonalData {
  person: string;
  projects: any[];
  stats: {
    total: number;
    overdue: number;
    urgent: number;
    warning: number;
    onTime: number;
    noDeadline: number;
    statusStats: Record<string, number>;
    typeStats: Record<string, number>;
    roleStats: Record<string, number>;
  };
}

export default function PersonalDashboard() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      setPeople(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching people:', error);
      setLoading(false);
    }
  };

  const fetchPersonalData = async (person: string) => {
    try {
      const res = await fetch(`/api/personal/${encodeURIComponent(person)}`);
      const data = await res.json();
      setPersonalData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching personal data:', error);
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/sync', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        // 同步成功，重新獲取資料
        if (selectedPerson) {
          await fetchPersonalData(selectedPerson);
        }
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

  const handlePersonChange = (person: string) => {
    setSelectedPerson(person);
    if (person) {
      fetchPersonalData(person);
    } else {
      setPersonalData(null);
    }
  };

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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                返回全局
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">個人專案儀表板</h1>
                {selectedPerson && (
                  <p className="text-sm text-gray-600 mt-1">
                    最後更新：{lastUpdate.toLocaleString('zh-TW')}
                  </p>
                )}
              </div>
            </div>
            {selectedPerson && (
              <button
                onClick={syncData}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? '同步中...' : '同步資料'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 人員選擇器 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <User className="text-blue-600" size={24} />
            <div className="flex-1">
              <label htmlFor="person-select" className="block text-sm font-medium text-gray-700 mb-2">
                選擇人員查看個人儀表板
              </label>
              <select
                id="person-select"
                value={selectedPerson}
                onChange={(e) => handlePersonChange(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- 請選擇人員 --</option>
                {people.map((person) => (
                  <option key={person.name} value={person.name}>
                    {person.name} ({person.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!selectedPerson && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <User className="mx-auto text-blue-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">請選擇人員</h3>
            <p className="text-gray-600">
              從上方選單中選擇設計師或編輯，查看他們的個人專案狀態和統計資訊
            </p>
          </div>
        )}

        {personalData && (
          <>
            {/* 個人資訊卡片 */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{personalData.person}</h2>
                  <p className="text-blue-100">
                    負責 {personalData.stats.total} 個專案
                    {Object.keys(personalData.stats.roleStats).length > 0 && (
                      <span className="ml-2">
                        ({Object.entries(personalData.stats.roleStats).map(([role, count]) => `${role}: ${count}`).join(', ')})
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-full">
                  <User size={40} />
                </div>
              </div>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="我的專案總數"
                value={personalData.stats.total}
                icon={FolderKanban}
                color="blue"
              />
              <StatsCard
                title="逾期專案"
                value={personalData.stats.overdue}
                icon={AlertCircle}
                color="red"
                trend={personalData.stats.overdue > 0 ? '需要立即處理' : ''}
              />
              <StatsCard
                title="緊急專案 (3天內)"
                value={personalData.stats.urgent}
                icon={Clock}
                color="yellow"
                trend={personalData.stats.urgent > 0 ? '即將到期' : ''}
              />
              <StatsCard
                title="正常專案"
                value={personalData.stats.onTime}
                icon={CheckCircle2}
                color="green"
              />
            </div>

            {/* 圖表區域 */}
            <div className="mb-8">
              <Charts
                statusStats={personalData.stats.statusStats}
                typeStats={personalData.stats.typeStats}
                timeStats={{
                  overdue: personalData.stats.overdue,
                  urgent: personalData.stats.urgent,
                  warning: personalData.stats.warning,
                  onTime: personalData.stats.onTime,
                  noDeadline: personalData.stats.noDeadline,
                }}
              />
            </div>

            {/* 專案列表 */}
            <ProjectTable projects={personalData.projects} />
          </>
        )}
      </main>
    </div>
  );
}
