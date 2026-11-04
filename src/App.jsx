import React, { useState, useEffect } from 'react';
import { 
  User, FileText, Users, DollarSign, LogOut, 
  CheckCircle, XCircle, AlertCircle, Calendar, 
  Edit3, Check, X, Shield, Upload, CreditCard, Eye, Plus, Download, FileDown
} from 'lucide-react';

// --- Komponen Proteksi Keamanan (Access Denied Screen) ---
const AccessDenied = ({ requiredRoles, currentRole, onBack }) => (
  <Card className="p-10 max-w-lg mx-auto text-center my-8 border-red-200 bg-red-50/30">
    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
      <Shield size={32} />
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
      Maaf, akun Anda saat ini login dengan hak akses <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{currentRole}</span>. 
      Halaman ini dilindungi sistem keamanan dan hanya dapat diakses oleh pengurus dengan peran <span className="font-bold text-emerald-800">{requiredRoles.join(' atau ')}</span>.
    </p>
    <button 
      onClick={onBack}
      className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
    >
      Kembali ke Beranda Anggota
    </button>
  </Card>
);

// --- Mock Data ---
const mockUser = {
  name: "Ani Lestari (contoh)",
  nira: "[NIRA]",
  str: "[No. STR]",
  strExpiry: "Seumur Hidup",
  nrp: "[NRP]",
  sip: "[Nomor SIP]",
  sipExpiry: "[Tanggal]",
  phone: "[No. HP]",
  email: "[email]",
};

// Hapus mockIuran dan mockTreasurerDues, ganti dengan data terpusat (initialDues)
const initialDues = [
  // Data iuran Ani Lestari (Member 1)
  { id: 1, memberId: 1, name: "Ani Lestari (contoh)", month: "September 2026", nominal: 25000, status: "Lunas", date: "15-09-2026", action: "none" },
  { id: 2, memberId: 1, name: "Ani Lestari (contoh)", month: "Oktober 2026", nominal: 25000, status: "Lunas", date: "10-10-2026", action: "none" },
  { id: 3, memberId: 1, name: "Ani Lestari (contoh)", month: "November 2026", nominal: 25000, status: "Belum", date: "-", action: "remind", isReminded: false },
  
  // Data iuran anggota lain (Hanya terlihat di Bendahara)
  { id: 301, memberId: 2, name: "Budi Santoso, S.Kep., Ners", month: "November 2026", nominal: 25000, status: "Lunas", date: "05-11-2026", action: "none" },
  { id: 302, memberId: 3, name: "Rina Wati, Ners", month: "November 2026", nominal: 25000, status: "Menunggu", date: "Menunggu verifikasi...", action: "confirm", buktiUrl: "https://placehold.co/400x500/e8f5e9/1b5e20?text=Bukti+Transfer\nRp25.000" },
  { id: 303, memberId: 4, name: "Dewi Lestari, Amd.Kep", month: "November 2026", nominal: 25000, status: "Belum", date: "-", action: "remind", isReminded: false },
];

const initialExpenses = [
  { id: 1, desc: "Konsumsi Rapat Pengurus DPK", nominal: 150000, date: "05-11-2026" }
];

const mockPendingMembers = [
  { 
    id: 101, name: "Siti Aminah, Amd.Kep", nira: "-", date: "03-11-2026",
    str: "1101522019998888", strExpiry: "Seumur Hidup", nrp: "199001012019032015", sip: "440/123/SIP-B/XI/2023",
    sipExpiry: "15-12-2027", phone: "081234567890", email: "siti.aminah@email.com",
    commission: "RSUD Kota Bekasi"
  },
  { 
    id: 102, name: "Agus Riyanto, S.Kep", nira: "31710123456", date: "04-11-2026",
    str: "1101522020009999", strExpiry: "20-01-2028", nrp: "199202022020121010", sip: "440/456/SIP-P/XI/2023",
    sipExpiry: "20-01-2028", phone: "081987654321", email: "agus.r@email.com",
    commission: "Puskesmas Bekasi Timur"
  },
];

const mockAllMembers = [
  { id: 1, name: "Ani Lestari (contoh)", nira: "31710987111", role: "Anggota", status: "Aktif" },
  { id: 2, name: "Budi Santoso, S.Kep., Ners", nira: "31710987222", role: "Admin", status: "Aktif" },
  { id: 3, name: "Rina Wati, Ners", nira: "31710987654", role: "Bendahara", status: "Aktif" },
  { id: 4, name: "Dewi Lestari, Amd.Kep", nira: "31710555666", role: "Anggota", status: "Aktif" },
];

const mockExpiringSTR = [
  { id: 201, name: "Rina Wati, Ners", nira: "31710987654", type: "STR", expiry: "15-11-2026", status: "Kritis" },
  { id: 202, name: "Dewi Lestari, Amd.Kep", nira: "31710555666", type: "SIP", expiry: "01-12-2026", status: "Peringatan" },
];

const mockTreasurerDues = [
  { id: 301, name: "Budi Santoso, S.Kep., Ners", month: "November 2026", nominal: 25000, status: "Lunas", action: "none" },
  { id: 302, name: "Rina Wati, Ners", month: "November 2026", nominal: 25000, status: "Menunggu", action: "confirm" },
  { id: 303, name: "Dewi Lestari, Amd.Kep", month: "November 2026", nominal: 25000, status: "Belum", action: "remind" },
];

// --- Shared Components ---
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

// Komponen Logo PPNI (Vektor SVG Bertema Keperawatan)
const LogoPPNI = () => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 shrink-0 overflow-hidden">
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      {/* Palang Hijau */}
      <rect x="85" y="45" width="30" height="110" fill="#047857" rx="5"/>
      <rect x="45" y="85" width="110" height="30" fill="#047857" rx="5"/>
      {/* Api / Lentera Florence Nightingale */}
      <path d="M100 65 C100 65 85 90 85 105 C85 115 92 122 100 122 C108 122 115 115 115 105 C115 90 100 65 100 65 Z" fill="#F59E0B"/>
    </svg>
  </div>
);

// --- Views ---

const BerandaAnggota = ({ iuranData, onUploadBukti }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterYear, setFilterYear] = useState('2026'); // State baru untuk filter tahun iuran
  
  const handleKonfirmasi = (bulan, id) => {
    setSelectedBulan(bulan);
    setSelectedId(id);
    setSelectedFile(null); // Kosongkan file sebelumnya jika ada
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitBukti = () => {
    if (!selectedFile) return;
    
    // Panggil fungsi dari parent (App) dengan mengirim id dan file yang dipilih
    onUploadBukti(selectedId, selectedFile);
    setIsModalOpen(false); // Tutup modal setelah berhasil
  };

  // Filter data iuran berdasarkan tahun yang dipilih
  const filteredIuran = filterYear === 'Semua Tahun' 
    ? iuranData 
    : iuranData.filter(i => i.month.includes(filterYear));

  // Menghitung jumlah lunas dan belum untuk ringkasan sesuai filter
  const lunasCount = filteredIuran.filter(i => i.status === 'Lunas').length;
  const belumCount = filteredIuran.filter(i => i.status === 'Belum').length;
  const remindedDues = iuranData.filter(i => i.status === 'Belum' && i.isReminded);

  return (
    <div className="space-y-6">
      {/* Banner Status */}
      <div className="bg-[#e8f5e9] p-4 rounded-lg">
        <p className="text-[#1b5e20] text-sm">
          <span className="font-semibold">Status Keanggotaan: Aktif.</span> Kamu hanya bisa melihat data milikmu sendiri.
        </p>
      </div>

      {/* Banner Reminder dari Bendahara (Otomatis Muncul) */}
      {remindedDues.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-orange-900">Peringatan Tagihan Iuran</h4>
            <p className="text-sm text-orange-800 mt-1">
              Bendahara telah mengirimkan pengingat. Anda memiliki tunggakan iuran bulan <span className="font-bold">{remindedDues.map(d => d.month).join(', ')}</span>. Harap segera melakukan pelunasan agar status anggota tetap aktif.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Card Data Saya */}
        <Card className="md:col-span-2 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Data Saya</h3>
          
          <div className="space-y-4">
            {[
              { label: 'Nama', value: mockUser.name },
              { label: 'NIRA', value: mockUser.nira },
              { label: 'No. STR', value: mockUser.str },
              { 
                label: 'STR berlaku s.d.', 
                value: mockUser.strExpiry === 'Seumur Hidup' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">Seumur Hidup</span>
                ) : (
                  mockUser.strExpiry
                ) 
              },
              { label: 'NRP', value: mockUser.nrp },
              { label: 'No. SIP', value: mockUser.sip },
              { 
                label: 'SIP berlaku s.d.', 
                value: (
                  <div className="flex items-center gap-2">
                    <span>{mockUser.sipExpiry}</span>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-medium">58 hari lagi</span>
                  </div>
                ) 
              },
              { label: 'No. HP', value: mockUser.phone },
              { label: 'Email', value: mockUser.email },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <p className="text-sm text-gray-500 col-span-1">{item.label}</p>
                <div className="text-sm font-medium text-gray-900 col-span-2 sm:col-span-3">{item.value}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-8 leading-relaxed">
            Salah tulis? Buka "Perbarui data saya" untuk membetulkan. Mengubah nama, NIRA, STR, atau NRP membuat status kembali menunggu verifikasi admin. Email dipakai untuk login.
          </p>
        </Card>

        {/* Card Perbarui Data */}
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-emerald-500 hover:shadow-md transition-all group">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">Perbarui Data Saya</h3>
        </button>
      </div>

      {/* Card Iuran Saya */}
      <Card>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Iuran Saya</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tahun</span>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-1.5 pl-3 pr-8 border"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="Semua Tahun">Semua Tahun</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            {filterYear === 'Semua Tahun' ? 'Semua Periode' : `Tahun ${filterYear}`}: {lunasCount} bulan lunas, {belumCount} bulan belum dibayar
          </p>
          
          {/* Blok Informasi Pembayaran Bank */}
          <div className="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-100 flex items-start gap-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 shrink-0 mt-1">
              <CreditCard size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 mb-1">Instruksi Pembayaran Iuran</h4>
              <p className="text-sm text-emerald-800 mb-2">
                Silakan transfer nominal iuran Anda ke rekening resmi bendahara PPNI berikut:
              </p>
              <div className="bg-white px-3 py-2 rounded border border-emerald-200 inline-block">
                <p className="font-mono text-lg font-bold text-gray-800">BNI 0792372089</p>
                <p className="text-xs text-gray-500 uppercase mt-0.5">a.n. DPK PPNI RS HERMINA SUKABUMI</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-900 border-b-2 border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-bold">Bulan</th>
                  <th className="px-4 py-3 font-bold">Nominal</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Tanggal Bayar</th>
                  <th className="px-4 py-3 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIuran.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Tidak ada riwayat iuran untuk tahun {filterYear}.</td>
                  </tr>
                ) : (
                  filteredIuran.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">{item.month}</td>
                      <td className="px-4 py-4">Rp {item.nominal.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-4">
                        <Badge type={item.status === 'Lunas' ? 'success' : item.status === 'Menunggu' ? 'warning' : 'danger'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs sm:text-sm">{item.date}</td>
                      <td className="px-4 py-4 text-right">
                        {item.status === 'Belum' && (
                          <button 
                            onClick={() => handleKonfirmasi(item.month, item.id)}
                            className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                          >
                            <Upload size={14} /> Konfirmasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal Upload Bukti Pembayaran */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Konfirmasi Pembayaran</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Unggah bukti transfer untuk iuran periode <span className="font-bold text-gray-900">{selectedBulan}</span>.
              </p>
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                <Upload className="text-gray-400 mb-2" size={32} />
                <span className="text-sm font-medium text-emerald-700">
                  {selectedFile ? selectedFile.name : 'Pilih File / Foto Bukti Transfer'}
                </span>
                <span className="text-xs text-gray-400 mt-1">Format JPG, PNG (Maks. 2MB)</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmitBukti}
                disabled={!selectedFile}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm transition-colors ${
                  selectedFile ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Kirim Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Pendaftaran = () => {
  const [isStrLifetime, setIsStrLifetime] = useState(false);
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Daftar Sebagai Anggota PPNI</h2>
          <p className="text-gray-500 mt-2">Silakan lengkapi formulir di bawah ini untuk pendaftaran anggota baru.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap & Gelar</label>
              <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Contoh: Ani Lestari, S.Kep., Ners" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIRA (Nomor Induk Registrasi Anggota)</label>
              <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Kosongkan jika belum punya" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor STR</label>
              <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Masukkan Nomor STR" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">STR Berlaku s.d.</label>
                <label className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isStrLifetime}
                    onChange={(e) => setIsStrLifetime(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Seumur Hidup
                </label>
              </div>
              <input 
                type="date" 
                disabled={isStrLifetime}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm ${isStrLifetime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NRP (Nomor Registrasi Pegawai)</label>
              <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Masukkan NRP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SIP</label>
              <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Masukkan Nomor SIP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SIP Berlaku s.d.</label>
              <input type="date" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WhatsApp</label>
              <input type="tel" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="Contoh: 081234567890" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email (Untuk Login)</label>
              <input type="email" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-sm" placeholder="nama@email.com" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-2">
            <p className="font-semibold text-gray-700">Pernyataan Persetujuan Data Pribadi:</p>
            <p>Dengan mendaftar, saya menyatakan bahwa data yang saya isi adalah benar dan memberikan persetujuan kepada pengurus DPK PPNI RS Hermina Sukabumi untuk mengelola data tersebut guna keperluan organisasi profesi.</p>
            <label className="flex items-center gap-2 pt-1 font-medium text-gray-800 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              Saya menyetujui pengelolaan data pribadi saya sebagaimana dijelaskan di atas.
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              Ajukan Pendaftaran
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [membersList, setMembersList] = useState(mockAllMembers);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleRoleChange = (id, newRole) => {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  const filteredMembers = membersList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.nira.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard & Ringkasan' },
          { id: 'verifikasi', label: `Verifikasi Pendaftaran (${mockPendingMembers.length})` },
          { id: 'database', label: 'Database Anggota' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Anggota Aktif" value={membersList.length} icon={Users} colorClass="bg-emerald-100 text-emerald-600" />
            <StatCard title="Menunggu Verifikasi" value={mockPendingMembers.length} icon={FileText} colorClass="bg-yellow-100 text-yellow-600" />
            <StatCard title="SIP Segera Habis" value={mockExpiringSTR.length} icon={AlertCircle} colorClass="bg-red-100 text-red-600" />
          </div>

          <Card>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Pemantauan Masa Berlaku STR & SIP</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nama Anggota</th>
                    <th className="px-6 py-3 font-medium">NIRA</th>
                    <th className="px-6 py-3 font-medium">Dokumen</th>
                    <th className="px-6 py-3 font-medium">Berlaku s.d.</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockExpiringSTR.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">{item.nira}</td>
                      <td className="px-6 py-4">{item.type}</td>
                      <td className="px-6 py-4">{item.expiry}</td>
                      <td className="px-6 py-4">
                        <Badge type={item.status === 'Kritis' ? 'danger' : 'warning'}>{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'verifikasi' && (
        <Card>
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Antrean Verifikasi Anggota Baru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Pendaftar</th>
                  <th className="px-6 py-3 font-medium">NIRA</th>
                  <th className="px-6 py-3 font-medium">No. STR</th>
                  <th className="px-6 py-3 font-medium">Tanggal Daftar</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockPendingMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 text-gray-500">{member.nira}</td>
                    <td className="px-6 py-4 text-gray-500">{member.str}</td>
                    <td className="px-6 py-4 text-gray-500">{member.date}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button 
                        onClick={() => handleOpenDetail(member)}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'database' && (
        <Card>
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800">Database Seluruh Anggota</h3>
            <input 
              type="text" 
              placeholder="Cari Nama atau NIRA..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Nama Lengkap</th>
                  <th className="px-6 py-3 font-medium">NIRA</th>
                  <th className="px-6 py-3 font-medium">Hak Akses (Role)</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 text-gray-500">{member.nira}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          member.role === 'Admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          member.role === 'Bendahara' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="Anggota">Anggota</option>
                        <option value="Bendahara">Bendahara</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type="success">{member.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-emerald-600 p-1">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Detail Pendaftaran */}
      {isDetailModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Detail Calon Anggota</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Nama Lengkap</p><p className="text-sm font-medium">{selectedCandidate.name}</p></div>
                <div><p className="text-xs text-gray-500">NIRA</p><p className="text-sm font-medium">{selectedCandidate.nira || '-'}</p></div>
                <div><p className="text-xs text-gray-500">No. STR</p><p className="text-sm font-medium">{selectedCandidate.str}</p></div>
                <div>
                  <p className="text-xs text-gray-500">STR Berlaku s.d.</p>
                  <p className="text-sm font-medium">
                    {selectedCandidate.strExpiry === 'Seumur Hidup' ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Seumur Hidup</span>
                    ) : (
                      selectedCandidate.strExpiry
                    )}
                  </p>
                </div>
                <div><p className="text-xs text-gray-500">NRP</p><p className="text-sm font-medium">{selectedCandidate.nrp}</p></div>
                <div><p className="text-xs text-gray-500">No. SIP</p><p className="text-sm font-medium">{selectedCandidate.sip}</p></div>
                <div><p className="text-xs text-gray-500">SIP Berlaku s.d</p><p className="text-sm font-medium">{selectedCandidate.sipExpiry}</p></div>
                <div><p className="text-xs text-gray-500">No. HP / WA</p><p className="text-sm font-medium">{selectedCandidate.phone}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{selectedCandidate.email}</p></div>
                <div className="sm:col-span-2 mt-2 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                  Komisariat Tujuan: <strong>{selectedCandidate.commission}</strong>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium bg-white hover:bg-red-50 flex items-center gap-1.5"
              >
                <X size={16} /> Tolak Pendaftaran
              </button>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white shadow-sm transition-colors bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <Check size={16} /> Setujui & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PanelBendahara = ({ allDues, expenses, onConfirmPayment, onSendReminder, onAddExpense }) => {
  const [isBuktiModalOpen, setIsBuktiModalOpen] = useState(false);
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // State untuk filter periode
  const [filterMonth, setFilterMonth] = useState('Semua Bulan');
  const [filterYear, setFilterYear] = useState('2026');

  const monthOptions = ['Semua Bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const yearOptions = ['Semua Tahun', '2026', '2025'];

  const handleLihatBukti = (item) => {
    setSelectedBukti(item);
    setIsBuktiModalOpen(true);
  };

  const handleConfirmFromModal = () => {
    onConfirmPayment(selectedBukti.id);
    setIsBuktiModalOpen(false);
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if(expenseDesc && expenseAmount) {
      onAddExpense(expenseDesc, parseInt(expenseAmount));
      setIsExpenseModalOpen(false);
      setExpenseDesc('');
      setExpenseAmount('');
    }
  };

  // Logika Filter Data Iuran
  const filteredDues = allDues.filter(item => {
    const [itemMonth, itemYear] = item.month.split(' ');
    const matchMonth = filterMonth === 'Semua Bulan' || itemMonth === filterMonth;
    const matchYear = filterYear === 'Semua Tahun' || itemYear === filterYear;
    return matchMonth && matchYear;
  });

  // Logika Filter Data Pengeluaran
  const getMonthName = (monthStr) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[parseInt(monthStr, 10) - 1];
  };

  const filteredExpenses = expenses.filter(exp => {
    const [dd, mm, yyyy] = exp.date.split('-');
    const expMonthName = getMonthName(mm);
    const matchMonth = filterMonth === 'Semua Bulan' || expMonthName === filterMonth;
    const matchYear = filterYear === 'Semua Tahun' || yyyy === filterYear;
    return matchMonth && matchYear;
  });

  // Hitung metrik keuangan keseluruhan untuk Saldo Akhir Kas
  const globalPemasukan = allDues.filter(d => d.status === 'Lunas').reduce((acc, curr) => acc + curr.nominal, 0);
  const globalPengeluaran = expenses.reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoAwal = 15500000;
  const saldoAkhir = saldoAwal + (globalPemasukan * 10) - globalPengeluaran; // *10 hanya mock pengali agar masuk akal

  // Hitung metrik keuangan berdasarkan periode yang difilter
  const periodicPemasukan = filteredDues.filter(d => d.status === 'Lunas').reduce((acc, curr) => acc + curr.nominal, 0);
  const periodicPengeluaran = filteredExpenses.reduce((acc, curr) => acc + curr.nominal, 0);

  return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
      <h2 className="text-xl font-bold text-gray-800">Laporan Keuangan PPNI</h2>
      <div className="flex gap-3 w-full sm:w-auto">
        <select 
          value={filterMonth} 
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500 flex-1 sm:flex-none"
        >
          {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500 flex-1 sm:flex-none"
        >
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Saldo Awal Kas" value={`Rp ${saldoAwal.toLocaleString('id-ID')}`} icon={DollarSign} colorClass="bg-gray-100 text-gray-600" />
      <StatCard title="Pemasukan (Periode)" value={`Rp ${(periodicPemasukan * 10).toLocaleString('id-ID')}`} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
      <StatCard title="Pengeluaran (Periode)" value={`Rp ${periodicPengeluaran.toLocaleString('id-ID')}`} icon={XCircle} colorClass="bg-red-100 text-red-600" />
      <StatCard title="Total Saldo Akhir" value={`Rp ${saldoAkhir.toLocaleString('id-ID')}`} icon={Shield} colorClass="bg-blue-100 text-blue-600" />
    </div>

    {/* Tombol Aksi Bendahara */}
    <div className="flex justify-end">
      <button 
        onClick={() => setIsExpenseModalOpen(true)}
        className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 border border-red-200 transition-colors shadow-sm"
      >
        <Plus size={18} /> Catat Pengeluaran
      </button>
    </div>

    <Card>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-lg font-bold text-gray-800">
          Status Pembayaran Iuran {filterMonth !== 'Semua Bulan' || filterYear !== 'Semua Tahun' ? `(${filterMonth} ${filterYear})` : ''}
        </h3>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md font-medium hover:bg-emerald-100 border border-emerald-200">
            <Download size={16} /> Excel
          </button>
          <button className="inline-flex items-center gap-2 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-md font-medium hover:bg-red-100 border border-red-200">
            <FileDown size={16} /> PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 font-medium">Nama Anggota</th>
              <th className="px-6 py-3 font-medium">Bulan/Tahun</th>
              <th className="px-6 py-3 font-medium">Nominal</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDues.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada data iuran untuk periode ini.</td>
              </tr>
            ) : (
              filteredDues.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4">{item.month}</td>
                  <td className="px-6 py-4">Rp {item.nominal.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <Badge type={item.status === 'Lunas' ? 'success' : item.status === 'Menunggu' ? 'warning' : 'danger'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {item.action === 'confirm' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLihatBukti(item)}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={14} /> Lihat Bukti
                        </button>
                        <button 
                          onClick={() => onConfirmPayment(item.id)}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors"
                        >
                          <Check size={14} /> Konfirmasi
                        </button>
                      </div>
                    )}
                    {item.action === 'remind' && (
                      <button 
                        onClick={() => onSendReminder(item.id)}
                        disabled={item.isReminded}
                        className={`text-xs px-3 py-1.5 rounded transition-colors ${
                          item.isReminded 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        {item.isReminded ? 'Telah Diingatkan' : 'Kirim Reminder'}
                      </button>
                    )}
                    {item.action === 'none' && <span className="text-gray-400 text-xs">-</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Bagian Riwayat Pengeluaran */}
    <Card>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">
          Riwayat Pengeluaran Kas {filterMonth !== 'Semua Bulan' || filterYear !== 'Semua Tahun' ? `(${filterMonth} ${filterYear})` : ''}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 font-medium">Tanggal</th>
              <th className="px-6 py-3 font-medium">Jenis / Keterangan Pengeluaran</th>
              <th className="px-6 py-3 font-medium">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Tidak ada data pengeluaran untuk periode ini.</td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{exp.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{exp.desc}</td>
                  <td className="px-6 py-4 text-red-600 font-medium">Rp {exp.nominal.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Modal Lihat Bukti */}
    {isBuktiModalOpen && selectedBukti && (
      <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800">Bukti Pembayaran</h3>
            <button onClick={() => setIsBuktiModalOpen(false)} className="text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-4 text-sm text-gray-600">
              <p>Atas Nama: <span className="font-semibold text-gray-900">{selectedBukti.name}</span></p>
              <p>Periode: <span className="font-semibold text-gray-900">{selectedBukti.month}</span></p>
              <p>Nominal: <span className="font-semibold text-gray-900">Rp {selectedBukti.nominal.toLocaleString('id-ID')}</span></p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex justify-center min-h-[300px] items-center">
              {selectedBukti.buktiUrl ? (
                <img src={selectedBukti.buktiUrl} alt="Bukti Transfer" className="max-w-full h-auto max-h-[400px] rounded object-contain shadow-sm" />
              ) : (
                <div className="text-center text-gray-400">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pratinjau gambar</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button 
              onClick={() => setIsBuktiModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
            >
              Tutup
            </button>
            <button 
              onClick={handleConfirmFromModal}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white shadow-sm transition-colors bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Check size={16} /> Konfirmasi Pembayaran
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal Tambah Pengeluaran */}
    {isExpenseModalOpen && (
      <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800">Catat Pengeluaran Baru</h3>
            <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis / Keterangan Pengeluaran</label>
              <input 
                type="text" 
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" 
                placeholder="Contoh: Konsumsi rapat koordinasi" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
              <input 
                type="number" 
                required
                min="0"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" 
                placeholder="Contoh: 150000" 
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white shadow-sm transition-colors bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <Plus size={16} /> Simpan Pengeluaran
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('anggota');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State Simulasi Keamanan Role (Anggota | Bendahara | Admin)
  const [currentUserRole, setCurrentUserRole] = useState('Admin');
  // State untuk menguji paksa buka halaman terlarang (Simulasi Hacker/Bypass URL)
  const [simulateDirectUrl, setSimulateDirectUrl] = useState(false);

  // State terpusat untuk data iuran semua anggota
  const [allDuesData, setAllDuesData] = useState(initialDues);
  
  // State untuk riwayat pengeluaran bendahara
  const [expenses, setExpenses] = useState(initialExpenses);

  // --- Efek untuk mengatur Favicon dan Judul Tab Browser ---
  useEffect(() => {
    document.title = "Dashboard PPNI - RS Hermina Sukabumi";
    
    // Membuat favicon dari SVG secara dinamis
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="white" rx="100"/><rect x="85" y="45" width="30" height="110" fill="%23047857" rx="5"/><rect x="45" y="85" width="110" height="30" fill="%23047857" rx="5"/><path d="M100 65 C100 65 85 90 85 105 C85 115 92 122 100 122 C108 122 115 115 115 105 C115 90 100 65 100 65 Z" fill="%23F59E0B"/></svg>`;
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,${svgIcon}`;
    document.head.appendChild(link);
  }, []);

  // Filter data khusus untuk Ani Lestari (Member 1)
  const memberDues = allDuesData.filter(d => d.memberId === 1);

  // Fungsi saat anggota upload bukti bayar
  const handleUploadBukti = (id, file) => {
    // Membuat URL lokal sementara (mock) dari file yang diupload agar bisa dilihat di panel bendahara
    const fileUrl = file ? URL.createObjectURL(file) : null;
    
    setAllDuesData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: "Menunggu", date: "Menunggu verifikasi admin...", action: "confirm", buktiUrl: fileUrl } 
        : item
    ));
  };

  // Fungsi saat bendahara ACC/Konfirmasi pembayaran
  const handleConfirmPayment = (id) => {
    // Dapatkan tanggal hari ini untuk dicatat sebagai tanggal bayar lunas
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    
    setAllDuesData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: "Lunas", date: today, action: "none" } 
        : item
    ));
  };

  // Fungsi saat bendahara mengirim reminder
  const handleSendReminder = (id) => {
    setAllDuesData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isReminded: true } 
        : item
    ));
  };

  // Fungsi menambah pengeluaran
  const handleAddExpense = (desc, nominal) => {
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const newExpense = {
      id: Date.now(),
      desc,
      nominal,
      date: today
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  // Konfigurasi Hak Akses (RBAC) untuk setiap halaman
  const rolePermissions = {
    'anggota': ['Anggota', 'Bendahara', 'Admin'],
    'pendaftaran': ['Anggota', 'Bendahara', 'Admin'],
    'admin': ['Admin'],
    'bendahara': ['Bendahara', 'Admin'] // Admin juga bisa memantau atau bisa dibatasi hanya Bendahara
  };

  // Fungsi pengecekan apakah role saat ini diizinkan membuka halaman
  const hasAccess = (viewId) => {
    const allowedRoles = rolePermissions[viewId] || [];
    return allowedRoles.includes(currentUserRole);
  };

  const views = {
    'anggota': <BerandaAnggota iuranData={memberDues} onUploadBukti={handleUploadBukti} />,
    'pendaftaran': <Pendaftaran />,
    'admin': hasAccess('admin') ? (
      <PanelAdmin />
    ) : (
      <AccessDenied 
        requiredRoles={rolePermissions['admin']} 
        currentRole={currentUserRole} 
        onBack={() => setActiveView('anggota')} 
      />
    ),
    'bendahara': hasAccess('bendahara') ? (
      <PanelBendahara 
        allDues={allDuesData} 
        expenses={expenses}
        onConfirmPayment={handleConfirmPayment} 
        onSendReminder={handleSendReminder}
        onAddExpense={handleAddExpense}
      />
    ) : (
      <AccessDenied 
        requiredRoles={rolePermissions['bendahara']} 
        currentRole={currentUserRole} 
        onBack={() => setActiveView('anggota')} 
      />
    )
  };

  const allNavItems = [
    { id: 'anggota', label: 'Beranda Anggota', icon: User },
    { id: 'pendaftaran', label: 'Pendaftaran', icon: FileText },
    { id: 'admin', label: 'Panel Admin', icon: Shield },
    { id: 'bendahara', label: 'Panel Bendahara', icon: DollarSign },
  ];

  // Sembunyikan menu di Navbar jika role tidak punya akses (kecuali mode uji paksa URL aktif)
  const visibleNavItems = simulateDirectUrl 
    ? allNavItems 
    : allNavItems.filter(item => hasAccess(item.id));

  // Profil simulasi berdasarkan role yang dipilih
  const activeProfileName = 
    currentUserRole === 'Admin' ? 'Budi Santoso, S.Kep., Ners' :
    currentUserRole === 'Bendahara' ? 'Rina Wati, Ners' : 'Ani Lestari (contoh)';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Bar Simulator Pengujian Keamanan (Hanya untuk Demo/Testing) */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2.5 text-xs border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              Mode Uji Keamanan
            </span>
            <span className="text-slate-300">
              Ubah peran login di kanan untuk menguji hak akses menu & halaman:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
              {['Anggota', 'Bendahara', 'Admin'].map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentUserRole(role);
                    // Jika tidak sedang uji tembus URL, otomatis arahkan ke beranda jika halaman saat ini terlarang
                    if (!simulateDirectUrl && !rolePermissions[activeView].includes(role)) {
                      setActiveView('anggota');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    currentUserRole === role 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Login sbg: {role}
                </button>
              ))}
            </div>
            
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input 
                type="checkbox" 
                checked={simulateDirectUrl}
                onChange={(e) => setSimulateDirectUrl(e.target.checked)}
                className="rounded border-slate-600 text-amber-500 focus:ring-0"
              />
              <span>Uji Paksa Buka URL Terlarang</span>
            </label>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Menampilkan Komponen Logo PPNI */}
              <LogoPPNI />
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg tracking-wide hidden sm:block">PPNI DPK • RS Hermina Sukabumi</span>
                <span className="font-bold text-lg tracking-wide sm:hidden">DPK RS Hermina</span>
              </div>
            </div>

            {/* Desktop Navigation for switching roles/views easily */}
            <div className="hidden md:flex items-center space-x-1 ml-10">
              {visibleNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeView === item.id 
                      ? 'bg-emerald-900 text-white shadow-inner' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  {item.label}
                  {!hasAccess(item.id) && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">Terkunci</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">{activeProfileName}</div>
                <div className="text-xs text-emerald-300 flex items-center justify-end gap-1">
                  <span>Role:</span>
                  <span className="bg-emerald-900 px-1.5 py-0.5 rounded font-semibold text-emerald-200">{currentUserRole}</span>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-emerald-700 transition-colors text-emerald-100 hover:text-white">
                <LogOut size={20} />
              </button>
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-md hover:bg-emerald-700 text-emerald-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-emerald-900 border-t border-emerald-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeView === item.id 
                      ? 'bg-emerald-800 text-white' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={18} /> {item.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Render Active View */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {views[activeView]}
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Persatuan Perawat Nasional Indonesia (PPNI). All rights reserved.
        </div>
      </footer>
    </div>
  );
}