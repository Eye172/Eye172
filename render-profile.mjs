import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Original SVG artwork and public-data widgets for github.com/Eye172.
// --metrics-only refreshes data; --offline uses public-response fixtures.
const dir = path.dirname(fileURLToPath(import.meta.url));
await mkdir(dir, { recursive: true });
const esc = v => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const palettes = {
  dark: { bg: '#0d0d12', fg: '#e7e3de', muted: '#aaa6b5', gold: '#c5ad79', line: '#36313c', levels: ['#25232d', '#675968', '#91808b', '#b9a7a4', '#dfc695'] },
  light: { bg: '#f6f3ee', fg: '#27232d', muted: '#655d70', gold: '#80612a', line: '#d2cad1', levels: ['#e6dfe5', '#b4a4ba', '#927c9b', '#705c7e', '#634d25'] },
};
const mono = 'font-family="Consolas,Menlo,monospace"';
const text = (x, y, size, fill, value, attrs = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs}>${esc(value)}</text>`;
const svg = (w, h, c, title, body, style = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:Arial,Helvetica,sans-serif}text[font-family]{font-family:Consolas,Menlo,monospace}${style}</style><rect width="${w}" height="${h}" fill="${c.bg}"/>${body}</svg>\n`;
const save = (name, value) => writeFile(path.join(dir, name), value);
const gaussian = (x, y, cx, cy, rx, ry) => Math.exp(-((x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2) * 2);

function moon(cx, cy, radius, c, mobile = false) {
  // Shaded sphere, lunar maria and crater rims, drawn entirely as ASCII.
  let rows = '';
  const chars = '.:-=+*#%@';
  const stepX = mobile ? 5 : 5.5, stepY = mobile ? 8.5 : 9.4, font = mobile ? 9 : 10;
  const craters = [[-.55, .33, .13], [.35, .47, .09], [.04, -.62, .07], [.62, -.22, .13], [-.36, -.37, .075], [-.15, .65, .13], [.2, .11, .06], [.47, -.55, .08]];
  for (let py = -radius; py <= radius; py += stepY) {
    let line = '';
    for (let px = -radius; px <= radius; px += stepX) {
      const x = px / radius, y = py / radius;
      if (x * x + y * y > 1) continue;
      const z = Math.sqrt(1 - x * x - y * y);
      const maria = .43 * gaussian(x, y, -.4, -.18, .55, .43) + .38 * gaussian(x, y, .15, -.43, .43, .4) + .31 * gaussian(x, y, -.16, .2, .35, .4);
      let relief = 0;
      for (const [a, b, r] of craters) {
        const d = Math.hypot(x - a, y - b) / r;
        relief += .18 * Math.exp(-(((d - 1) / .2) ** 2)) - .18 * Math.exp(-((d / .65) ** 2));
      }
      const grain = .08 * Math.sin(x * 73 + y * 17) * Math.cos(y * 53 - x * 29) + .055 * Math.sin(x * 137 + y * 211);
      const illumination = .28 + .72 * Math.max(0, .18 * x - .22 * y + .96 * z);
      const value = Math.max(.025, Math.min(.99, (.9 - maria + relief + grain) * illumination));
      const char = chars[Math.floor(value * (chars.length - 1))];
      line += `<tspan x="${(cx + px).toFixed(1)}" opacity="${(.23 + value * .77).toFixed(2)}">${char}</tspan>`;
    }
    if (line) rows += `<text class="moon-row" y="${(cy + py + font * .35).toFixed(1)}" font-size="${font}" fill="${c.fg}" ${mono} style="--delay:${((py + radius) / (radius * 2) * 1.4).toFixed(2)}s">${line}</text>`;
  }
  return rows;
}

// Finite entrance animations; no perpetual movement or autoplaying media.
// Reduced-motion users get the complete still image immediately.
const motion = `@media(prefers-reduced-motion:no-preference){.moon-row{animation:reveal 1.8s ease both;animation-delay:var(--delay)}.moon-halo{animation:halo 4.4s ease both}.star{animation:star 4.4s ease both;animation-delay:var(--delay,0s)}.activity-cell{animation:cell 1s ease both;animation-delay:var(--delay)}}@keyframes reveal{0%{opacity:0;transform:translateY(5px)}100%{opacity:1;transform:translateY(0)}}@keyframes halo{0%{opacity:0;stroke-dasharray:0 1200}55%{opacity:.7}100%{opacity:.35;stroke-dasharray:1100 100}}@keyframes star{0%{opacity:0}35%{opacity:1}100%{opacity:.35}}@keyframes cell{from{opacity:0}to{opacity:1}}`;

function header(c, mobile = false) {
  const w = mobile ? 480 : 1120, h = mobile ? 440 : 420;
  const cx = mobile ? 338 : 880, cy = mobile ? 291 : 199, r = mobile ? 102 : 158;
  let body = `<defs><radialGradient id="glow"><stop stop-color="${c.gold}" stop-opacity=".07"/><stop offset="1" stop-color="${c.gold}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r * 1.35}" fill="url(#glow)"/><circle class="moon-halo" cx="${cx}" cy="${cy}" r="${r + 20}" fill="none" stroke="${c.gold}" stroke-width=".85" opacity=".35" stroke-dasharray="1100 100" transform="rotate(-80 ${cx} ${cy})"/>`;
  for (let i = 0; i < 80; i++) {
    const a = i * Math.PI / 40;
    const inner = r + 23, outer = inner + (i % 5 === 0 ? 9 : 3);
    body += `<path d="M${(cx + Math.cos(a) * inner).toFixed(1)} ${(cy + Math.sin(a) * inner).toFixed(1)}L${(cx + Math.cos(a) * outer).toFixed(1)} ${(cy + Math.sin(a) * outer).toFixed(1)}" stroke="${c.gold}" stroke-width=".65" opacity=".22"/>`;
  }
  const stars = mobile ? [[205, 238, 3], [443, 159, 2], [173, 335, 2], [245, 403, 2]] : [[688, 64, 3], [1047, 83, 4], [689, 306, 2], [1080, 310, 2], [622, 205, 2], [762, 358, 3]];
  stars.forEach(([x, y, s], i) => { body += `<path class="star" style="--delay:${i * .06}s" d="M${x - s} ${y}h${s * 2}M${x} ${y - s}v${s * 2}" stroke="${c.gold}" stroke-width="1" opacity=".35"/>`; });
  body += moon(cx, cy, r, c, mobile);
  const x = mobile ? 30 : 56;
  body += text(x, mobile ? 40 : 55, mobile ? 18 : 21, c.gold, 'EYE172', `${mono} letter-spacing="3"`);
  body += text(x - 2, mobile ? 108 : 169, mobile ? 51 : 84, c.fg, 'Shakhnazar', 'style="font-family:Georgia,Times New Roman,serif" letter-spacing="-2"');
  body += text(x - 2, mobile ? 168 : 257, mobile ? 51 : 84, c.fg, 'Akhmer', 'style="font-family:Georgia,Times New Roman,serif" letter-spacing="-2"');
  if (mobile) {
    body += text(x, 216, 18, c.muted, 'Software · ML');
    body += text(x, 243, 18, c.muted, 'Product engineering');
  } else body += text(x, 335, 26, c.muted, 'Software · ML · Product engineering');
  body += `<path d="M${x} ${h - 22}H${w - x}" stroke="${c.line}"/>`;
  return svg(w, h, c, 'Shakhnazar Akhmer — Software, ML & product engineering. ASCII Moon artwork.', body, motion);
}
if (!process.argv.includes('--metrics-only')) {
  for (const [theme, c] of Object.entries(palettes)) {
    await save(`header-${theme}.svg`, header(c));
    await save(`header-mobile-${theme}.svg`, header(c, true));
  }
}

async function get(url, asText = false) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Eye172-profile', Accept: asText ? 'text/html' : 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return asText ? response.text() : response.json();
}
let repos = [], graph;
if (process.argv.includes('--offline')) {
  repos = JSON.parse((await readFile(path.join(dir, 'repos-source.json'), 'utf8')).replace(/^\uFEFF/, ''));
  graph = await readFile(path.join(dir, 'contributions-source.html'), 'utf8');
} else {
  graph = await get('https://github.com/users/Eye172/contributions', true);
  for (let page = 1; ; page++) {
    const batch = await get(`https://api.github.com/users/Eye172/repos?per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
}
const cells = [...graph.matchAll(/<td\b[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="([0-4])"[^>]*>/g)].map(m => ({ date: m[1], id: m[2], level: Number(m[3]) }));
if (cells.length < 300) throw new Error('GitHub calendar markup changed; keeping the last successful widgets.');
const tips = new Map([...graph.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)].map(m => [m[1], m[2].trim()]));
for (const cell of cells) {
  const label = tips.get(cell.id);
  if (!label) throw new Error(`Missing contribution count for ${cell.date}`);
  cell.count = /^No contributions/.test(label) ? 0 : Number(label.match(/^([\d,]+) contributions?/)?.[1]?.replaceAll(',', ''));
  if (!Number.isFinite(cell.count)) throw new Error(`Unrecognized contribution count: ${label}`);
}
cells.sort((a, b) => a.date.localeCompare(b.date));
const days = cells.slice(-112);
const total = days.reduce((sum, day) => sum + day.count, 0);
const active = days.filter(day => day.count > 0).length;
const selected = repos.filter(r => !r.fork && r.name !== 'Eye172' && r.size > 0);
const counts = {};
for (const repo of selected) if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
const languages = Object.entries(counts).sort((a, b) => b[1] - a[1]);
const date = cells.at(-1).date;
const title = `${total} public GitHub contributions across ${active} active days in the last 16 weeks, ${days[0].date} to ${date}. ${selected.length} original public code repositories. Primary languages: ${languages.map(([name, count]) => `${name} ${count}`).join(', ')}.`;
for (const [theme, c] of Object.entries(palettes)) {
  for (const mobile of [false, true]) {
    const w = mobile ? 480 : 960, h = mobile ? 550 : 300;
    let body = text(30, 44, 27, c.fg, 'Code & activity', 'font-weight="600"');
    body += text(mobile ? 30 : 930, mobile ? 76 : 43, mobile ? 20 : 18, c.muted, `Updated ${date}`, `${mono} ${mobile ? '' : 'text-anchor="end"'}`);
    const top = mobile ? 122 : 104;
    body += text(30, top, 34, c.fg, total, `${mono} font-weight="600"`);
    body += text(mobile ? 105 : 115, top - 3, mobile ? 23 : 20, c.muted, 'public contributions');
    body += text(mobile ? 105 : 115, top + 26, mobile ? 21 : 18, c.muted, 'past 16 weeks');
    const size = mobile ? 22 : 19, gap = 5;
    const graphX = mobile ? 30 : 535, graphY = mobile ? 175 : 89;
    days.forEach((day, i) => {
      body += `<rect class="activity-cell" style="--delay:${(Math.floor(i / 7) * .055).toFixed(2)}s" x="${graphX + Math.floor(i / 7) * (size + gap)}" y="${graphY + i % 7 * (size + gap)}" width="${size}" height="${size}" rx="2" fill="${c.levels[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`;
    });
    const langTop = mobile ? 414 : 181;
    body += text(30, langTop, mobile ? 23 : 21, c.fg, `${selected.length} public code repositories`, 'font-weight="600"');
    body += text(30, langTop + 32, mobile ? 22 : 20, c.muted, languages.map(([name, count]) => `${name === 'Jupyter Notebook' ? 'Notebooks' : name} ${count}`).join(' · '));
    body += text(30, mobile ? 496 : 262, mobile ? 20 : 18, c.muted, 'Original, non-empty repositories');
    if (mobile) body += text(30, 525, 20, c.muted, 'Counts by primary language');
    else body += text(535, 262, 18, c.muted, 'Less', mono) + c.levels.map((color, i) => `<rect x="${592 + i * 24}" y="249" width="17" height="17" rx="2" fill="${color}"/>`).join('') + text(722, 262, 18, c.muted, 'More', mono) + text(930, 262, 18, c.muted, `${active} active days`, 'text-anchor="end"');
    await save(`activity-${mobile ? 'mobile-' : ''}${theme}.svg`, svg(w, h, c, title, body, motion));
  }
}
console.log(JSON.stringify({ repositories: selected.length, languages: counts, contributions: total, activeDays: active, from: days[0].date, to: date }));
