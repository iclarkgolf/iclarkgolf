/**
 * 2026-10-31 중고장터 — 페이스북 공유용 물건별 미리보기 페이지 만들기
 *
 * 페이스북은 링크를 올릴 때 그 페이지의 og: 태그(사진·제목·설명)를 읽어 미리보기 카드를 만든다.
 * shop.html은 물건 정보를 자바스크립트로 나중에 채우기 때문에 페이스북 로봇에게는 물건 사진·가격이 안 보인다.
 *
 * 그래서 Firestore(settings/shop)의 물건마다 shop-<아이디>.html 이라는 작은 페이지를 만든다.
 *  - 페이스북 로봇: 이 페이지의 og: 태그로 "사진 + 영어 이름 + 페소 가격" 미리보기를 만든다
 *  - 사람: 자바스크립트로 곧바로 shop.html?item=<아이디> (그 물건 상세 화면)으로 넘어간다
 * 목록은 shop-manifest.json에 적어 두고, shop.html·admin.html의 "페이스북 공유" 버튼이 이 목록을 보고
 * 미리보기 페이지가 있는 물건만 그 주소로 공유한다. 지워진 물건의 페이지는 자동으로 지운다.
 *
 * 6시간마다(update-homepage-content.yml) 자동 실행된다.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ROOT = path.join(__dirname, '..', '..');
const SITE = 'https://iclarkgolf.com';
const MANIFEST = path.join(ROOT, 'shop-manifest.json');

const CAT_EN = { '드라이버':'Driver','우드':'Fairway Wood','유틸리티':'Hybrid / Utility','아이언':'Irons','웨지':'Wedge','퍼터':'Putter','풀세트':'Full Set','골프백':'Golf Bag','의류·기타':'Apparel & Others' };
const COND_EN = { '새것 (미사용)':'New (unused)','아주 좋음 (사용감 거의 없음)':'Excellent (barely used)','좋음 (잔기스 약간)':'Good (minor scratches)','보통 (사용감 있음)':'Fair (visible wear)','사용감 많음':'Well used' };

function initFirebase() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT 환경변수(GitHub Secret)가 없습니다.');
  if (admin.apps && admin.apps.length) return admin.firestore();
  const sa = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
  return admin.firestore();
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])).replace(/\n/g, ' ');
const safeId = (id) => /^[A-Za-z0-9_-]{1,40}$/.test(String(id || ''));

function page(it, php) {
  const nameEn = it.nameEn || ((it.brand ? it.brand + ' ' : '') + (CAT_EN[it.category] || it.category || 'Golf gear'));
  const sold = it.status === 'sold';
  const priceTxt = sold ? 'SOLD' : [php ? '₱' + php.toLocaleString('en-US') : '', '₩' + (Number(it.priceKrw) || 0).toLocaleString('en-US')].filter(Boolean).join(' / ');
  const where = /클락/.test(it.location || '') ? 'Clark / Angeles' : 'Korea → can be brought to Clark';
  const title = `${nameEn} — ${priceTxt} | iCLARKGOLF Used Golf Gear`;
  const desc = [
    COND_EN[it.condition] || it.condition || '',
    where,
    it.descriptionEn || '',
    'GCash · Cash · Card. Message us: m.me/iclarkgolf',
    `${it.name} ${sold ? '판매완료' : '₩' + (Number(it.priceKrw) || 0).toLocaleString('en-US')}`,
  ].filter(Boolean).join(' · ').slice(0, 290);
  const img = (it.photos || [])[0] || `${SITE}/web-h12.jpg`;
  const self = `${SITE}/shop-${it.id}.html`;
  const target = `shop.html?item=${encodeURIComponent(it.id)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${SITE}/${target}">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="iCLARKGOLF">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(self)}">
<meta name="twitter:card" content="summary_large_image">
<script>
  // 사람은 곧바로 물건 상세 화면으로 (한국어 브라우저면 한국어, 아니면 영어)
  (function(){
    var q = new URLSearchParams(location.search).get('lang');
    var l = q === 'kr' || q === 'en' ? q : (/^ko/i.test(navigator.language || '') ? 'kr' : 'en');
    location.replace('${target}&lang=' + l);
  })();
</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px 16px;">
<p><img src="${esc(img)}" alt="${esc(nameEn)}" style="max-width:320px;width:100%;border-radius:12px;"></p>
<h1 style="font-size:20px;">${esc(nameEn)}</h1>
<p>${esc(priceTxt)}</p>
<p><a href="${target}">View item / 물건 보기 →</a></p>
</body>
</html>
`;
}

async function main() {
  const db = initFirebase();
  const [shopSnap, exSnap] = await Promise.all([db.doc('settings/shop').get(), db.doc('settings/exchange').get()]);
  const items = ((shopSnap.exists && shopSnap.data().items) || []).filter((it) => it && it.name && it.visible !== false && safeId(it.id));
  const ex = exSnap.exists ? exSnap.data() : {};
  const krwPerPhp = Number(ex.usdKrw) ? Number(ex.usdKrw) / (Number(ex.appliedUsdPhp) || 53.2) : 0;
  const phpOf = (it) => (Number(it.pricePhp) > 0 ? Number(it.pricePhp) : (krwPerPhp ? Math.ceil((Number(it.priceKrw) || 0) / krwPerPhp / 50) * 50 : 0));

  const ids = [];
  for (const it of items) {
    fs.writeFileSync(path.join(ROOT, `shop-${it.id}.html`), page(it, phpOf(it)));
    ids.push(it.id);
    console.log(`  ✅ shop-${it.id}.html — ${it.nameEn || it.name}`);
  }
  // 지워졌거나 숨긴 물건의 옛 페이지 정리 (shop.html 자체는 이름이 달라 건드리지 않음)
  for (const f of fs.readdirSync(ROOT)) {
    const m = f.match(/^shop-([A-Za-z0-9_-]+)\.html$/);
    if (m && !ids.includes(m[1])) { fs.unlinkSync(path.join(ROOT, f)); console.log(`  🗑 ${f} 삭제`); }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify({ ids }, null, 2) + '\n');
  console.log(`중고장터 미리보기 페이지 ${ids.length}개`);
}

main().catch((e) => { console.error(e); process.exit(1); });
