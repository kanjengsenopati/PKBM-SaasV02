import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { callRpc } from '../lib/rpc';

export default function ReportView({ tenantId }: { tenantId: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await callRpc('report', 'getReports', [tenantId]);
      if (res.success) setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat laporan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan</h2>
          <p className="text-slate-500">Unduh laporan akademik dan administratif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Laporan Kehadiran', 'Laporan Nilai', 'Laporan Keuangan', 'Data Siswa (Export)'].map((title, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-4">Generate laporan terbaru dalam format PDF atau Excel.</p>
            <button className="w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Unduh
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800">Riwayat Generate Laporan</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Nama Laporan</th>
              <th className="px-6 py-4">Dibuat Oleh</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada riwayat laporan.</td>
              </tr>
            ) : (
              reports.map((rpt) => (
                <tr key={rpt.id}>
                  <td className="px-6 py-4">{rpt.title || 'Laporan Umum'}</td>
                  <td className="px-6 py-4">Admin</td>
                  <td className="px-6 py-4">{new Date(rpt.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">Selesai</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
