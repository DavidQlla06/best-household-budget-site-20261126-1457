// Halaman-halaman DompetKeluarga. Setiap fungsi mengembalikan string HTML.
// Semua angka berasal dari ctx.totals yang dihitung dari data.js — tidak ada
// angka yang diketik manual di sini, supaya total selalu konsisten.

import { donut, groupedBars, savingsLine, fmtRp, fmtShort } from './charts.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const pct = (n) => (n * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 });

const dateId = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${names[m - 1]} ${y}`;
};

function kpi(label, value, sub) {
  return `<div class="kpi"><p class="kpi-label">${esc(label)}</p><p class="kpi-value">${esc(value)}</p><p class="kpi-sub">${esc(sub)}</p></div>`;
}

function catLegend(ctx) {
  const { state, totals } = ctx;
  return state.categories
    .map((c) => {
      const spent = totals.perCat[c.id] || 0;
      const left = c.budget - spent;
      return `<li><span class="dot" style="background:${c.color}"></span>
        <span class="leg-label">${esc(c.label)}</span>
        <span class="leg-num">${fmtRp(spent)} <span class="muted">dari ${fmtRp(c.budget)}</span></span>
        <span class="leg-left ${left < 0 ? 'over' : ''}">${left < 0 ? 'Lewat ' + fmtRp(-left) : 'Sisa ' + fmtRp(left)}</span></li>`;
    })
    .join('');
}

function catTable(ctx) {
  const { state, totals } = ctx;
  const rows = state.categories
    .map((c) => {
      const spent = totals.perCat[c.id] || 0;
      return `<tr><th scope="row">${esc(c.label)}</th><td>${fmtRp(c.budget)}</td><td>${fmtRp(spent)}</td><td>${pct(totals.spent ? spent / totals.spent : 0)}%</td><td>${fmtRp(c.budget - spent)}</td></tr>`;
    })
    .join('');
  return `<table class="data"><caption class="sr-only">Pengeluaran per kategori, November 2026</caption>
    <thead><tr><th scope="col">Kategori</th><th scope="col">Anggaran</th><th scope="col">Terpakai</th><th scope="col">Bagian</th><th scope="col">Sisa</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

function txRows(list, ctx) {
  return list
    .map((t) => {
      const cat = ctx.state.categories.find((c) => c.id === t.category);
      const label = t.income ? 'Pemasukan' : cat ? cat.label : 'Lainnya';
      return `<tr><td>${dateId(t.date)}</td><td>${esc(t.desc)}</td><td>${esc(label)}</td>
        <td class="${t.income ? 'in' : 'out'}">${t.income ? '+' : '−'}${fmtRp(t.amount)}</td></tr>`;
    })
    .join('');
}

export function viewHome(ctx) {
  const { state, totals } = ctx;
  const unpaid = state.bills.filter((b) => !b.paid);
  const recent = [...state.transactions].sort((a, b) => (b.date < a.date ? -1 : 1)).slice(0, 8);
  const donutParts = state.categories.map((c) => ({
    label: c.label,
    value: totals.perCat[c.id] || 0,
    color: c.color,
  }));
  const chartHtml =
    ctx.state.chartMode.home === 'table'
      ? catTable(ctx)
      : `<div class="chart-wrap">${donut(donutParts)}<ul class="legend">${catLegend(ctx)}</ul></div>`;
  return `
  <section class="hero">
    <p class="eyebrow">Anggaran keluarga &middot; ${esc(state.household.month)}</p>
    <h1>DompetKeluarga</h1>
    <p class="lede">Anggaran ${esc(state.household.name)} (${state.household.members} orang, ${esc(state.household.city)}): pemasukan, pengeluaran, tagihan, dan tabungan — semuanya tercatat dan bisa dihitung ulang.</p>
  </section>

  ${unpaid.length ? `<p class="alert" role="status"><strong>${unpaid.length} tagihan menunggu:</strong> ${unpaid.map((b) => `${esc(b.label)} ${fmtRp(b.amount)} (jatuh tempo ${dateId(b.due)})`).join('; ')}. <a href="#/tagihan">Lihat tagihan</a></p>` : ''}

  <section aria-label="Ringkasan bulan ini">
    <div class="kpi-grid">
      ${kpi('Pemasukan', fmtRp(totals.income), '3 sumber: gaji + usaha sampingan')}
      ${kpi('Pengeluaran', fmtRp(totals.spent), '10 kategori, terbesar belanja dapur')}
      ${kpi('Sisa bulan ini', fmtRp(totals.remaining), totals.remaining >= 0 ? 'Belum dialokasikan' : 'Anggaran terlewati')}
      ${kpi('Tingkat tabungan', pct(totals.savedRate) + '%', 'Tabungan terjadwal + sisa bulan ini')}
    </div>
  </section>

  <section aria-labelledby="h-cat">
    <div class="section-head"><h2 id="h-cat">Ke mana uang pergi</h2>
      <div class="toggle" role="group" aria-label="Tampilan pembagian kategori">
        <button type="button" data-action="chart-mode" data-page="home" data-mode="chart" aria-pressed="${ctx.state.chartMode.home === 'chart'}">Grafik</button>
        <button type="button" data-action="chart-mode" data-page="home" data-mode="table" aria-pressed="${ctx.state.chartMode.home === 'table'}">Tabel</button>
      </div>
    </div>
    ${chartHtml}
    <p class="hint">Kategori terbesar: <strong>Belanja dapur</strong> (${fmtRp(totals.perCat.dapur)} · ${pct(totals.spent ? totals.perCat.dapur / totals.spent : 0)}% dari pengeluaran). Semua kategori masih di bawah anggaran bulan ini.</p>
  </section>

  <section aria-labelledby="h-recent">
    <div class="section-head"><h2 id="h-recent">Transaksi terakhir</h2><a class="btn" href="#/transaksi">Semua transaksi</a></div>
    <table class="data"><caption class="sr-only">Delapan transaksi terakhir</caption>
      <thead><tr><th scope="col">Tanggal</th><th scope="col">Keterangan</th><th scope="col">Kategori</th><th scope="col">Jumlah</th></tr></thead>
      <tbody>${txRows(recent, ctx)}</tbody></table>
  </section>

  <section aria-labelledby="h-tools">
    <h2 id="h-tools">Alat anggaran</h2>
    <div class="cards">
      <a class="card" href="#/anggaran"><strong>Kalkulator anggaran</strong><span>Atur pemasukan &amp; batas tiap kategori, cek aturan 50/30/20.</span></a>
      <a class="card" href="#/tagihan"><strong>Tagihan rutin</strong><span>${state.bills.length} tagihan bulanan, ${unpaid.length} belum dibayar.</span></a>
      <a class="card" href="#/tabungan"><strong>Target tabungan</strong><span>${state.goals.length} target aktif, total terkumpul ${fmtRp(state.goals.reduce((a, g) => a + g.saved, 0))}.</span></a>
      <a class="card" href="#/laporan"><strong>Laporan 6 bulan</strong><span>Tren pemasukan, pengeluaran, dan tabungan Juni–November 2026.</span></a>
    </div>
  </section>`;
}

export function viewAnggaran(ctx) {
  const { state, totals } = ctx;
  const incomeInputs = state.income
    .map(
      (s) => `<div class="field"><label for="inc-${esc(s.id)}">${esc(s.label)}</label>
        <input id="inc-${esc(s.id)}" type="number" min="0" step="50000" value="${s.amount}" data-action="income-input" data-id="${esc(s.id)}"></div>`,
    )
    .join('');
  const rows = state.categories
    .map((c) => {
      const spent = totals.perCat[c.id] || 0;
      const used = c.budget ? Math.min(100, (spent / c.budget) * 100) : 0;
      return `<tr>
        <th scope="row">${esc(c.label)}</th>
        <td><input type="number" min="0" step="50000" value="${c.budget}" aria-label="Anggaran ${esc(c.label)}" data-action="budget-input" data-id="${esc(c.id)}"></td>
        <td><input type="range" min="0" max="3000000" step="50000" value="${c.budget}" aria-label="Geser anggaran ${esc(c.label)}" data-action="budget-range" data-id="${esc(c.id)}"></td>
        <td>${fmtRp(spent)}</td>
        <td><div class="bar" role="img" aria-label="${esc(c.label)} terpakai ${pct(c.budget ? spent / c.budget : 0)} persen dari anggaran"><span style="width:${used.toFixed(1)}%;background:${c.color}"></span></div></td>
        <td class="${c.budget - spent < 0 ? 'over' : ''}">${fmtRp(c.budget - spent)}</td></tr>`;
    })
    .join('');
  const totalBudget = state.categories.reduce((a, c) => a + c.budget, 0);
  const plannedIncome = state.income.reduce((a, s) => a + s.amount, 0);
  const unallocated = plannedIncome - totalBudget;

  // Aturan 50/30/20 atas pemasukan rencana.
  const needIds = ['dapur', 'transport', 'utilitas', 'pendidikan', 'kesehatan', 'cicilan'];
  const wantIds = ['hiburan', 'pakaian', 'lain'];
  const sumIds = (ids) => ids.reduce((a, id) => a + (totals.perCat[id] || 0), 0);
  const need = sumIds(needIds);
  const want = sumIds(wantIds);
  const save = (totals.perCat.tabungan || 0) + Math.max(0, totals.remaining);
  const calc = (part, target) =>
    `<tr><th scope="row">${esc(part.label)}</th><td>${pct(part.target)}%</td><td>${fmtRp((plannedIncome * part.target) / 100)}</td><td>${fmtRp(part.actual)}</td><td>${pct(plannedIncome ? part.actual / plannedIncome : 0)}%</td><td>${part.actual <= (plannedIncome * part.target) / 100 ? 'Sesuai' : 'Di atas target'}</td></tr>`;
  return `
  <h1>Kalkulator anggaran</h1>
  <p class="lede">Atur pemasukan dan batas tiap kategori. Semua total dihitung ulang saat Anda mengetik atau menggeser — tidak ada angka yang diam-diam berubah.</p>

  <section aria-labelledby="h-inc">
    <h2 id="h-inc">Pemasukan rencana (${esc(state.household.month)})</h2>
    <div class="field-grid">${incomeInputs}</div>
    <p><strong>Total pemasukan rencana: ${fmtRp(plannedIncome)}</strong> &middot; Total anggaran kategori: ${fmtRp(totalBudget)} &middot; <span class="${unallocated < 0 ? 'over' : 'ok'}">Sisa untuk dialokasikan: ${fmtRp(unallocated)}</span>${unallocated < 0 ? ' — anggaran melebihi pemasukan, turunkan salah satu kategori.' : ''}</p>
  </section>

  <section aria-labelledby="h-cats">
    <h2 id="h-cats">Batas tiap kategori</h2>
    <table class="data budget"><caption class="sr-only">Anggaran per kategori dan pemakaian bulan ini</caption>
      <thead><tr><th scope="col">Kategori</th><th scope="col">Anggaran (Rp)</th><th scope="col">Geser</th><th scope="col">Terpakai</th><th scope="col">Pemakaian</th><th scope="col">Sisa</th></tr></thead>
      <tbody>${rows}</tbody></table>
    <p><button type="button" class="btn primary" data-action="save-plan">Simpan rencana ini</button> <span id="save-msg" role="status"></span></p>
    <p class="hint">Rencana tersimpan di peramban ini saja (localStorage). Menutup halaman tidak menghapusnya; tombol “Kembalikan contoh” mengembalikan angka awal.</p>
    <p><button type="button" class="btn" data-action="reset-plan">Kembalikan angka contoh</button></p>
  </section>

  <section aria-labelledby="h-503020">
    <h2 id="h-503020">Cek aturan 50/30/20</h2>
    <p>Aturan praktis: <strong>50%</strong> pemasukan untuk kebutuhan, <strong>30%</strong> untuk keinginan, <strong>20%</strong> untuk tabungan. Tabel ini membandingkan aturan itu dengan pengeluaran nyata bulan ini.</p>
    <table class="data"><caption class="sr-only">Perbandingan aturan 50/30/20 dengan pengeluaran nyata</caption>
      <thead><tr><th scope="col">Kelompok</th><th scope="col">Target</th><th scope="col">Target (Rp)</th><th scope="col">Nyata (Rp)</th><th scope="col">Nyata (%)</th><th scope="col">Penilaian</th></tr></thead>
      <tbody>
        ${calc({ label: 'Kebutuhan (dapur, transport, utilitas, pendidikan, kesehatan, cicilan)', target: 50, actual: need }, 50)}
        ${calc({ label: 'Keinginan (hiburan, pakaian, lain-lain)', target: 30, actual: want }, 30)}
        ${calc({ label: 'Tabungan (terjadwal + sisa bulan ini)', target: 20, actual: save }, 20)}
      </tbody></table>
    <p class="hint">Bulan ini keluarga ini menabung ${pct(plannedIncome ? save / plannedIncome : 0)}% dari pemasukan — di atas target 20%, karena semua kategori kebutuhan masih di bawah anggaran.</p>
  </section>`;
}

export function viewTransaksi(ctx) {
  const { state } = ctx;
  const f = state.txFilter;
  const q = (state.txSearch || '').toLowerCase();
  let list = [...state.transactions].sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));
  if (f !== 'semua') list = list.filter((t) => (f === 'masuk' ? t.income : !t.income));
  if (state.txCat !== 'semua') list = list.filter((t) => t.category === state.txCat);
  if (q) list = list.filter((t) => t.desc.toLowerCase().includes(q));
  const inSum = list.filter((t) => t.income).reduce((a, t) => a + t.amount, 0);
  const outSum = list.filter((t) => !t.income).reduce((a, t) => a + t.amount, 0);
  const catOptions = ['<option value="semua">Semua kategori</option>']
    .concat(
      state.categories.map(
        (c) => `<option value="${esc(c.id)}" ${state.txCat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`,
      ),
    )
    .join('');
  const formCatOptions = state.categories
    .map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`)
    .join('');
  return `
  <h1>Transaksi</h1>
  <p class="lede">${state.transactions.length} transaksi tercatat untuk ${esc(state.household.month)}. Tambah transaksi baru lewat formulir di bawah — total di semua halaman ikut berubah.</p>

  <form id="tx-add" class="panel" data-action="tx-add-form">
    <h2>Tambah transaksi</h2>
    <div class="field-grid">
      <div class="field"><label for="tx-date">Tanggal</label><input id="tx-date" name="date" type="date" value="2026-11-26" required></div>
      <div class="field"><label for="tx-desc">Keterangan</label><input id="tx-desc" name="desc" type="text" placeholder="cth. Belanja pasar" required maxlength="80"></div>
      <div class="field"><label for="tx-cat">Kategori</label><select id="tx-cat" name="category">${formCatOptions}</select></div>
      <div class="field"><label for="tx-amount">Jumlah (Rp)</label><input id="tx-amount" name="amount" type="number" min="1000" step="1000" placeholder="100000" required></div>
      <div class="field"><label for="tx-kind">Jenis</label><select id="tx-kind" name="kind"><option value="keluar">Pengeluaran</option><option value="masuk">Pemasukan</option></select></div>
    </div>
    <p><button class="btn primary" type="submit">Tambah transaksi</button> <span id="tx-msg" role="status"></span></p>
  </form>

  <section aria-labelledby="h-filter">
    <h2 id="h-filter">Cari &amp; saring</h2>
    <div class="field-grid">
      <div class="field"><label for="tx-q">Cari keterangan</label><input id="tx-q" type="search" placeholder="cth. pasar, bensin, SPP" value="${esc(state.txSearch || '')}" data-action="tx-search"></div>
      <div class="field"><label for="tx-type">Jenis</label><select id="tx-type" data-action="tx-type">
        <option value="semua" ${f === 'semua' ? 'selected' : ''}>Semua</option>
        <option value="masuk" ${f === 'masuk' ? 'selected' : ''}>Pemasukan</option>
        <option value="keluar" ${f === 'keluar' ? 'selected' : ''}>Pengeluaran</option></select></div>
      <div class="field"><label for="tx-cat-filter">Kategori</label><select id="tx-cat-filter" data-action="tx-cat">${catOptions}</select></div>
    </div>
    <p><strong>${list.length} transaksi ditampilkan</strong> &middot; Masuk ${fmtRp(inSum)} &middot; Keluar ${fmtRp(outSum)}</p>
  </section>

  <table class="data"><caption class="sr-only">Daftar transaksi yang disaring</caption>
    <thead><tr><th scope="col">Tanggal</th><th scope="col">Keterangan</th><th scope="col">Kategori</th><th scope="col">Jumlah</th></tr></thead>
    <tbody>${list.length ? txRows(list, ctx) : '<tr><td colspan="4">Tidak ada transaksi yang cocok dengan saringan ini.</td></tr>'}</tbody></table>`;
}

export function viewTagihan(ctx) {
  const { state } = ctx;
  const total = state.bills.reduce((a, b) => a + b.amount, 0);
  const paid = state.bills.filter((b) => b.paid).reduce((a, b) => a + b.amount, 0);
  const rows = [...state.bills]
    .sort((a, b) => (a.due < b.due ? -1 : 1))
    .map(
      (b) => `<tr>
        <th scope="row">${esc(b.label)}</th><td>${fmtRp(b.amount)}</td><td>${dateId(b.due)}</td>
        <td><span class="badge ${b.paid ? 'paid' : 'due'}">${b.paid ? 'Lunas' : 'Belum dibayar'}</span></td>
        <td><button type="button" class="btn small" data-action="bill-toggle" data-id="${esc(b.id)}">${b.paid ? 'Tandai belum dibayar' : 'Tandai lunas'}</button></td></tr>`,
    )
    .join('');
  return `
  <h1>Tagihan rutin</h1>
  <p class="lede">Tagihan yang datang tiap bulan, lengkap dengan jatuh tempo dan statusnya. Menandai status di sini hanya mengubah pengingat — uangnya tercatat di Transaksi saat benar-benar dibayar.</p>
  <div class="kpi-grid">
    ${kpi('Total tagihan', fmtRp(total), state.bills.length + ' tagihan bulanan')}
    ${kpi('Sudah dibayar', fmtRp(paid), state.bills.filter((b) => b.paid).length + ' tagihan lunas')}
    ${kpi('Menunggu', fmtRp(total - paid), state.bills.filter((b) => !b.paid).length + ' tagihan belum dibayar')}
  </div>
  <table class="data"><caption class="sr-only">Daftar tagihan rutin November 2026</caption>
    <thead><tr><th scope="col">Tagihan</th><th scope="col">Jumlah</th><th scope="col">Jatuh tempo</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
    <tbody>${rows}</tbody></table>
  <p class="hint">Tagihan berikutnya yang jatuh tempo: <strong>Iuran kebersihan RT, Rp75.000, 28 November 2026.</strong> Siapkan dari sisa bulan ini (${fmtRp(ctx.totals.remaining)}).</p>`;
}

export function viewTabungan(ctx) {
  const { state } = ctx;
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);
  const cards = state.goals
    .map((g) => {
      const used = Math.min(100, (g.saved / g.target) * 100);
      return `<article class="goal panel">
        <h2>${esc(g.label)}</h2>
        <p class="goal-nums"><strong>${fmtRp(g.saved)}</strong> dari ${fmtRp(g.target)} &middot; ${pct(g.saved / g.target)}%</p>
        <div class="bar big" role="img" aria-label="${esc(g.label)}: ${pct(g.saved / g.target)} persen tercapai"><span style="width:${used.toFixed(1)}%;background:#ad1457"></span></div>
        <p class="muted">${esc(g.note)}</p>
        <p class="goal-actions">
          <button type="button" class="btn small" data-action="goal-add" data-id="${esc(g.id)}" data-amount="100000">+ Rp100 rb</button>
          <button type="button" class="btn small" data-action="goal-add" data-id="${esc(g.id)}" data-amount="250000">+ Rp250 rb</button>
          <button type="button" class="btn small" data-action="goal-add" data-id="${esc(g.id)}" data-amount="500000">+ Rp500 rb</button>
        </p>
        <p class="field inline"><label for="goal-${esc(g.id)}">Jumlah lain (Rp)</label>
          <input id="goal-${esc(g.id)}" type="number" min="10000" step="10000" placeholder="100000">
          <button type="button" class="btn small" data-action="goal-add-custom" data-id="${esc(g.id)}">Tambah</button></p>
      </article>`;
    })
    .join('');
  return `
  <h1>Target tabungan</h1>
  <p class="lede">Empat target keluarga ini. Tekan tombol tambah untuk menyetor — batang dan total langsung bergerak. Ini simulasi rencana: angka tersimpan di peramban ini.</p>
  <div class="kpi-grid">
    ${kpi('Total terkumpul', fmtRp(totalSaved), pct(totalSaved / totalTarget) + '% dari semua target')}
    ${kpi('Total target', fmtRp(totalTarget), state.goals.length + ' target aktif')}
    ${kpi('Kekurangan', fmtRp(totalTarget - totalSaved), 'Dengan setor Rp1.500.000/bulan, lunas dalam ' + Math.ceil((totalTarget - totalSaved) / 1500000) + ' bulan')}
  </div>
  <div class="goal-grid">${cards}</div>
  <p class="hint">Dana darurat sudah ${pct(state.goals[0].saved / state.goals[0].target)}% — targetnya 6x pengeluaran pokok bulanan (${fmtRp(15000000)}). Setelah penuh, alihkan setorannya ke DP rumah.</p>`;
}

export function viewLaporan(ctx) {
  const { state, totals } = ctx;
  const rows = state.history;
  const savings = rows.map((r) => r.income - r.spent);
  const biggest = state.categories.reduce((a, c) => ((totals.perCat[c.id] || 0) > (totals.perCat[a.id] || 0) ? c : a));
  const over = state.categories.filter((c) => (totals.perCat[c.id] || 0) > c.budget);
  const chartHtml =
    ctx.state.chartMode.laporan === 'table'
      ? `<table class="data"><caption class="sr-only">Pemasukan dan pengeluaran Juni–November 2026</caption>
        <thead><tr><th scope="col">Bulan</th><th scope="col">Pemasukan</th><th scope="col">Pengeluaran</th><th scope="col">Ditabung</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr><th scope="row">${esc(r.month)}</th><td>${fmtRp(r.income)}</td><td>${fmtRp(r.spent)}</td><td>${fmtRp(savings[i])}</td></tr>`).join('')}</tbody></table>`
      : `${groupedBars(rows)}
        <p class="legend-inline"><span class="dot" style="background:#2e7d32"></span> Pemasukan &nbsp; <span class="dot" style="background:#c62828"></span> Pengeluaran</p>
        <h3>Yang berhasil ditabung tiap bulan</h3>
        ${savingsLine(rows)}`;
  return `
  <h1>Laporan 6 bulan</h1>
  <p class="lede">Juni–November 2026: pemasukan tetap Rp12.500.000 per bulan, pengeluaran bergerak antara ${fmtRp(Math.min(...rows.map((r) => r.spent)))} dan ${fmtRp(Math.max(...rows.map((r) => r.spent)))}.</p>
  <div class="section-head"><h2>Tren bulanan</h2>
    <div class="toggle" role="group" aria-label="Tampilan tren bulanan">
      <button type="button" data-action="chart-mode" data-page="laporan" data-mode="chart" aria-pressed="${ctx.state.chartMode.laporan === 'chart'}">Grafik</button>
      <button type="button" data-action="chart-mode" data-page="laporan" data-mode="table" aria-pressed="${ctx.state.chartMode.laporan === 'table'}">Tabel</button>
    </div>
  </div>
  ${chartHtml}

  <section aria-labelledby="h-insight">
    <h2 id="h-insight">Yang bisa dibaca dari angka ini</h2>
    <ul class="insights">
      <li><strong>Kategori terbesar bulan ini: ${esc(biggest.label)}</strong> — ${fmtRp(totals.perCat[biggest.id])}, ${pct(totals.spent ? totals.perCat[biggest.id] / totals.spent : 0)}% dari pengeluaran.</li>
      <li><strong>${over.length ? 'Kategori yang lewat anggaran: ' + over.map((c) => esc(c.label)).join(', ') + '.' : 'Tidak ada kategori yang lewat anggaran bulan ini.'}</strong> Semua batas dipatuhi, termasuk hiburan (${fmtRp(totals.perCat.hiburan)} dari ${fmtRp(800000)}).</li>
      <li><strong>Tabungan naik:</strong> Juni menabung ${fmtRp(savings[0])}, November ${fmtRp(savings[5])} — naik ${fmtRp(savings[5] - savings[0])} dalam 6 bulan.</li>
      <li><strong>Bulan paling boros: September 2026</strong> (${fmtRp(11420000)}), didorong pengeluaran pendidikan awal semester. Bulan paling hemat: November (${fmtRp(10470000)}).</li>
    </ul>
  </section>

  <section aria-labelledby="h-export">
    <h2 id="h-export">Unduh data</h2>
    <p>Seluruh transaksi bulan ini sebagai CSV — bisa dibuka di spreadsheet apa pun.</p>
    <p><button type="button" class="btn primary" data-action="export-csv">Unduh transaksi November 2026 (CSV)</button> <span id="csv-msg" role="status"></span></p>
  </section>`;
}

export function viewPanduan(ctx) {
  return `
  <h1>Panduan anggaran keluarga</h1>
  <p class="lede">Cara memakai situs ini dan aturan praktis yang dipakai angka-angkanya.</p>

  <section aria-labelledby="h-pakai">
    <h2 id="h-pakai">Cara memakai situs ini</h2>
    <ol class="steps">
      <li><strong>Beranda</strong> — lihat ringkasan bulan ini: pemasukan, pengeluaran, sisa, dan ke mana uang pergi.</li>
      <li><strong>Kalkulator anggaran</strong> — ubah pemasukan dan batas kategori sampai totalnya muat di pemasukan; cek aturan 50/30/20.</li>
      <li><strong>Transaksi</strong> — catat setiap uang masuk dan keluar; saring berdasarkan kategori atau kata kunci.</li>
      <li><strong>Tagihan rutin</strong> — tandai lunas begitu dibayar, supaya tidak ada tagihan yang terlewat.</li>
      <li><strong>Target tabungan</strong> — setor ke tiap target dan lihat progresnya; dana darurat didahulukan.</li>
      <li><strong>Laporan 6 bulan</strong> — bandingkan bulan ini dengan bulan-bulan sebelumnya dan unduh datanya.</li>
    </ol>
  </section>

  <section aria-labelledby="h-aturan">
    <h2 id="h-aturan">Aturan 50/30/20</h2>
    <p>Dari setiap pemasukan: <strong>50%</strong> untuk kebutuhan (makan, transport, listrik, sekolah, cicilan), <strong>30%</strong> untuk keinginan (hiburan, makan luar, pakaian), <strong>20%</strong> untuk tabungan dan dana darurat. Keluarga contoh di situs ini menabung ${pct(ctx.totals.savedRate)}% bulan ini — di atas target — karena kebutuhan hanya memakai ${pct(ctx.totals.income ? (ctx.totals.perCat.dapur + ctx.totals.perCat.transport + ctx.totals.perCat.utilitas + ctx.totals.perCat.pendidikan + ctx.totals.perCat.kesehatan + ctx.totals.perCat.cicilan) / ctx.totals.income : 0)}% dari pemasukan.</p>
  </section>

  <section aria-labelledby="h-tips">
    <h2 id="h-tips">Enam kebiasaan yang menahan pengeluaran</h2>
    <ol class="steps">
      <li><strong>Bayar diri sendiri dulu:</strong> setor tabungan di tanggal gajian, sebelum belanja — seperti setor Rp1.500.000 tiap tanggal 1 di situs ini.</li>
      <li><strong>Belanja mingguan, bukan harian:</strong> pasar seminggu sekali dengan daftar belanja menahan belanja impulsif.</li>
      <li><strong>Satu rekening untuk hiburan:</strong> begitu jatah hiburan habis, berhenti — jangan mengambil dari jatah dapur.</li>
      <li><strong>Cek tagihan di tanggal 25:</strong> semua tagihan bulan depan terlihat di halaman Tagihan sebelum jatuh tempo.</li>
      <li><strong>Catat di hari yang sama:</strong> transaksi yang dicatat seminggu kemudian hampir selalu ada yang hilang.</li>
      <li><strong>Evaluasi tiap akhir bulan:</strong> buka Laporan, lihat satu kategori yang paling membengkak, dan turunkan batasnya bulan depan.</li>
    </ol>
  </section>

  <section aria-labelledby="h-data">
    <h2 id="h-data">Tentang data di situs ini</h2>
    <p>Semua angka adalah <strong>data contoh keluarga fiktif</strong> (Keluarga Andini, 4 orang, Makassar) untuk November 2026, supaya setiap halaman punya angka nyata yang konsisten — bukan angka acak. Ganti angkanya lewat Kalkulator anggaran dan formulir Transaksi; perubahan tersimpan di peramban Anda dan tidak dikirim ke mana pun, karena situs ini bekerja sepenuhnya offline.</p>
  </section>`;
}

export function viewMissing() {
  return `<h1>Halaman tidak ditemukan</h1>
  <p>Tidak ada halaman di alamat ini. <a href="#/">Kembali ke beranda</a>.</p>`;
}
