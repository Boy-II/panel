'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ChartsProps {
  statusStats: Record<string, number>;
  typeStats: Record<string, number>;
  timeStats: {
    overdue: number;
    urgent: number;
    warning: number;
    onTime: number;
    noDeadline: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  '未通知': '#94a3b8',
  '通知中': '#3b82f6',
  '已通知': '#10b981',
};

const TIME_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#6b7280'];

export default function Charts({ statusStats, typeStats, timeStats }: ChartsProps) {
  // 準備通知狀態圖表數據
  const statusData = Object.entries(statusStats).map(([name, value]) => ({
    name,
    value,
  }));

  // 準備時間狀態圖表數據
  const timeData = [
    { name: '逾期', value: timeStats.overdue },
    { name: '緊急 (3天內)', value: timeStats.urgent },
    { name: '警告 (7天內)', value: timeStats.warning },
    { name: '正常', value: timeStats.onTime },
    { name: '無截止日期', value: timeStats.noDeadline },
  ];

  // 準備專案型態圖表數據（只顯示前10個）
  const typeData = Object.entries(typeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 時間狀態分布 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">時間狀態分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={timeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {timeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TIME_COLORS[index % TIME_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 通知狀態分布 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">通知狀態分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 專案型態分布 */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-900 mb-4">專案型態分布（前10名）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
