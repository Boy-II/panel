'use client';

import { useState, useMemo } from 'react';
import { Search, AlertCircle, Clock, CheckCircle2, X } from 'lucide-react';

interface Project {
  id: string;
  專案名稱: string;
  單元名稱: string;
  專案型態: string[];
  責任編輯: string[];
  責任設計: string[];
  通知狀態: string;
  工作執行區間: { start: string | null; end: string | null } | null;
  進廠時間: string;
  色稿時間: string;
  timeStatus: string;
  daysRemaining: number | null;
  最後更新時間: string;
}

interface ProjectTableProps {
  projects: Project[];
}

export default function ProjectTable({ projects }: ProjectTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [closingProjects, setClosingProjects] = useState<Set<string>>(new Set());

  // 獲取所有唯一的專案型態
  const projectTypes = useMemo(() => {
    const types = new Set<string>();
    projects.forEach(p => p.專案型態.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [projects]);

  // 過濾專案
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // 雙重保險：排除已結案和已完成的專案（資料庫層級已過濾）
      const state = (project as any).state || '進行中';
      if (state === '已結案' || state === '已完成') {
        return false;
      }

      const matchSearch =
        project.專案名稱.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.責任編輯.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.責任設計.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || project.通知狀態 === statusFilter;
      const matchType = typeFilter === 'all' || project.專案型態.includes(typeFilter);
      const matchTime = timeFilter === 'all' || project.timeStatus === timeFilter;

      return matchSearch && matchStatus && matchType && matchTime;
    });
  }, [projects, searchTerm, statusFilter, typeFilter, timeFilter]);

  // 處理結案
  const handleCloseProject = async (projectId: string) => {
    if (!confirm('確定要將此專案標記為已結案嗎？')) {
      return;
    }

    setClosingProjects(prev => new Set(prev).add(projectId));

    try {
      const response = await fetch('/api/projects/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('結案失敗');
      }

      // 刷新頁面以更新資料
      window.location.reload();
    } catch (error) {
      console.error('結案錯誤:', error);
      alert('結案失敗，請稍後再試');
      setClosingProjects(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const getTimeStatusBadge = (status: string, days: number | null, projectId: string) => {
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <AlertCircle size={14} />
          已過期 ({days ? Math.abs(days) : 0} 天)
        </span>
      );
    }
    if (status === 'overdue') {
      const isClosing = closingProjects.has(projectId);
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle size={14} />
            逾期 {days ? Math.abs(days) : 0} 天
          </span>
          <button
            onClick={() => handleCloseProject(projectId)}
            disabled={isClosing}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <X size={14} />
            {isClosing ? '處理中...' : '是否結案'}
          </button>
        </div>
      );
    }
    if (status === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock size={14} />
          剩餘 {days} 天
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={14} />
          剩餘 {days} 天
        </span>
      );
    }
    if (status === 'on-time') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 size={14} />
          正常
        </span>
      );
    }
    return <span className="text-gray-500 text-xs">無截止日期</span>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">專案列表</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜尋 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋專案、編輯、設計..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 通知狀態篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">所有通知狀態</option>
            <option value="未通知">未通知</option>
            <option value="通知中">通知中</option>
            <option value="已通知">已通知</option>
          </select>

          {/* 專案型態篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">所有專案型態</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* 時間狀態篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">所有時間狀態</option>
            <option value="overdue">逾期</option>
            <option value="urgent">緊急 (3天內)</option>
            <option value="warning">警告 (7天內)</option>
            <option value="on-time">正常</option>
            <option value="expired">已過期 (超過365天)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">專案名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">單元名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">專案型態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">進廠時間</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">色稿時間</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">通知狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">責任設計</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">責任編輯</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  沒有找到符合條件的專案
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.專案名稱}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="max-w-xs line-clamp-2" title={project.單元名稱}>
                      {project.單元名稱 || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.專案型態.map((type, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTimeStatusBadge(project.timeStatus, project.daysRemaining, project.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.進廠時間 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.色稿時間 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      project.通知狀態 === '已通知' ? 'bg-green-100 text-green-800' :
                      project.通知狀態 === '通知中' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.通知狀態}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.責任設計.map((designer, idx) => (
                        <span key={idx} className="text-xs text-gray-700">
                          {designer}{idx < project.責任設計.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.責任編輯.map((editor, idx) => (
                        <span key={idx} className="text-xs text-gray-700">
                          {editor}{idx < project.責任編輯.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          顯示 {filteredProjects.length} / {projects.length} 個專案
        </p>
      </div>
    </div>
  );
}
