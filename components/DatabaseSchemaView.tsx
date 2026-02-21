import React, { useEffect, useState } from 'react';
import { Database, Table, Columns, RefreshCw } from 'lucide-react';
import { callRpc } from '../lib/rpc';

interface ColumnInfo {
  column: string;
  type: string;
  nullable: string;
}

interface SchemaData {
  [tableName: string]: ColumnInfo[];
}

export default function DatabaseSchemaView() {
  const [schema, setSchema] = useState<SchemaData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const res = await callRpc('schema', 'getDatabaseSchema');
      if (res.success) {
        setSchema(res.data);
      } else {
        setError(res.error || 'Gagal memuat skema database');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat struktur database...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Struktur Database</h2>
          <p className="text-slate-500">Skema aktif NeonDB (PostgreSQL)</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(schema).map(([tableName, columns]) => (
          <div key={tableName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">{tableName}</h3>
              <span className="ml-auto text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
                {columns.length} columns
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2 w-1/3">Column</th>
                    <th className="px-4 py-2 w-1/3">Type</th>
                    <th className="px-4 py-2 w-1/3 text-right">Nullable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-700">{col.column}</td>
                      <td className="px-4 py-2 text-blue-600 font-mono text-xs">{col.type}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          col.nullable === 'YES' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {col.nullable}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
