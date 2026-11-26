# DompetKeluarga — Situs Anggaran Rumah Tangga

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/DavidQlla06/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/DavidQlla06/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

DompetKeluarga adalah situs anggaran rumah tangga berbahasa Indonesia yang
berjalan sepenuhnya dari berkas statis, tanpa permintaan jaringan: kalkulator
anggaran, daftar transaksi, tagihan rutin, target tabungan, laporan 6 bulan,
dan panduan aturan 50/30/20 — dengan angka contoh keluarga yang konsisten di
semua halaman dan setiap kontrol benar-benar berfungsi.

## Angka kunci (November 2026, Keluarga Andini — contoh)

- **Pemasukan:** Rp12.500.000 (gaji Rp7.500.000 + Rp4.500.000, usaha sampingan Rp500.000)
- **Pengeluaran:** Rp10.470.000 dari 10 kategori
- **Sisa bulan ini:** Rp2.030.000
- **Tingkat tabungan:** 28,2% (tabungan terjadwal Rp1.500.000 + sisa)
- **Kategori terbesar:** Belanja dapur Rp2.650.000 (25,3%)
- **Tagihan:** 7 tagihan rutin, 1 belum dibayar (Iuran kebersihan RT Rp75.000, jatuh tempo 28 Nov)
- **Target tabungan:** 4 target, total terkumpul Rp28.900.000 dari Rp80.000.000

## Halaman

- `#/` — Beranda: empat kartu ringkasan, donat pembagian pengeluaran (bisa dialihkan ke tabel), transaksi terakhir
- `#/anggaran` — Kalkulator anggaran: pemasukan rencana dan batas tiap kategori bisa diubah (ketik atau geser), total dihitung ulang, plus cek aturan 50/30/20
- `#/transaksi` — 33 transaksi November 2026, bisa dicari dan disaring per kategori/jenis; formulir tambah transaksi memperbarui semua total
- `#/tagihan` — 7 tagihan rutin dengan jatuh tempo; status lunas/belum bisa ditandai
- `#/tabungan` — 4 target dengan batang progres; tombol setor Rp100 rb / Rp250 rb / Rp500 rb dan jumlah bebas
- `#/laporan` — Tren pemasukan vs pengeluaran dan tabungan Juni–November 2026 (grafik atau tabel), wawasan, dan unduh CSV
- `#/panduan` — Cara memakai situs, aturan 50/30/20, enam kebiasaan menahan pengeluaran

Semua angka dihitung dari `app/data.js` — total kategori sama dengan jumlah
transaksinya — dan perubahan pengguna tersimpan di peramban (localStorage).
Grafik digambar sebagai SVG buatan tangan; tidak ada font, pustaka, atau
gambar dari jaringan. Situs bisa dipakai dengan keyboard dan pembaca layar
(skip link, label di semua kontrol, `aria-current` di navigasi).

## Menjalankan

```sh
node serve.ts
```

Lalu buka http://localhost:8080 di desktop atau ponsel.

## Menyerahkan (program entry)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` hanya menyalin `app/` dan `screenshots/` yang sudah jadi ke
direktori keluaran dan menulis `dossier.json` — tanpa build ulang, tanpa
regenerate, tanpa jaringan — jadi program berjalan sama persis saat dinilai.
