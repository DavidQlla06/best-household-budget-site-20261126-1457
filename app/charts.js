// Grafik SVG buatan tangan untuk DompetKeluarga. Tanpa library, tanpa jaringan.
// Semua fungsi mengembalikan string SVG dan meng-escape label.

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const fmtRp = (n) =>
  'Rp' + Math.round(n).toLocaleString('id-ID');

export const fmtShort = (n) => {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (n >= 1000) return 'Rp' + Math.round(n / 1000) + ' rb';
  return fmtRp(n);
};

const pct = (n) => (n * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 });

// Donat pembagian pengeluaran per kategori.
export function donut(parts, size = 200) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 30;
  let angle = -Math.PI / 2;
  const arcs = parts
    .filter((p) => p.value > 0)
    .map((p) => {
      const frac = p.value / total;
      const a0 = angle;
      angle += frac * Math.PI * 2;
      const a1 = angle;
      const large = frac > 0.5 ? 1 : 0;
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${cx} ${cy} Z" fill="${p.color}"><title>${esc(p.label)}: ${fmtRp(p.value)} (${pct(frac)}%)</title></path>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Donat pembagian pengeluaran per kategori, total ${fmtRp(total)}">
  ${arcs}
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="#ffffff"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="15" font-weight="700" fill="#1a2b1a">Total keluar</text>
  <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="15" font-weight="700" fill="#1a2b1a">${fmtShort(total)}</text>
</svg>`;
}

// Batang berkelompok: pemasukan vs pengeluaran per bulan.
export function groupedBars(rows, width = 640, height = 260) {
  const max = Math.max(...rows.map((r) => Math.max(r.income, r.spent))) * 1.08;
  const padL = 64;
  const padB = 30;
  const padT = 14;
  const plotW = width - padL - 12;
  const plotH = height - padT - padB;
  const slot = plotW / rows.length;
  const barW = Math.min(30, slot / 3.4);
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + plotH * (1 - f);
    return `<line x1="${padL}" y1="${y}" x2="${width - 12}" y2="${y}" stroke="#e3e8e3" stroke-width="1"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#5a6b5a">${fmtShort(max * f)}</text>`;
  }).join('');
  const bars = rows
    .map((r, i) => {
      const x = padL + slot * i + slot / 2;
      const hIn = (r.income / max) * plotH;
      const hSp = (r.spent / max) * plotH;
      return `<rect x="${(x - barW - 3).toFixed(1)}" y="${(padT + plotH - hIn).toFixed(1)}" width="${barW}" height="${hIn.toFixed(1)}" rx="2" fill="#2e7d32"><title>${esc(r.month)} pemasukan: ${fmtRp(r.income)}</title></rect>
      <rect x="${(x + 3).toFixed(1)}" y="${(padT + plotH - hSp).toFixed(1)}" width="${barW}" height="${hSp.toFixed(1)}" rx="2" fill="#c62828"><title>${esc(r.month)} pengeluaran: ${fmtRp(r.spent)}</title></rect>
      <text x="${x.toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#334433">${esc(r.month)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Batang pemasukan hijau dan pengeluaran merah per bulan, Juni sampai November 2026">
  ${grid}
  <line x1="${padL}" y1="${padT + plotH}" x2="${width - 12}" y2="${padT + plotH}" stroke="#b9c4b9" stroke-width="1"/>
  ${bars}
</svg>`;
}

// Garis tren tingkat tabungan (pemasukan − pengeluaran) per bulan.
export function savingsLine(rows, width = 640, height = 220) {
  const vals = rows.map((r) => r.income - r.spent);
  const max = Math.max(...vals) * 1.15;
  const min = Math.min(0, Math.min(...vals) * 1.15);
  const padL = 64;
  const padB = 30;
  const padT = 14;
  const plotW = width - padL - 12;
  const plotH = height - padT - padB;
  const y = (v) => padT + plotH * (1 - (v - min) / (max - min));
  const x = (i) => padL + (plotW * i) / (rows.length - 1);
  const pts = rows.map((r, i) => `${x(i).toFixed(1)},${y(vals[i]).toFixed(1)}`).join(' ');
  const dots = rows
    .map((r, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(vals[i]).toFixed(1)}" r="4.5" fill="#ad1457"><title>${esc(r.month)}: menabung ${fmtRp(vals[i])}</title></circle>
    <text x="${x(i).toFixed(1)}" y="${y(vals[i]).toFixed(1) - 10}" text-anchor="middle" font-size="11" fill="#5a3a4a">${fmtShort(vals[i])}</text>
    <text x="${x(i).toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#334433">${esc(r.month)}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Garis jumlah yang berhasil ditabung tiap bulan, Juni sampai November 2026">
  <line x1="${padL}" y1="${y(0)}" x2="${width - 12}" y2="${y(0)}" stroke="#b9c4b9" stroke-width="1"/>
  <text x="${padL - 6}" y="${y(max) + 4}" text-anchor="end" font-size="11" fill="#5a6b5a">${fmtShort(max)}</text>
  <text x="${padL - 6}" y="${y(0) + 4}" text-anchor="end" font-size="11" fill="#5a6b5a">Rp0</text>
  <polyline points="${pts}" fill="none" stroke="#ad1457" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${dots}
</svg>`;
}
