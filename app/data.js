// DompetKeluarga — data contoh keluarga fiktif (Keluarga Andini, Makassar),
// November 2026, dalam rupiah. Semua angka di halaman dihitung dari data ini,
// jadi total kategori = jumlah transaksinya, dan sisa = pemasukan − pengeluaran.
// Tidak ada data dari jaringan: semuanya ada di berkas ini.

export const HOUSEHOLD = {
  name: 'Keluarga Andini',
  members: 4,
  city: 'Makassar',
  month: 'November 2026',
  note: 'Data contoh keluarga fiktif untuk November 2026. Ubah angkanya di halaman Anggaran — semua total dihitung ulang otomatis.',
};

export const CATEGORIES = [
  { id: 'dapur', label: 'Belanja dapur', budget: 3000000, color: '#2e7d32' },
  { id: 'transport', label: 'Transport & bensin', budget: 1200000, color: '#1565c0' },
  { id: 'utilitas', label: 'Listrik, air & internet', budget: 900000, color: '#8d6e00' },
  { id: 'pendidikan', label: 'Pendidikan anak', budget: 1500000, color: '#6a1b9a' },
  { id: 'kesehatan', label: 'Kesehatan', budget: 500000, color: '#c62828' },
  { id: 'hiburan', label: 'Hiburan & makan luar', budget: 800000, color: '#ef6c00' },
  { id: 'pakaian', label: 'Pakaian & perawatan', budget: 400000, color: '#00838f' },
  { id: 'cicilan', label: 'Cicilan motor', budget: 1100000, color: '#5d4037' },
  { id: 'tabungan', label: 'Tabungan & dana darurat', budget: 1500000, color: '#ad1457' },
  { id: 'lain', label: 'Lain-lain', budget: 600000, color: '#616161' },
];

// Pemasukan November 2026 (total Rp12.500.000).
export const INCOME = [
  { id: 'gaji-andi', label: 'Gaji Andi (ayah)', amount: 7500000, date: '2026-11-25' },
  { id: 'gaji-sari', label: 'Gaji Sari (ibu)', amount: 4500000, date: '2026-11-25' },
  { id: 'usaha', label: 'Usaha sampingan (jualan online)', amount: 500000, date: '2026-11-20' },
];

// Pengeluaran November 2026. Jumlah per kategori:
// dapur 2.650.000, transport 1.050.000, utilitas 875.000, pendidikan 1.500.000,
// kesehatan 470.000, hiburan 640.000, pakaian 275.000, cicilan 1.100.000,
// tabungan 1.500.000, lain-lain 410.000 — total Rp10.470.000.
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', desc: 'SPP anak (November)', category: 'pendidikan', amount: 900000 },
  { id: 't02', date: '2026-11-01', desc: 'Setor tabungan terjadwal', category: 'tabungan', amount: 1500000 },
  { id: 't03', date: '2026-11-02', desc: 'Pasar mingguan (sayur, ayam, telur)', category: 'dapur', amount: 450000 },
  { id: 't04', date: '2026-11-02', desc: 'Pulsa & paket data', category: 'lain', amount: 160000 },
  { id: 't05', date: '2026-11-03', desc: 'Bensin Pertalite', category: 'transport', amount: 300000 },
  { id: 't06', date: '2026-11-04', desc: 'Les matematika anak', category: 'pendidikan', amount: 350000 },
  { id: 't07', date: '2026-11-05', desc: 'Belanja Superindo', category: 'dapur', amount: 380000 },
  { id: 't08', date: '2026-11-05', desc: 'Cicilan motor (angsuran ke-14)', category: 'cicilan', amount: 1100000 },
  { id: 't09', date: '2026-11-06', desc: 'Listrik PLN (token + tagihan)', category: 'utilitas', amount: 420000 },
  { id: 't10', date: '2026-11-07', desc: 'Parkir & tol', category: 'transport', amount: 150000 },
  { id: 't11', date: '2026-11-08', desc: 'Air PDAM', category: 'utilitas', amount: 180000 },
  { id: 't12', date: '2026-11-08', desc: 'Makan luar sekeluarga', category: 'hiburan', amount: 250000 },
  { id: 't13', date: '2026-11-09', desc: 'Pasar mingguan', category: 'dapur', amount: 520000 },
  { id: 't14', date: '2026-11-10', desc: 'Internet IndiHome', category: 'utilitas', amount: 275000 },
  { id: 't15', date: '2026-11-10', desc: 'Iuran BPJS Kesehatan', category: 'kesehatan', amount: 150000 },
  { id: 't16', date: '2026-11-11', desc: 'Buku & alat tulis anak', category: 'pendidikan', amount: 250000 },
  { id: 't17', date: '2026-11-12', desc: 'Belanja Superindo', category: 'dapur', amount: 410000 },
  { id: 't18', date: '2026-11-13', desc: 'Periksa dokter (anak demam)', category: 'kesehatan', amount: 200000 },
  { id: 't19', date: '2026-11-14', desc: 'Bensin Pertalite', category: 'transport', amount: 300000 },
  { id: 't20', date: '2026-11-15', desc: 'Bioskop (2 tiket anak)', category: 'hiburan', amount: 150000 },
  { id: 't21', date: '2026-11-15', desc: 'Obat apotek', category: 'kesehatan', amount: 120000 },
  { id: 't22', date: '2026-11-16', desc: 'Sayur & buah', category: 'dapur', amount: 290000 },
  { id: 't23', date: '2026-11-17', desc: 'Seragam sekolah anak', category: 'pakaian', amount: 175000 },
  { id: 't24', date: '2026-11-18', desc: 'Ojek online', category: 'transport', amount: 120000 },
  { id: 't25', date: '2026-11-19', desc: 'Belanja Superindo', category: 'dapur', amount: 350000 },
  { id: 't26', date: '2026-11-20', desc: 'Usaha sampingan masuk', category: 'usaha', amount: 500000, income: true },
  { id: 't27', date: '2026-11-20', desc: 'Servis AC', category: 'lain', amount: 250000 },
  { id: 't28', date: '2026-11-21', desc: 'Sepatu sekolah anak', category: 'pakaian', amount: 100000 },
  { id: 't29', date: '2026-11-22', desc: 'Makan luar sekeluarga', category: 'hiburan', amount: 240000 },
  { id: 't30', date: '2026-11-23', desc: 'Pasar mingguan', category: 'dapur', amount: 250000 },
  { id: 't31', date: '2026-11-24', desc: 'Bensin Pertalite', category: 'transport', amount: 180000 },
  { id: 't32', date: '2026-11-25', desc: 'Gaji Andi masuk', category: 'gaji', amount: 7500000, income: true },
  { id: 't33', date: '2026-11-25', desc: 'Gaji Sari masuk', category: 'gaji', amount: 4500000, income: true },
];

// Tagihan rutin bulanan: yang sudah lunas tercatat sebagai transaksi di atas.
export const BILLS = [
  { id: 'b-spp', label: 'SPP anak', amount: 900000, due: '2026-11-01', paid: true },
  { id: 'b-cicilan', label: 'Cicilan motor', amount: 1100000, due: '2026-11-05', paid: true },
  { id: 'b-listrik', label: 'Listrik PLN', amount: 420000, due: '2026-11-20', paid: true },
  { id: 'b-air', label: 'Air PDAM', amount: 180000, due: '2026-11-15', paid: true },
  { id: 'b-internet', label: 'Internet IndiHome', amount: 275000, due: '2026-11-10', paid: true },
  { id: 'b-bpjs', label: 'Iuran BPJS Kesehatan', amount: 150000, due: '2026-11-10', paid: true },
  { id: 'b-kebersihan', label: 'Iuran kebersihan RT', amount: 75000, due: '2026-11-28', paid: false },
];

// Target tabungan.
export const GOALS = [
  { id: 'g-darurat', label: 'Dana darurat', target: 15000000, saved: 9250000, note: 'Target 6x pengeluaran bulanan pokok.' },
  { id: 'g-liburan', label: 'Liburan keluarga', target: 5000000, saved: 2400000, note: 'Rencana liburan ke pantai akhir tahun.' },
  { id: 'g-rumah', label: 'DP rumah', target: 50000000, saved: 12500000, note: 'Ditabung Rp1.000.000 tiap bulan.' },
  { id: 'g-pendidikan', label: 'Pendidikan anak', target: 10000000, saved: 4750000, note: 'Biaya masuk sekolah tahun depan.' },
];

// Tren 6 bulan terakhir (pemasukan vs pengeluaran, rupiah).
export const HISTORY = [
  { month: 'Jun 2026', income: 12500000, spent: 10850000 },
  { month: 'Jul 2026', income: 12500000, spent: 11200000 },
  { month: 'Agu 2026', income: 12500000, spent: 10940000 },
  { month: 'Sep 2026', income: 12500000, spent: 11420000 },
  { month: 'Okt 2026', income: 12500000, spent: 10760000 },
  { month: 'Nov 2026', income: 12500000, spent: 10470000 },
];
