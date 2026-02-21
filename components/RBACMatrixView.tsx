import React, { useEffect, useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { callRpc } from '../lib/rpc';

export default function RBACMatrixView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await callRpc('rbacMatrix', 'getRBACData');
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(role: string, permissionId: string, currentStatus: boolean) {
    // Optimistic update
    const newData = { ...data };
    if (currentStatus) {
      newData.rolePermissions = newData.rolePermissions.filter((rp: any) => !(rp.role === role && rp.permissionId === permissionId));
    } else {
      newData.rolePermissions.push({ role, permissionId });
    }
    setData(newData);

    try {
      await callRpc('rbacMatrix', 'toggleRolePermission', [role, permissionId, !currentStatus]);
    } catch (err) {
      console.error(err);
      // Revert on error would be ideal here
      fetchData();
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat matriks akses...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data.</div>;

  const { permissions, rolePermissions, roles } = data;

  const hasPermission = (role: string, permId: string) => {
    return rolePermissions.some((rp: any) => rp.role === role && rp.permissionId === permId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 min-w-[200px]">Permission / Fitur</th>
                {roles.map((role: string) => (
                  <th key={role} className="px-6 py-4 text-center w-32">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((perm: any) => (
                <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{perm.name}</div>
                    <div className="text-xs text-slate-500">{perm.description}</div>
                  </td>
                  {roles.map((role: string) => {
                    const active = hasPermission(role, perm.id);
                    return (
                      <td key={role} className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(role, perm.id, active)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            active 
                              ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {active ? <Check className="w-5 h-5" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
