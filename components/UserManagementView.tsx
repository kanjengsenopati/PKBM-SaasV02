import React, { useEffect, useState } from 'react';
import { Users, Trash2, Shield, Edit } from 'lucide-react';
import { callRpc } from '../lib/rpc';

export default function UserManagementView({ tenantId }: { tenantId: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [tenantId]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await callRpc('userManagement', 'getUsers', [tenantId]);
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`Ubah role user ini menjadi ${newRole}?`)) return;
    try {
      const res = await callRpc('userManagement', 'updateUserRole', [userId, newRole]);
      if (res.success) {
        fetchUsers();
      } else {
        alert('Gagal mengubah role: ' + res.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Hapus user ini permanen?')) return;
    try {
      const res = await callRpc('userManagement', 'deleteUser', [userId]);
      if (res.success) {
        fetchUsers();
      } else {
        alert('Gagal menghapus user: ' + res.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data user...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Nama User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Terdaftar</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{user.name || 'Tanpa Nama'}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-slate-100 border-none rounded px-2 py-1 text-xs font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TUTOR">TUTOR</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
