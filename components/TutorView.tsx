import React, { useEffect, useState } from 'react';
import { UserCheck, Search, Plus, Trash2, Edit, Mail, Award, LayoutGrid, List, Eye, X, GraduationCap, MapPin, Phone, Calendar } from 'lucide-react';
import { callRpc } from '../lib/rpc';

interface Education {
  no: number;
  institution: string;
  major: string;
  year: string;
  degree: string;
}

interface Tutor {
  id: string;
  fullName: string;
  userName: string;
  userEmail: string;
  nuptk: string;
  specialization: string;
  status: string;
  createdAt: string;
  address?: string;
  birthPlace?: string;
  birthDate?: string;
  phoneNumber?: string;
  educationHistory?: Education[];
}

export default function TutorView({ tenantId }: { tenantId: string }) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nuptk: '',
    specialization: '',
    address: '',
    birthPlace: '',
    birthDate: '',
    phoneNumber: '',
    educationHistory: [] as Education[]
  });

  useEffect(() => {
    fetchTutors();
  }, [tenantId]);

  async function fetchTutors() {
    setLoading(true);
    try {
      const res = await callRpc('tutor', 'getTutors', [tenantId]);
      if (res.success) setTutors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTutor(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await callRpc('tutor', 'createTutor', [{ ...formData, tenantId }]);
      if (res.success) {
        setShowAddModal(false);
        resetForm();
        fetchTutors();
      } else {
        alert('Gagal menambah tutor: ' + res.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  }

  async function handleUpdateTutor(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTutor) return;
    try {
      const res = await callRpc('tutor', 'updateTutor', [selectedTutor.id, {
        fullName: formData.name,
        nuptk: formData.nuptk,
        specialization: formData.specialization,
        address: formData.address,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        phoneNumber: formData.phoneNumber,
        educationHistory: JSON.stringify(formData.educationHistory)
      }]);
      
      if (res.success) {
        setShowEditModal(false);
        setSelectedTutor(null);
        fetchTutors();
      } else {
        alert('Gagal update tutor: ' + res.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus data tutor ini secara permanen?')) return;
    try {
      const res = await callRpc('tutor', 'deleteTutor', [id]);
      if (res.success) fetchTutors();
      else alert('Gagal menghapus: ' + res.error);
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      nuptk: '',
      specialization: '',
      address: '',
      birthPlace: '',
      birthDate: '',
      phoneNumber: '',
      educationHistory: []
    });
  };

  const openEditModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      name: tutor.fullName || '',
      email: tutor.userEmail || '',
      nuptk: tutor.nuptk || '',
      specialization: tutor.specialization || '',
      address: tutor.address || '',
      birthPlace: tutor.birthPlace || '',
      birthDate: tutor.birthDate ? new Date(tutor.birthDate).toISOString().split('T')[0] : '',
      phoneNumber: tutor.phoneNumber || '',
      educationHistory: tutor.educationHistory || []
    });
    setShowEditModal(true);
  };

  const openDetailModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowDetailModal(true);
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      educationHistory: [
        ...formData.educationHistory,
        { no: formData.educationHistory.length + 1, institution: '', major: '', year: '', degree: '' }
      ]
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newHistory = [...formData.educationHistory];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setFormData({ ...formData, educationHistory: newHistory });
  };

  const removeEducation = (index: number) => {
    const newHistory = formData.educationHistory.filter((_, i) => i !== index);
    setFormData({ ...formData, educationHistory: newHistory });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data tutor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tenaga Pendidik</h2>
          <p className="text-slate-500">Kelola data tutor dan staf pengajar</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Tutor
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tambah Tutor Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTutor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NUPTK</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.nuptk}
                    onChange={e => setFormData({...formData, nuptk: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Spesialisasi</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.birthPlace}
                    onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. Telepon</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <textarea 
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Riwayat Pendidikan</label>
                  <button type="button" onClick={addEducation} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>
                {formData.educationHistory.map((edu, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-4">
                      <input 
                        placeholder="Nama Institusi"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.institution}
                        onChange={e => updateEducation(index, 'institution', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <input 
                        placeholder="Jurusan/Progdi"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.major}
                        onChange={e => updateEducation(index, 'major', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        placeholder="Tahun Lulus"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.year}
                        onChange={e => updateEducation(index, 'year', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <button type="button" onClick={() => removeEducation(index)} className="text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.educationHistory.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendidikan.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Data Tutor</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateTutor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    disabled
                    type="email" 
                    className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-500"
                    value={formData.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NUPTK</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.nuptk}
                    onChange={e => setFormData({...formData, nuptk: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Spesialisasi</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.birthPlace}
                    onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. Telepon</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <textarea 
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Riwayat Pendidikan</label>
                  <button type="button" onClick={addEducation} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>
                {formData.educationHistory.map((edu, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-4">
                      <input 
                        placeholder="Nama Institusi"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.institution}
                        onChange={e => updateEducation(index, 'institution', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <input 
                        placeholder="Jurusan/Progdi"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.major}
                        onChange={e => updateEducation(index, 'major', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        placeholder="Tahun Lulus"
                        className="w-full px-2 py-1 text-sm border rounded"
                        value={edu.year}
                        onChange={e => updateEducation(index, 'year', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <button type="button" onClick={() => removeEducation(index)} className="text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.educationHistory.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendidikan.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Detail Tutor</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                {selectedTutor.fullName?.charAt(0) || 'T'}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">{selectedTutor.fullName}</h4>
                <p className="text-slate-500">{selectedTutor.specialization || 'Umum'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">NUPTK</p>
                  <p className="font-medium text-slate-800">{selectedTutor.nuptk || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedTutor.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedTutor.status}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Email Akun</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="font-medium text-slate-800">{selectedTutor.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Tempat, Tanggal Lahir</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="font-medium text-slate-800">
                      {selectedTutor.birthPlace || '-'}, {selectedTutor.birthDate ? new Date(selectedTutor.birthDate).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">No. Telepon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <p className="font-medium text-slate-800">{selectedTutor.phoneNumber || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Alamat</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <p className="font-medium text-slate-800">{selectedTutor.address || '-'}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Riwayat Pendidikan
                </p>
                {selectedTutor.educationHistory && selectedTutor.educationHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedTutor.educationHistory.map((edu, idx) => (
                      <li key={idx} className="text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                        <div className="font-medium text-slate-800">{edu.institution}</div>
                        <div className="text-slate-500 text-xs flex justify-between">
                          <span>{edu.major} {edu.degree ? `(${edu.degree})` : ''}</span>
                          <span>Lulus: {edu.year}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">Tidak ada data pendidikan.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedTutor);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {tutor.fullName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{tutor.fullName}</h3>
                    <p className="text-xs text-slate-500">{tutor.specialization || 'Umum'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openDetailModal(tutor)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openEditModal(tutor)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    title="Edit Data"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(tutor.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {tutor.userEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  NUPTK: {tutor.nuptk || '-'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {tutor.phoneNumber || '-'}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutor.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tutor.status}
                </span>
                <span className="text-xs text-slate-400">
                  Bergabung {new Date(tutor.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Tutor</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">NUPTK</th>
                <th className="px-6 py-4">Spesialisasi</th>
                <th className="px-6 py-4">No. Telp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{tutor.fullName}</td>
                  <td className="px-6 py-4 text-slate-600">{tutor.userEmail}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{tutor.nuptk || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{tutor.specialization || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{tutor.phoneNumber || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutor.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tutor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openDetailModal(tutor)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(tutor)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tutor.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
