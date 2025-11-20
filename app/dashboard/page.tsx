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
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 terminal-glow p-6 bg-black border border-green-500">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-3 block flex items-center font-mono">
            <span className="mr-2">←</span> <span className="animate-glow-pulse">[RETURN_TO_MAIN_TERMINAL]</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">
            <Activity className="inline-block w-10 h-10 mr-3" />
            &gt; ACTIVITY_DASHBOARD.EXE
          </h1>
          <p className="text-green-400 font-mono text-sm">
            <span className="animate-blink">█</span> Real-time activity monitoring and analytics...
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-1 terminal-text">247</h3>
            <p className="text-green-400 font-mono text-sm">ACTIVITIES_TODAY</p>
          </div>

          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-700 font-mono border border-green-700 px-2 py-1">PEAK: 2-4PM</span>
            </div>
            <h3 className="text-3xl font-bold mb-1 terminal-text">6.2h</h3>
            <p className="text-green-400 font-mono text-sm">ACTIVE_TIME</p>
          </div>

          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-400 font-mono border border-green-400 px-2 py-1">+12%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1 terminal-text">1,547</h3>
            <p className="text-green-400 font-mono text-sm">THIS_WEEK</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-black border border-green-500 p-6 terminal-glow">
          <h2 className="text-2xl font-bold mb-6 terminal-text font-mono">&gt;&gt; RECENT_ACTIVITY_LOG</h2>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-black border border-green-700 hover:border-green-400 transition-colors">
                <div className={`w-10 h-10 border flex items-center justify-center ${
                  activity.type === 'clipboard' ? 'border-green-400 text-green-400' :
                  activity.type === 'terminal' ? 'border-green-400 text-green-400' :
                  'border-green-400 text-green-400'
                }`}>
                  {activity.type === 'clipboard' ? '📋' :
                   activity.type === 'terminal' ? '⌨️' : '🌐'}
                </div>
                <div className="flex-1">
                  <p className="text-sm terminal-text font-mono">{activity.desc}</p>
                  <p className="text-xs text-green-700 mt-1 font-mono">[{formatTime(activity.time)}]</p>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-green-700 mx-auto mb-4" />
              <p className="text-green-400 font-mono">[!] NO_RECENT_ACTIVITY</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-green-700 text-sm font-mono">
            [SYSTEM_MESSAGE] Activity monitoring active | Data encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
