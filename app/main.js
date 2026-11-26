// DompetKeluarga: router hash, state, dan semua interaksi.
// State awal = data contoh dari data.js; perubahan pengguna disimpan di
// localStorage (kunci dompetkeluarga-v1) dan dimuat kembali saat dibuka.
// Di profil peramban baru, yang tampil persis data contoh.
//
//   #/            Beranda
//   #/anggaran    Kalkulator anggaran + 50/30/20
//   #/transaksi   Daftar + tambah transaksi
//   #/tagihan     Tagihan rutin
//   #/tabungan    Target tabungan
//   #/laporan     Laporan 6 bulan + unduh CSV
//   #/panduan     Panduan
//
// window.__shotReady bernilai false saat halaman dirender dan true sesudahnya,
// supaya skrip screenshot tahu kapan menangkap layar.

import { CATEGORIES, INCOME, TRANSACTIONS, BILLS, GOALS, HISTORY, HOUSEHOLD } from './data.js';
import {
  viewHome,
  viewAnggaran,
  viewTransaksi,
  viewTagihan,
  viewTabungan,
  viewLaporan,
  viewPanduan,
  viewMissing,
} from './views.js';
import { fmtRp } from './charts.js';

const STORE_KEY = 'dompetkeluarga-v1';

function seedState() {
  return {
    household: { ...HOUSEHOLD },
    categories: CATEGORIES.map((c) => ({ ...c })),
    income: INCOME.map((s) => ({ ...s })),
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    bills: BILLS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
    history: HISTORY.map((h) => ({ ...h })),
    txFilter: 'semua',
    txCat: 'semua',
    txSearch: '',
    chartMode: { home: 'chart', laporan: 'chart' },
  };
}

function loadState() {
  const base = seedState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    for (const key of ['income', 'transactions', 'bills', 'goals']) {
      if (Array.isArray(saved[key])) base[key] = saved[key];
    }
    if (saved.budgets && typeof saved.budgets === 'object') {
      for (const c of base.categories) {
        if (typeof saved.budgets[c.id] === 'number') c.budget = saved.budgets[c.id];
      }
    }
    return base;
  } catch {
    return base;
  }
}

function saveState(state) {
  try {
    const budgets = {};
    for (const c of state.categories) budgets[c.id] = c.budget;
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        income: state.income,
        transactions: state.transactions,
        bills: state.bills,
        goals: state.goals,
        budgets,
      }),
    );
  } catch {
    // Penyimpanan penuh atau dimatikan: situs tetap jalan, hanya tidak tersimpan.
  }
}

function computeTotals(state) {
  const income = state.transactions.filter((t) => t.income).reduce((a, t) => a + t.amount, 0);
  const spent = state.transactions.filter((t) => !t.income).reduce((a, t) => a + t.amount, 0);
  const perCat = {};
  for (const c of state.categories) perCat[c.id] = 0;
  for (const t of state.transactions) {
    if (!t.income && perCat[t.category] !== undefined) perCat[t.category] += t.amount;
  }
  const savedPlanned = perCat.tabungan || 0;
  const remaining = income - spent;
  return { income, spent, remaining, perCat, savedRate: income ? (savedPlanned + Math.max(0, remaining)) / income : 0 };
}

const app = document.getElementById('app');
const state = loadState();

function ctx() {
  return { state, totals: computeTotals(state) };
}

const ROUTES = {
  '': viewHome,
  '/anggaran': viewAnggaran,
  '/transaksi': viewTransaksi,
  '/tagihan': viewTagihan,
  '/tabungan': viewTabungan,
  '/laporan': viewLaporan,
  '/panduan': viewPanduan,
};

const TITLES = {
  '': 'DompetKeluarga — Anggaran Keluarga November 2026',
  '/anggaran': 'Kalkulator Anggaran | DompetKeluarga',
  '/transaksi': 'Transaksi | DompetKeluarga',
  '/tagihan': 'Tagihan Rutin | DompetKeluarga',
  '/tabungan': 'Target Tabungan | DompetKeluarga',
  '/laporan': 'Laporan 6 Bulan | DompetKeluarga',
  '/panduan': 'Panduan Anggaran | DompetKeluarga',
};

function render() {
  window.__shotReady = false;
  const path = location.hash.replace(/^#/, '') || '/';
  const key = path === '/' ? '' : path;
  const view = ROUTES[key] || viewMissing;
  document.title = TITLES[key] || 'DompetKeluarga';
  app.innerHTML = view(ctx());
  const navLinks = document.querySelectorAll('nav a');
  for (const a of navLinks) {
    const href = a.getAttribute('href');
    if (href === '#' + path || (path === '/' && href === '#/')) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function rerender() {
  saveState(state);
  render();
}

function csvCell(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCsv() {
  const lines = ['Tanggal,Keterangan,Kategori,Jumlah (Rp),Jenis'];
  const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const t of sorted) {
    const cat = state.categories.find((c) => c.id === t.category);
    lines.push(
      [t.date, t.desc, t.income ? 'Pemasukan' : cat ? cat.label : 'Lainnya', t.amount, t.income ? 'Masuk' : 'Keluar']
        .map(csvCell)
        .join(','),
    );
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transaksi-november-2026.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const msg = document.getElementById('csv-msg');
  if (msg) msg.textContent = `CSV diunduh: ${sorted.length} transaksi.`;
}

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'chart-mode') {
    state.chartMode[el.dataset.page] = el.dataset.mode;
    render();
  } else if (action === 'bill-toggle') {
    const bill = state.bills.find((b) => b.id === el.dataset.id);
    if (bill) {
      bill.paid = !bill.paid;
      rerender();
    }
  } else if (action === 'goal-add' || action === 'goal-add-custom') {
    const goal = state.goals.find((g) => g.id === el.dataset.id);
    if (!goal) return;
    let amount = Number(el.dataset.amount || 0);
    if (action === 'goal-add-custom') {
      const input = document.getElementById(`goal-${goal.id}`);
      amount = Number(input ? input.value : 0);
    }
    if (Number.isFinite(amount) && amount >= 1000) {
      goal.saved = Math.min(goal.target, goal.saved + Math.round(amount));
      rerender();
    }
  } else if (action === 'save-plan') {
    saveState(state);
    const msg = document.getElementById('save-msg');
    if (msg) msg.textContent = 'Rencana tersimpan di peramban ini.';
  } else if (action === 'reset-plan') {
    const fresh = seedState();
    state.income = fresh.income;
    state.categories = fresh.categories;
    state.transactions = fresh.transactions;
    state.bills = fresh.bills;
    state.goals = fresh.goals;
    rerender();
  } else if (action === 'export-csv') {
    exportCsv();
  }
});

app.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'income-input') {
    const src = state.income.find((s) => s.id === el.dataset.id);
    if (src) {
      src.amount = Math.max(0, Math.round(Number(el.value) || 0));
      render();
      const again = document.getElementById(`inc-${el.dataset.id}`);
      if (again) {
        again.focus();
        again.setSelectionRange(again.value.length, again.value.length);
      }
    }
  } else if (action === 'budget-input' || action === 'budget-range') {
    const cat = state.categories.find((c) => c.id === el.dataset.id);
    if (cat) {
      cat.budget = Math.max(0, Math.round(Number(el.value) || 0));
      saveState(state);
      render();
    }
  } else if (action === 'tx-search') {
    state.txSearch = el.value;
    render();
    const again = document.getElementById('tx-q');
    if (again) {
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    }
  }
});

app.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  if (el.dataset.action === 'tx-type') {
    state.txFilter = el.value;
    render();
  } else if (el.dataset.action === 'tx-cat') {
    state.txCat = el.value;
    render();
  }
});

app.addEventListener('submit', (ev) => {
  const form = ev.target.closest('[data-action="tx-add-form"]');
  if (!form) return;
  ev.preventDefault();
  const data = new FormData(form);
  const amount = Math.round(Number(data.get('amount')) || 0);
  const desc = String(data.get('desc') || '').trim();
  const date = String(data.get('date') || '2026-11-26');
  const category = String(data.get('category') || 'lain');
  const income = data.get('kind') === 'masuk';
  const msg = document.getElementById('tx-msg');
  if (!desc || amount < 1000) {
    if (msg) msg.textContent = 'Isi keterangan dan jumlah minimal Rp1.000.';
    return;
  }
  state.transactions.push({
    id: 'u' + Date.now().toString(36),
    date,
    desc,
    category: income ? 'gaji' : category,
    amount,
    income,
  });
  saveState(state);
  render();
  const after = document.getElementById('tx-msg');
  if (after) after.textContent = `Ditambahkan: ${desc} ${income ? '+' : '−'}${fmtRp(amount)}.`;
});

window.addEventListener('hashchange', render);
render();
