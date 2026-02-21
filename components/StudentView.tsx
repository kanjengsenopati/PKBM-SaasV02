import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Trash2, Edit } from 'lucide-react';
import { callRpc } from '../lib/rpc';

interface Student {
  id: string;
  userName: string;
  nisn: string;
  program: string;
  status: string;
  createdAt: string;
}

export default function StudentView({ tenantId }: { tenantId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await callRpc('student', 'getStudents', [tenantId]);
      if (res.success) {
        setStudents(res.data);
      } else {
        setError(res.error || 'Gagal memuat data siswa');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data siswa...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Siswa</h2>
          <p className="text-slate-500">Kelola data siswa, pendaftaran, dan status akademik</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NISN..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none">
            <option>Semua Program</option>
            <option>Paket A</option>
            <option>Paket B</option>
            <option>Paket C</option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal Daftar</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Belum ada data siswa.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{student.userName || 'Tanpa Nama'}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{student.nisn || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                      {student.program || 'Umum'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(student.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-slate-200 rounded text-slate-500">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                        onClick={async () => {
                          if (confirm('Hapus siswa ini?')) {
                            await callRpc('student', 'deleteStudent', [student.id]);
                            fetchData();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
