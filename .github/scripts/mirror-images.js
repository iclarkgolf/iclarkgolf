/**
 * 2026-10-31 imgbb 사진을 우리 사이트(GitHub) 안으로 옮기기 — 자동
 *
 * 왜: 사이트 사진 대부분이 무료 사진 보관 사이트 imgbb(i.ibb.co)에 있는데, imgbb가 멈추면
 *     패키지·숙소·중고장터 사진이 "service unavailable" 그림으로 바뀌어 사이트가 깨진다.
 *
 * 하는 일 (6시간마다 update-homepage-content.yml 맨 앞에서 자동 실행, PJ가 할 일 없음):
 *  1) [바꾸기] 이미 우리 저장소에 복사해 둔 사진(images/m/manifest.json에 적힌 것)은
 *     Firestore 모든 문서와 저장소의 .html 파일에서 imgbb 주소 → 우리 주소로 바꾼다.
 *     (복사본이 먼저 사이트에 배포된 "다음 실행"에서 바꾸므로 사진이 비는 순간이 없음)
 *  2) [복사] 아직 복사 안 된 imgbb 사진을 내려받아 images/m/ 에 저장하고 목록에 적는다.
 *     imgbb가 고장 나서 진짜 사진 대신 "service unavailable" 그림을 주면 저장하지 않는다
 *     (서로 다른 주소가 똑같은 그림을 주면 고장 그림으로 판단) → 다음 실행 때 다시 시도.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

const ROOT = path.join(__dirname, '..', '..');
const DIR = path.join(ROOT, 'images', 'm');
const MANIFEST = path.join(DIR, 'manifest.json');
const SITE = 'https://iclarkgolf.com/images/m/';
const RE = /https?:\/\/i\.ibb\.co\/[A-Za-z0-9]+\/[^"'\s)<>\\`]+/g;
const MAX_NEW_PER_RUN = 300;

function initFirebase() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT 환경변수(GitHub Secret)가 없습니다.');
  if (admin.apps && admin.apps.length) return admin.firestore();
  const sa = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
  return admin.firestore();
}
const isPlain = (v) => v && typeof v === 'object' && (v.constructor === Object || Object.getPrototypeOf(v) === null);

// 문서 안의 모든 글자에서 imgbb 주소를 찾거나 바꾼다 (날짜·참조 같은 특수 값은 그대로 둠)
function walk(v, fn) {
  if (typeof v === 'string') return fn(v);
  if (Array.isArray(v)) return v.map((x) => walk(x, fn));
  if (isPlain(v)) { const o = {}; for (const k of Object.keys(v)) o[k] = walk(v[k], fn); return o; }
  return v;
}
function fileNameFor(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);           // [id, name]
  let name = decodeURIComponent(parts.slice(1).join('_') || 'img').replace(/[^A-Za-z0-9._-]/g, '_');
  if (!/\.(jpe?g|png|gif|webp)$/i.test(name)) name += '.jpg';
  return `${parts[0]}_${name}`.slice(0, 120);
}

async function main() {
  const db = initFirebase();
  fs.mkdirSync(DIR, { recursive: true });
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  const mirrored = (url) => manifest[url] && fs.existsSync(path.join(DIR, manifest[url]));
  const swap = (s) => s.replace(RE, (u) => (mirrored(u) ? SITE + manifest[u] : u));
  const found = new Set();

  // ── 1) Firestore: 바꾸기 + 남은 imgbb 주소 모으기 ──
  const cols = await db.listCollections();
  let changedDocs = 0;
  for (const col of cols) {
    const snap = await col.get();
    for (const doc of snap.docs) {
      const data = doc.data();
      const before = JSON.stringify(data);
      const after = walk(data, swap);
      if (JSON.stringify(after) !== before) { await doc.ref.set(after); changedDocs++; console.log(`  🔁 ${col.id}/${doc.id} 주소 바꿈`); }
      walk(after, (s) => { (s.match(RE) || []).forEach((u) => found.add(u)); return s; });
    }
  }

  // ── 1-b) 저장소 .html 파일: 바꾸기 + 모으기 ──
  let changedFiles = 0;
  for (const f of fs.readdirSync(ROOT)) {
    if (!f.endsWith('.html')) continue;
    const p = path.join(ROOT, f);
    const s = fs.readFileSync(p, 'utf8');
    const t = swap(s);
    if (t !== s) { fs.writeFileSync(p, t); changedFiles++; console.log(`  🔁 ${f} 주소 바꿈`); }
    (t.match(RE) || []).forEach((u) => found.add(u));
  }

  // ── 2) 아직 복사 안 된 사진 내려받기 ──
  const todo = [...found].filter((u) => !mirrored(u)).slice(0, MAX_NEW_PER_RUN);
  const got = [];
  for (const url of todo) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (iclarkgolf image backup)' } });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/')) { console.log(`  ⏭ ${url} — ${r.status} ${type}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 3000) { console.log(`  ⏭ ${url} — 너무 작음(${buf.length}B)`); continue; }
      got.push({ url, buf, hash: crypto.createHash('sha256').update(buf).digest('hex') });
    } catch (e) { console.log(`  ⏭ ${url} — ${e.message}`); }
  }
  // 서로 다른 주소가 똑같은 그림 = imgbb 고장 안내 그림 → 저장 안 함
  const count = {};
  got.forEach((g) => { count[g.hash] = (count[g.hash] || 0) + 1; });
  let saved = 0, broken = 0;
  for (const g of got) {
    if (count[g.hash] > 1) { broken++; continue; }
    const name = fileNameFor(g.url);
    fs.writeFileSync(path.join(DIR, name), g.buf);
    manifest[g.url] = name; saved++;
    console.log(`  ✅ ${name} (${Math.round(g.buf.length / 1024)}KB)`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`imgbb 주소 ${found.size}개 발견 · 새로 복사 ${saved} · 고장 그림이라 건너뜀 ${broken} · 문서 ${changedDocs}개/파일 ${changedFiles}개 주소 바꿈`);
  if (saved) console.log('→ 새로 복사한 사진은 다음 자동 실행 때 사이트 주소가 우리 쪽으로 바뀝니다.');
}

main().catch((e) => { console.error(e); process.exit(1); });
