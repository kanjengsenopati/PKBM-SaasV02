import React, { useEffect, useState } from 'react';
import { Settings, Save, Users, Shield } from 'lucide-react';
import { callRpc } from '../lib/rpc';
import UserManagementView from './UserManagementView';
import RBACMatrixView from './RBACMatrixView';

export default function SettingsView({ tenantId }: { tenantId: string }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, users, rbac

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await callRpc('tenant', 'getTenantProfile', [tenantId]);
        if (res.success) setTenant(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenantId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
          <p className="text-slate-500">Kelola profil lembaga, pengguna, dan hak akses</p>
        </div>
        {activeTab === 'profile' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Profil Lembaga
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Manajemen User
        </button>
        <button 
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'rbac' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Matrix Akses (RBAC)
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Profil Umum
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lembaga</label>
              <input 
                type="text" 
                defaultValue={tenant?.name}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NPSN</label>
              <input 
                type="text" 
                defaultValue={tenant?.npsn}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea 
                defaultValue={tenant?.address}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Yayasan</label>
              <input 
                type="text" 
                defaultValue={tenant?.foundationName}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kepala Sekolah</label>
              <input 
                type="text" 
                defaultValue={tenant?.principalName}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagementView tenantId={tenantId} />}
      
      {activeTab === 'rbac' && <RBACMatrixView />}
    </div>
  );
}
