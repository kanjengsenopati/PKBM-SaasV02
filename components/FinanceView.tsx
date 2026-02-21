import React, { useEffect, useState } from 'react';
import { Wallet, Plus, CheckCircle, XCircle } from 'lucide-react';
import { callRpc } from '../lib/rpc';

export default function FinanceView({ tenantId }: { tenantId: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await callRpc('finance', 'getPayments', [tenantId]);
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data keuangan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Keuangan</h2>
          <p className="text-slate-500">Monitor pembayaran SPP dan pemasukan lainnya</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />
          Catat Pembayaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Total Pemasukan (Bulan Ini)</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">Rp 0</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Menunggu Pembayaran</p>
          <h3 className="text-2xl font-bold text-orange-500 mt-2">Rp 0</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Tunggakan</p>
          <h3 className="text-2xl font-bold text-red-500 mt-2">Rp 0</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800">Riwayat Transaksi</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Siswa</th>
              <th className="px-6 py-4">Jenis Pembayaran</th>
              <th className="px-6 py-4">Jumlah</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada data transaksi.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {payment.studentName}
                    <div className="text-xs text-slate-400 font-mono">{payment.nisn}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{payment.type}</td>
                  <td className="px-6 py-4 font-mono font-medium">
                    Rp {Number(payment.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                      payment.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Tandai Lunas"
                          onClick={() => callRpc('finance', 'updatePaymentStatus', [payment.id, 'PAID']).then(fetchData)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Batalkan"
                          onClick={() => callRpc('finance', 'updatePaymentStatus', [payment.id, 'FAILED']).then(fetchData)}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
