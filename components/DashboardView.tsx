import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, BookOpen, UserCheck, Wallet, TrendingUp
} from 'lucide-react';
import { callRpc } from '../lib/rpc';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ label, value, trend, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3 mr-1" />
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

export default function DashboardView({ tenantId, tenantName }: { tenantId: string, tenantName: string }) {
  const [stats, setStats] = useState<any>({ userCount: 0, subjectCount: 0, lessonCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await callRpc('dashboard', 'getDashboardStats', [{ tenantId, role: 'ADMIN' }]); // Mock session object
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenantId]);

  const statCards = [
    { label: 'Total Siswa', value: stats.userCount?.toString() || '0', trend: '+0%', icon: Users, color: 'bg-blue-500' },
    { label: 'Mata Pelajaran', value: stats.subjectCount?.toString() || '0', trend: '+0%', icon: BookOpen, color: 'bg-violet-500' },
    { label: 'Materi', value: stats.lessonCount?.toString() || '0', trend: '+0', icon: UserCheck, color: 'bg-orange-500' },
    { label: 'Pendapatan', value: 'Rp 0', trend: '+0%', icon: Wallet, color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Selamat datang kembali di panel kontrol {tenantName}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              if (confirm('Apakah Anda yakin ingin melakukan sinkronisasi database?')) {
                try {
                  const res = await fetch('/api/migrate');
                  const data = await res.json();
                  if (data.success) {
                    alert('Database berhasil disinkronisasi!');
                    window.location.reload();
                  } else {
                    alert('Gagal sinkronisasi: ' + data.message);
                  }
                } catch (err) {
                  alert('Terjadi kesalahan saat menghubungi server.');
                }
              }
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Sync Database
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
            + Tambah Siswa
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Statistik Kehadiran</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0 cursor-pointer">
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Sen', hadir: 40, izin: 2 },
                { name: 'Sel', hadir: 30, izin: 1 },
                { name: 'Rab', hadir: 50, izin: 9 },
                { name: 'Kam', hadir: 28, izin: 3 },
                { name: 'Jum', hadir: 18, izin: 4 },
                { name: 'Sab', hadir: 23, izin: 3 },
              ]}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Area type="monotone" dataKey="hadir" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Aktivitas Terbaru</h3>
          <div className="space-y-6">
            <div className="text-center text-slate-400 text-sm py-8">Belum ada aktivitas.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
