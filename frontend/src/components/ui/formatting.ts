const ftFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 });
const kwhFormatter = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function formatFt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return ftFormatter.format(Math.round(n));
}

export function formatKwh(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return kwhFormatter.format(n);
}

export function formatPct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function initialsFor(name: string): string {
  const m = name.match(/Haz_(\d+)/);
  return m ? `H${m[1]}` : name.slice(0, 2).toUpperCase();
}

export function accentFor(name: string): string {
  const palette = [
    "from-sky-500 to-sky-600",
    "from-indigo-500 to-indigo-600",
    "from-fuchsia-500 to-fuchsia-600",
    "from-amber-500 to-amber-600",
    "from-emerald-500 to-emerald-600",
    "from-rose-500 to-rose-600",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
