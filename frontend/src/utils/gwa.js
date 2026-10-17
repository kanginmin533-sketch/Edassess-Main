// GWA = GenEd x 0.20 + ProfEd x 0.40 + Major x 0.40. Passing = 75%.
export const LET_CATEGORIES = ['GenEd', 'ProfEd', 'Major'];
export const GWA_WEIGHTS = { GenEd: 0.2, ProfEd: 0.4, Major: 0.4 };
export const PASSING_GWA = 75;
export const MIN_PER_AREA = 50; // PRC floor: walang area na below 50%

const round2 = (n) => Math.round(n * 100) / 100;

export const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));
export const points = (pct, cat) => round2(pct * GWA_WEIGHTS[cat]);

// history = newest-first. Kinukuha ang pinakahuling attempt bawat category.
export function computeGwa(history = []) {
  const latestByCategory = {};
  history.forEach((a) => {
    if (LET_CATEGORIES.includes(a.short) && !latestByCategory[a.short]) {
      latestByCategory[a.short] = a;
    }
  });

  const missing = LET_CATEGORIES.filter((c) => !latestByCategory[c]);
  if (missing.length > 0) return { complete: false, missing, latestByCategory };

  const weighted = {};
  let total = 0;
  LET_CATEGORIES.forEach((c) => {
    weighted[c] = points(latestByCategory[c].percentage, c);
    total += weighted[c];
  });
  const gwa = round2(total);

  const failedAreas = LET_CATEGORIES.filter((c) => latestByCategory[c].percentage < MIN_PER_AREA);

  return {
    complete: true,
    gwa,
    combinedAverage: gwa,
    weighted,
    failedAreas,
    passed: gwa >= PASSING_GWA && failedAreas.length === 0,
    latestByCategory,
  };
}
