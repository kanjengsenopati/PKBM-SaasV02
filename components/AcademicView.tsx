import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Edit, FileText } from 'lucide-react';
import { callRpc } from '../lib/rpc';

export default function AcademicView({ tenantId }: { tenantId: string }) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects'); // subjects, lessons

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [subjRes, lsnRes] = await Promise.all([
        callRpc('academic', 'getSubjects', [tenantId]),
        callRpc('academic', 'getLessons', [tenantId])
      ]);
      
      if (subjRes.success) setSubjects(subjRes.data);
      if (lsnRes.success) setLessons(lsnRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data akademik...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Akademik</h2>
          <p className="text-slate-500">Kelola mata pelajaran, materi, dan kurikulum</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah {activeTab === 'subjects' ? 'Mapel' : 'Materi'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'subjects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Mata Pelajaran
        </button>
        <button 
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'lessons' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Materi Pelajaran
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'subjects' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {subjects.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500">Belum ada mata pelajaran.</div>
            ) : (
              subjects.map((subj) => (
                <div key={subj.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <button className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-800 mt-3">{subj.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">0 Materi • 0 Ujian</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Judul Materi</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada materi pelajaran.</td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {lesson.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {subjects.find(s => s.id === lesson.subjectId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(lesson.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:underline text-xs">Lihat</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
