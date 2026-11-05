import React, { useState, useEffect } from 'react';
import { 
  User, FileText, Users, DollarSign, LogOut, 
  CheckCircle, XCircle, AlertCircle, Calendar, 
  Edit3, Check, X, Shield, Upload, CreditCard, Eye, Plus, Trash2, LogIn
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Shared UI Components ---
const Badge = ({ children, type }) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || colors.default}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

const LogoPPNI = () => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 shrink-0 overflow-hidden">
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="85" y="45" width="30" height="110" fill="#047857" rx="5"/>
      <rect x="45" y="85" width="110" height="30" fill="#047857" rx="5"/>
      <path d="M100 65 C100 65 85 90 85 105 C85 115 92 122 100 122 C108 122 115 115 115 105 C115 90 100 65 100 65 Z" fill="#F59E0B"/>
    </svg>
  </div>
);

// --- Halaman Login ---
const LoginView = ({ onLoginSuccess, onGoToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const cleanInput = identifier.trim();
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`email.eq.${cleanInput},nira.eq.${cleanInput}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMessage('Akun tidak ditemukan. Pastikan Email atau NIRA yang Anda masukkan sudah benar.');
        return;
      }

      if (data.status_verifikasi !== 'aktif') {
        setErrorMessage('Akun Anda masih dalam status "Menunggu Verifikasi" atau "Dibekukan". Hubungi Admin DPK.');
        return;
      }

      onLoginSuccess(data);
    } catch (err) {
      setErrorMessage('Terjadi kendala saat login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <LogoPPNI />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">DPK PPNI RS Hermina Sukabumi</h2>
        <p className="mt-1 text-sm text-gray-500">Masuk untuk mengakses layanan keanggotaan dan keuangan</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="py-8 px-6 shadow-md sm:rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email atau NIRA</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="nama@email.com atau NIRA Anda"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
              />
              <p className="mt-1 text-[11px] text-gray-400">Gunakan email yang didaftarkan saat pendaftaran anggota.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'Memeriksa Data...' : 'Masuk ke Aplikasi'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-600 mb-2">Belum terdaftar sebagai anggota?</p>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Daftar Anggota Baru PPNI Disini &rarr;
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Halaman Beranda Anggota ---
const BerandaAnggota = ({ user, onOpenUpdateProfile }) => {
  const [userDues, setUserDues] = useState([]);
  const [filterYear, setFilterYear] = useState('2026');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [buktiUrlInput, setBuktiUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDues = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('anggota_id', user.id)
      .order('periode_bulan', { ascending: false });

    setUserDues(data || []);
  };

  useEffect(() => {
    fetchDues();
  }, [user]);

  const handleUploadBukti = async () => {
    if (!selectedPaymentId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status_pembayaran: 'menunggu_verifikasi',
          bukti_transfer: buktiUrlInput || 'https://placehold.co/400x500/e8f5e9/1b5e20?text=Bukti+Terlampir',
          tanggal_bayar: new Date().toISOString()
        })
        .eq('id', selectedPaymentId);

      if (error) throw error;

      alert('Bukti pembayaran berhasil dikirim! Menunggu konfirmasi bendahara.');
      setIsModalOpen(false);
      fetchDues();
    } catch (err) {
      alert('Gagal mengirim bukti: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const lunasCount = userDues.filter(i => i.status_pembayaran === 'lunas').length;
  const belumCount = userDues.filter(i => i.status_pembayaran === 'belum').length;

  return (
    <div className="space-y-6">
      <div className="bg-[#e8f5e9] p-4 rounded-lg">
        <p className="text-[#1b5e20] text-sm">
          <span className="font-semibold">Status Keanggotaan: {user.status_verifikasi}.</span> Selamat datang, {user.nama_lengkap}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-2 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Data Saya</h3>
          <div className="space-y-4">
            {[
              { label: 'Nama Lengkap', value: user.nama_lengkap },
              { label: 'NIRA', value: user.nira || '-' },
              { label: 'Nomor STR', value: user.no_str || '-' },
              { label: 'NRP', value: user.nrp || '-' },
              { label: 'Nomor SIP', value: user.no_sip || '-' },
              { label: 'SIP Berlaku s.d.', value: user.sip_berlaku || '-' },
              { label: 'No. WhatsApp', value: user.no_wa || '-' },
              { label: 'Email', value: user.email },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <p className="text-sm text-gray-500 col-span-1">{item.label}</p>
                <div className="text-sm font-medium text-gray-900 col-span-2 sm:col-span-3">{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 bg-emerald-50 border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-900 mb-2">Rekening Resmi Iuran</h4>
            <p className="font-mono text-lg font-bold text-gray-800">BNI 0792372089</p>
            <p className="text-xs text-gray-600 uppercase mt-0.5">a.n. DPK PPNI RS HERMINA SUKABUMI</p>
          </Card>
        </div>
      </div>

      <Card>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Iuran Anggota</h3>
          <span className="text-sm text-gray-500">{lunasCount} Lunas | {belumCount} Belum Bayar</span>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userDues.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                    Belum ada tagihan iuran yang dibuat oleh Bendahara.
                  </td>
                </tr>
              ) : (
                userDues.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.periode_bulan}</td>
                    <td className="px-4 py-3">Rp {item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <Badge type={item.status_pembayaran === 'lunas' ? 'success' : item.status_pembayaran === 'menunggu_verifikasi' ? 'warning' : 'danger'}>
                        {item.status_pembayaran}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.status_pembayaran === 'belum' && (
                        <button
                          onClick={() => {
                            setSelectedPaymentId(item.id);
                            setSelectedBulan(item.periode_bulan);
                            setIsModalOpen(true);
                          }}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700"
                        >
                          Konfirmasi Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Upload Bukti */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Konfirmasi Pembayaran ({selectedBulan})</h3>
            <p className="text-xs text-gray-500">Masukkan tautan foto/catatan bukti transfer perbankan Anda:</p>
            <input
              type="text"
              placeholder="https://link-foto-bukti-anda.com/..."
              value={buktiUrlInput}
              onChange={(e) => setBuktiUrlInput(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm border-gray-300"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm">Batal</button>
              <button
                onClick={handleUploadBukti}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
              >
                {loading ? 'Mengirim...' : 'Kirim Bukti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Halaman Pendaftaran Anggota Baru ---
const Pendaftaran = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nira: '',
    no_str: '',
    nrp: '',
    no_sip: '',
    sip_berlaku: '',
    no_wa: '',
    email: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) {
      alert('Silakan setujui pernyataan pengelolaan data pribadi terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('members').insert([
        {
          nama_lengkap: formData.nama_lengkap,
          nira: formData.nira || null,
          no_str: formData.no_str || null,
          nrp: formData.nrp || null,
          no_sip: formData.no_sip || null,
          sip_berlaku: formData.sip_berlaku || null,
          no_wa: formData.no_wa || null,
          email: formData.email,
          role: 'anggota',
          status_verifikasi: 'menunggu',
        }
      ]);

      if (error) throw error;

      alert('Pendaftaran berhasil diajukan! Data Anda telah terkirim dan sedang menunggu verifikasi Pengurus DPK.');
      if (onBackToLogin) onBackToLogin();
    } catch (err) {
      alert('Gagal mendaftar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pendaftaran Anggota PPNI</h2>
          <p className="text-gray-500 text-sm mt-1">Lengkapi data keperawatan Anda di RS Hermina Sukabumi</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Contoh: Ani Lestari, S.Kep., Ners"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">NIRA</label>
              <input
                type="text"
                name="nira"
                value={formData.nira}
                onChange={handleChange}
                placeholder="Kosongkan jika belum ada"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nomor STR</label>
              <input
                type="text"
                name="no_str"
                value={formData.no_str}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">NRP Pegawai</label>
              <input
                type="text"
                name="nrp"
                value={formData.nrp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nomor SIP</label>
              <input
                type="text"
                name="no_sip"
                value={formData.no_sip}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SIP Berlaku s.d.</label>
              <input
                type="date"
                name="sip_berlaku"
                value={formData.sip_berlaku}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">No. WhatsApp</label>
              <input
                type="tel"
                name="no_wa"
                value={formData.no_wa}
                onChange={handleChange}
                placeholder="08123456789"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Email (Digunakan Login) *</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            Saya menyatakan data yang saya isi adalah sah dan benar.
          </label>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {onBackToLogin && (
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                &larr; Kembali ke Layar Login
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${
                loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'Mengirim Data...' : 'Ajukan Pendaftaran'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- Halaman Panel Admin ---
const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState('verifikasi');
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const { error } = await supabase
      .from('members')
      .update({ status_verifikasi: status })
      .eq('id', id);

    if (error) alert(error.message);
    else {
      alert(`Anggota berhasil di-${status === 'aktif' ? 'setujui' : 'tolak'}!`);
      fetchMembers();
    }
  };

  const handleUpdateRole = async (id, role) => {
    const { error } = await supabase
      .from('members')
      .update({ role })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchMembers();
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus ${nama}?`)) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      alert('Data terhapus!');
      fetchMembers();
    }
  };

  const pendingList = members.filter(m => m.status_verifikasi === 'menunggu');
  const activeList = members.filter(m => m.status_verifikasi === 'aktif' && (
    (m.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.nira || '').includes(search)
  ));

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('verifikasi')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'verifikasi' ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-600'
          }`}
        >
          Verifikasi Pendaftaran ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'database' ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-600'
          }`}
        >
          Database Anggota Aktif ({activeList.length})
        </button>
      </div>

      {activeTab === 'verifikasi' ? (
        <Card>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Antrean Verifikasi Pendaftar</h3>
            <button onClick={fetchMembers} className="text-xs bg-gray-100 p-2 rounded">Segarkan</button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600 text-xs uppercase">
                  <th className="py-2">Nama</th>
                  <th className="py-2">NIRA</th>
                  <th className="py-2">STR / SIP</th>
                  <th className="py-2">Email</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {pendingList.length === 0 ? (
                  <tr><td colSpan="5" className="py-6 text-center text-gray-400">Tidak ada antrean pendaftar baru.</td></tr>
                ) : (
                  pendingList.map(item => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium">{item.nama_lengkap}</td>
                      <td className="py-3">{item.nira || '-'}</td>
                      <td className="py-3">{item.no_str || item.no_sip || '-'}</td>
                      <td className="py-3">{item.email}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'aktif')}
                          className="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-700"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'dibekukan')}
                          className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1 rounded hover:bg-red-100"
                        >
                          Tolak
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4 border-b flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Cari Nama / NIRA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded text-sm w-64"
            />
            <button onClick={fetchMembers} className="text-xs bg-gray-100 p-2 rounded">Segarkan</button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600 text-xs uppercase">
                  <th className="py-2">Nama Lengkap</th>
                  <th className="py-2">NIRA</th>
                  <th className="py-2">Role Akses</th>
                  <th className="py-2 text-right">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {activeList.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium">{item.nama_lengkap}</td>
                    <td className="py-3">{item.nira || '-'}</td>
                    <td className="py-3">
                      <select
                        value={item.role}
                        onChange={(e) => handleUpdateRole(item.id, e.target.value)}
                        className="text-xs border p-1 rounded font-semibold bg-gray-50"
                      >
                        <option value="anggota">Anggota</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.nama_lengkap)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// --- Halaman Panel Bendahara ---
const PanelBendahara = () => {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseNominal, setNewExpenseNominal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    const { data: payData } = await supabase
      .from('payments')
      .select('*, members(nama_lengkap, nira)')
      .order('created_at', { ascending: false });

    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .order('tanggal', { ascending: false });

    setPayments(payData || []);
    setExpenses(expData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPay = async (id) => {
    const { error } = await supabase
      .from('payments')
      .update({ status_pembayaran: 'lunas', tanggal_bayar: new Date().toISOString() })
      .eq('id', id);

    if (error) alert(error.message);
    else {
      alert('Iuran berhasil dikonfirmasi Lunas!');
      fetchData();
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert([
      { deskripsi: newExpenseDesc, nominal: parseInt(newExpenseNominal) }
    ]);

    if (error) alert(error.message);
    else {
      alert('Pengeluaran berhasil dicatat!');
      setIsModalOpen(false);
      setNewExpenseDesc('');
      setNewExpenseNominal('');
      fetchData();
    }
  };

  const totalMasuk = payments.filter(p => p.status_pembayaran === 'lunas').reduce((a, b) => a + (b.nominal || 0), 0);
  const totalKeluar = expenses.reduce((a, b) => a + (b.nominal || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Iuran Lunas" value={`Rp ${totalMasuk.toLocaleString('id-ID')}`} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
        <StatCard title="Total Pengeluaran Kas" value={`Rp ${totalKeluar.toLocaleString('id-ID')}`} icon={XCircle} colorClass="bg-red-100 text-red-600" />
        <StatCard title="Sisa Saldo Kas" value={`Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}`} icon={DollarSign} colorClass="bg-blue-100 text-blue-600" />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus size={16} /> Catat Pengeluaran
        </button>
      </div>

      <Card>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Verifikasi Iuran Anggota</h3>
          <button onClick={fetchData} className="text-xs bg-gray-100 p-2 rounded">Segarkan</button>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600 text-xs uppercase">
                <th className="py-2">Nama Anggota</th>
                <th className="py-2">Periode</th>
                <th className="py-2">Nominal</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-800">
              {payments.length === 0 ? (
                <tr><td colSpan="5" className="py-6 text-center text-gray-400">Belum ada data pembayaran iuran.</td></tr>
              ) : (
                payments.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium">{item.members?.nama_lengkap || 'Anggota'}</td>
                    <td className="py-3">{item.periode_bulan}</td>
                    <td className="py-3">Rp {item.nominal.toLocaleString('id-ID')}</td>
                    <td className="py-3">
                      <Badge type={item.status_pembayaran === 'lunas' ? 'success' : item.status_pembayaran === 'menunggu_verifikasi' ? 'warning' : 'danger'}>
                        {item.status_pembayaran}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {item.status_pembayaran === 'menunggu_verifikasi' && (
                        <button
                          onClick={() => handleConfirmPay(item.id)}
                          className="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-700"
                        >
                          Konfirmasi Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddExpense} className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900">Catat Pengeluaran Kas</h3>
            <input
              type="text"
              required
              placeholder="Keterangan pengeluaran"
              value={newExpenseDesc}
              onChange={(e) => setNewExpenseDesc(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
            <input
              type="number"
              required
              placeholder="Nominal (Rp)"
              value={newExpenseNominal}
              onChange={(e) => setNewExpenseNominal(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border text-xs rounded">Batal</button>
              <button type="submit" className="px-3 py-1.5 bg-red-600 text-white text-xs rounded">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- Komponen Utama Aplikasi ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ppni_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeView, setActiveView] = useState('anggota');
  const [showRegisterView, setShowRegisterView] = useState(false);

  useEffect(() => {
    document.title = "Dashboard PPNI - RS Hermina Sukabumi";
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('ppni_user_session', JSON.stringify(userData));
    setActiveView('anggota');
  };

  const handleLogout = () => {
    localStorage.removeItem('ppni_user_session');
    setCurrentUser(null);
    setShowRegisterView(false);
  };

  // Jika belum login, tampilkan layar Login atau Form Pendaftaran Publik
  if (!currentUser) {
    if (showRegisterView) {
      return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <Pendaftaran onBackToLogin={() => setShowRegisterView(false)} />
        </div>
      );
    }
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setShowRegisterView(true)}
      />
    );
  }

  // Tentukan menu navigasi sesuai Hak Akses (Role)
  const navItems = [
    { id: 'anggota', label: 'Beranda Saya', icon: User, allowed: ['anggota', 'admin', 'bendahara'] },
    { id: 'pendaftaran', label: 'Form Pendaftaran', icon: FileText, allowed: ['anggota', 'admin', 'bendahara'] },
    { id: 'admin', label: 'Panel Admin', icon: Shield, allowed: ['admin'] },
    { id: 'bendahara', label: 'Panel Bendahara', icon: DollarSign, allowed: ['admin', 'bendahara'] },
  ].filter(item => item.allowed.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <LogoPPNI />
              <div>
                <span className="font-bold text-base sm:text-lg block leading-tight">PPNI RS Hermina Sukabumi</span>
                <span className="text-[11px] text-emerald-200 uppercase font-semibold">Dewan Pengurus Komisariat</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeView === item.id 
                      ? 'bg-emerald-900 text-white' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{currentUser.nama_lengkap}</div>
                <div className="text-xs text-emerald-300">
                  Peran: <span className="uppercase font-bold text-white">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar dari Akun"
                className="p-2 rounded-full hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeView === 'anggota' && <BerandaAnggota user={currentUser} />}
        {activeView === 'pendaftaran' && <Pendaftaran />}
        {activeView === 'admin' && currentUser.role === 'admin' && <PanelAdmin />}
        {activeView === 'bendahara' && ['admin', 'bendahara'].includes(currentUser.role) && <PanelBendahara />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} DPK PPNI RS Hermina Sukabumi. All rights reserved.
      </footer>
    </div>
  );
}