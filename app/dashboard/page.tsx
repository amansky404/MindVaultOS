'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Load recent activities
    loadActivities();
  }, []);

  const loadActivities = async () => {
    // This would fetch from Electron IPC
    setActivities([
      { id: 1, type: 'clipboard', time: Date.now() - 300000, desc: 'Copied text snippet' },
      { id: 2, type: 'terminal', time: Date.now() - 600000, desc: 'Ran git commit' },
      { id: 3, type: 'browser', time: Date.now() - 900000, desc: 'Visited github.com' },
    ]);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Activity Dashboard</h1>
          <p className="text-slate-400">View your recent activity and timeline</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">247</h3>
            <p className="text-slate-400">Activities Today</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-slate-400">Peak: 2-4 PM</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">6.2h</h3>
            <p className="text-slate-400">Active Time</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">1,547</h3>
            <p className="text-slate-400">This Week</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'clipboard' ? 'bg-cyan-500/20 text-cyan-400' :
                  activity.type === 'terminal' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {activity.type === 'clipboard' ? '📋' :
                   activity.type === 'terminal' ? '⌨️' : '🌐'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{activity.desc}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatTime(activity.time)}</p>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
