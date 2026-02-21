import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Award, TrendingUp, Calendar, 
  Bell, Search, Menu, ChevronDown, LogOut, Settings,
  LayoutDashboard, FileText, UserCheck, Wallet, Database
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import StudentView from './components/StudentView';
import AcademicView from './components/AcademicView';
import FinanceView from './components/FinanceView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';
import TutorView from './components/TutorView';
import DatabaseSchemaView from './components/DatabaseSchemaView';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [tenantName, setTenantName] = useState('Loading...');
  const tenantId = 'pkbm-pena-hikmah'; // Hardcoded for now

  useEffect(() => {
    // Simulasi fetch tenant info
    setTimeout(() => setTenantName('PKBM Pena Hikmah'), 1000);
  }, []);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, component: <DashboardView tenantId={tenantId} tenantName={tenantName} /> },
    { label: 'Akademik', icon: BookOpen, component: <AcademicView tenantId={tenantId} /> },
    { label: 'Tenaga Pendidik', icon: UserCheck, component: <TutorView tenantId={tenantId} /> },
    { label: 'Kesiswaan', icon: Users, component: <StudentView tenantId={tenantId} /> },
    { label: 'Keuangan', icon: Wallet, component: <FinanceView tenantId={tenantId} /> },
    { label: 'Laporan', icon: FileText, component: <ReportView tenantId={tenantId} /> },
    { label: 'Database', icon: Database, component: <DatabaseSchemaView /> },
    { label: 'Pengaturan', icon: Settings, component: <SettingsView tenantId={tenantId} /> },
  ];

  const activeComponent = menuItems.find(item => item.label === activeMenu)?.component || <DashboardView tenantId={tenantId} tenantName={tenantName} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-slate-800 leading-tight">EduSaaS</h1>
                <p className="text-xs text-slate-500">PKBM Platform</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeMenu === item.label 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              } ${!isSidebarOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className={`w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari data siswa, kelas..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-800">Admin Utama</p>
                <p className="text-xs text-slate-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow-md"></div>
            </div>
          </div>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {activeComponent}
        </div>
      </main>
    </div>
  );
}
