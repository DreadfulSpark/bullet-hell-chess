// Test-only balance bot. Loaded by serve.ps1 on ?shim&bot. Plays like a human with a reaction time
// and a chance to miss each telegraph or meteor mark.
(() => {
const g = window.__g, VAL = { P:1, N:3, B:3, R:5, Q:9, K:20 };
let ATTN = .7;
const seen = new WeakMap();
const noticed = o => { if (!seen.has(o)) seen.set(o, Math.random() < ATTN); return seen.get(o) };

function danger(){
  const s = new Set();
  for (const p of g.pieces) {
    if (p.side !== 'foe' || g.fogged(p) || p.cd > 1.1) continue;
    if (p.t === 'P') { s.add(p.x - 1 + (p.y + 1) * 8); s.add(p.x + 1 + (p.y + 1) * 8); continue }
    for (const m of g.moves(p)) s.add(m.x + m.y * 8);
  }
  return s;
}
const bad = (x, y) => { const h = g.haz; return (h && h.type === 'lava' && h.tiles.has(x + y * 8)) || g.struck(x + y * 8) };

function act(){
  const ready = g.pieces.filter(p => p.side === 'me' && p.cd <= 0);
  if (!ready.length) return;
  const D = danger();
  const go = (p, m) => { g.click(p.x, p.y); g.click(m.x, m.y); return true };
  const capOf = tgt => { for (const p of ready.slice().sort((a, b) => VAL[a.t] - VAL[b.t])) { const m = g.moves(p).find(m => m.cap === tgt); if (m && !bad(m.x, m.y)) return [p, m] } };
  const safeMove = p => { const ms = g.moves(p).filter(m => !bad(m.x, m.y) && !D.has(m.x + m.y * 8)); ms.sort((a, b) => (b.cap ? VAL[b.cap.t] : 0) - (a.cap ? VAL[a.cap.t] : 0)); return ms[0] };
  const tl = g.tele.filter(t => t.victim && t.victim.side === 'me' && g.pieces.includes(t.victim) && noticed(t));
  for (const t of tl.filter(t => t.victim.t === 'K')) {
    const c = capOf(t.p); if (c) return go(...c);
    if (t.victim.cd <= 0) { const m = safeMove(t.victim) || g.moves(t.victim).find(m => !bad(m.x, m.y)); if (m) return go(t.victim, m) }
  }
  for (const p of ready) { const m = g.moves(p).find(m => m.cap && m.cap.t === 'K'); if (m) return go(p, m) }
  for (const t of tl.sort((a, b) => VAL[b.victim.t] - VAL[a.victim.t])) {
    if (VAL[t.victim.t] < 3) break;
    const c = capOf(t.p); if (c) return go(...c);
    if (t.victim.cd <= 0) { const m = safeMove(t.victim); if (m) return go(t.victim, m) }
  }
  const h = g.haz;
  if (h && h.type === 'meteor') for (const s of h.strikes) {
    if (!noticed(s)) continue;
    const p = ready.find(p => p.x + p.y * 8 === s.i && p.t !== 'K');
    const m = p && g.moves(p).find(m => !bad(m.x, m.y));
    if (m) return go(p, m);
  }
  let best = null, bs = 0;
  for (const p of ready) for (const m of g.moves(p)) {
    if (!m.cap || g.fogged(m.cap) || bad(m.x, m.y)) continue;
    const s = VAL[m.cap.t] * 10 - (D.has(m.x + m.y * 8) ? VAL[p.t] * 8 : 0) + Math.random();
    if (s > bs) { bs = s; best = [p, m] }
  }
  if (best) return go(...best);
  best = null; bs = -1e9;
  for (const p of ready) { if (p.t === 'K') continue; for (const m of g.moves(p)) {
    if (bad(m.x, m.y) || D.has(m.x + m.y * 8)) continue;
    const s = (p.y - m.y) * .6 + (p.t === 'P' ? 0 : .8) + Math.random() * 2 - (m.y < 2 ? 1 : 0);
    if (s > bs) { bs = s; best = [p, m] }
  } }
  if (best && Math.random() < .7) return go(...best);
}

// Plays one run to maxWave. pref: upgrade id to always take when offered.
function run({ react = .55, maxWave = 15, pref = null, load = null } = {}){
  try { localStorage.removeItem('bhc-run') } catch (e) {}
  localStorage.setItem('bhc-loadout', JSON.stringify(load || []));
  document.querySelector('#startBtn').click();
  // Loadout: keep the given picks, or pick at random.
  const opts = [...document.querySelectorAll('#loadout button')];
  while (document.querySelector('#goBtn').disabled) opts.splice(Math.floor(Math.random() * opts.length), 1)[0].click();
  document.querySelector('#goBtn').click();
  const log = []; let cur = null, tA = 0, steps = 0, ws = 0; const dt = 1 / 60;
  while (steps++ < 60 * 60 * 40) {
    const S = g.S();
    if (g.mode === 'countdown' && (!cur || cur.wave !== S.wave)) { cur = { wave:S.wave, haz:g.haz && g.haz.type, boss:g.boss && g.boss.kind }; ws = 0 }
    if (g.mode === 'play') {
      ws++; tA -= dt;
      if (tA <= 0) { tA = react * (.7 + Math.random() * .6); act() }
      if (ws > 60 * 150) { cur.res = 'stall'; log.push(cur); break }
    }
    g.update(dt);
    if (g.mode === 'paused') document.querySelector('#resumeBtn').click();
    if (g.mode === 'win') {
      cur.res = 'win'; cur.t = ws / 60; log.push(cur);
      if (S.wave >= maxWave) break;
      document.querySelector('#endlessBtn').click();
    }
    if (g.mode === 'upgrade') {
      if (log[log.length - 1] !== cur) { cur.res = 'win'; cur.t = ws / 60; log.push(cur) }
      if (S.wave >= maxWave) break;
      const cards = [...document.querySelectorAll('#cards button')];
      (cards.find(b => b.id === 'up-' + pref) || cards[Math.floor(Math.random() * cards.length)]).click();
    }
    if (g.mode === 'over') { cur.res = 'lose'; cur.t = ws / 60; log.push(cur); break }
  }
  document.querySelectorAll('.ov').forEach(o => o.hidden = true);
  return log;
}

function batch(n, react, attn, opts = {}){
  ATTN = attn;
  const maxWave = opts.maxWave || 15, reach = [], byHaz = {}, byBoss = {}, tN = [], tB = [];
  for (let i = 0; i < n; i++) {
    const log = run({ react, maxWave, pref:opts.pref, load:opts.load });
    const last = log[log.length - 1];
    reach.push(last.res === 'win' ? maxWave + 1 : last.wave);
    for (const w of log) {
      const k = w.haz || 'none'; (byHaz[k] = byHaz[k] || [0, 0])[w.res === 'win' ? 0 : 1]++;
      if (w.boss) { const b = byBoss[w.boss] = byBoss[w.boss] || [0, 0, 0]; b[w.res === 'win' ? 0 : 1]++; if (w.res === 'win') b[2] += w.t }
      if (w.res === 'win') (w.boss ? tB : tN).push(w.t);
    }
  }
  return { n, reach, byHaz, byBoss, tN, tB };
}
// Merges batches and turns them into loss rates.
function summary(list){
  const m = { reach:[], byHaz:{}, byBoss:{}, tN:[], tB:[] };
  for (const b of list) {
    m.reach.push(...b.reach); m.tN.push(...b.tN); m.tB.push(...b.tB);
    for (const k in b.byHaz) { const a = m.byHaz[k] = m.byHaz[k] || [0, 0]; a[0] += b.byHaz[k][0]; a[1] += b.byHaz[k][1] }
    for (const k in b.byBoss) { const a = m.byBoss[k] = m.byBoss[k] || [0, 0, 0]; for (let i = 0; i < 3; i++) a[i] += b.byBoss[k][i] }
  }
  const avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null;
  const r = m.reach.slice().sort((a, b) => a - b), hist = {};
  r.forEach(w => hist[w] = (hist[w] || 0) + 1);
  const pct = ([w, l]) => Math.round(100 * l / (w + l)) + '%/' + (w + l);
  return {
    runs:r.length, median:r[r.length >> 1], mean:avg(r), cleared:r.filter(x => x === 16).length, hist,
    haz:Object.fromEntries(Object.entries(m.byHaz).map(([k, v]) => [k, pct(v)])),
    boss:Object.fromEntries(Object.entries(m.byBoss).map(([k, v]) => [k, pct(v) + ' ' + (v[2] / Math.max(1, v[0])).toFixed(0) + 's'])),
    normT:avg(m.tN), bossT:avg(m.tB),
  };
}
// Results survive page reloads so long sweeps can run in short chunks.
const store = {
  get(){ try { return JSON.parse(localStorage.getItem('bot-results')) || {} } catch (e) { return {} } },
  add(key, b){ const s = store.get(); (s[key] = s[key] || []).push(b); localStorage.setItem('bot-results', JSON.stringify(s)) },
  clear(){ localStorage.removeItem('bot-results') },
};
window.BOT = { act, run, batch, summary, store,
  chunk(key, n, react, attn, opts){ store.add(key, batch(n, react, attn, opts)); return summary(store.get()[key]) } };
})();
