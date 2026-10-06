/**
 * index.html의 "⛳ 골프 패키지" / "🏨 추천 숙소" 정적 콘텐츠를 자동 재생성한다.
 *  - 패키지: Firestore(package_cards)
 *  - 숙소: agoda-hotels.json (2026-10-06 — 옛 로컬 숙소 4곳·lodging-*.html 페이지 폐지,
 *          화면의 아고다 호텔 목록과 똑같은 카드를 검색엔진용 정적 HTML로 넣음)
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { uniqueSlugs } = require('./lib/slugify');

const INDEX_PATH = path.join(__dirname, '..', '..', 'index.html');

function initFirebase() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT 환경변수(GitHub Secret)가 없습니다.');
  }
  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  return admin.firestore();
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---------- 패키지 카드 ----------

// 2026-10-03: 페소 가격 옆에 작은 글씨 원화 참고("약 ₩") — 견적서·확정서의 원화 송금 금액과 같은 계산
let KRW_PER_PHP = 0;
async function loadKrwRate(db) {
  try {
    const s = await db.collection('settings').doc('exchange').get();
    const d = s.exists ? s.data() : {};
    KRW_PER_PHP = (Number(d.usdKrw) || 1380) / (Number(d.appliedUsdPhp) || 53.2);
  } catch (e) { KRW_PER_PHP = 0; }
}
function krwSpan(php) {
  if (!KRW_PER_PHP || !php) return '';
  return `<span style="display:block;font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;color:#9ca3af;margin-top:2px;">약 ₩${(Math.ceil(php * KRW_PER_PHP / 1000) * 1000).toLocaleString()}</span>`;
}
function phpFromPriceStr(s) {
  const str = String(s || '');
  if (!/₱/.test(str)) return 0;   // 페소로 적힌 가격만 원화 표시
  const m = str.replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function renderPackageCard(c) {
  const bg = c.heroImg
    ? `<img src="${escapeHtml(c.heroImg)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center ${c.heroImgPosY !== undefined ? c.heroImgPosY : 50}%;display:block;" loading="lazy" alt="${escapeHtml(c.titleEn || '')}">`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;">⛳</div>`;

  return `    <a href="package-${escapeHtml(c.slug)}.html" class="pkg-item" style="border-radius:16px;overflow:hidden;text-decoration:none;display:block;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
       <div style="background:#1b4332;position:relative;height:200px;overflow:hidden;">
         ${bg}
         <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.06) 0%,rgba(0,0,0,0.00) 35%,rgba(0,0,0,0.22) 100%);"></div>
         <div style="position:absolute;inset:0;padding:14px;display:flex;flex-direction:column;overflow:hidden;">
           <div style="font-size:11px;color:#fff;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,0.9),0 2px 6px rgba(0,0,0,0.7);flex-shrink:0;">${escapeHtml(c.tag)}</div>
           <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#fff;line-height:1.05;letter-spacing:.02em;text-shadow:0 1px 3px rgba(0,0,0,0.9),0 3px 10px rgba(0,0,0,0.7);margin-top:4px;flex-shrink:0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(c.titleEn)}</div>
           <div style="display:flex;align-items:center;gap:5px;margin-top:6px;flex-shrink:0;overflow:hidden;">
             <span style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,0.9),0 2px 6px rgba(0,0,0,0.7);max-width:60%;">${escapeHtml(c.sub1)}</span>
             <span style="width:4px;height:4px;border-radius:50%;background:#fff;display:inline-block;flex-shrink:0;"></span>
             <span style="font-size:13px;font-weight:300;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,0.9),0 2px 6px rgba(0,0,0,0.7);">${escapeHtml(c.sub2)}</span>
           </div>
           <div style="font-size:12px;color:#fff;line-height:1.6;text-shadow:0 1px 2px rgba(0,0,0,0.9),0 2px 5px rgba(0,0,0,0.7);margin-top:6px;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml((c.copy || '').replace(/\n/g, ' '))}</div>
         </div>
       </div>
       <div style="background:#fff;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
         <div>
           <div style="font-size:11px;color:#9ca3af;margin-bottom:1px;">1인 기준</div>
           <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:#18181b;line-height:1;">${escapeHtml(c.price)}<span style="font-size:12px;font-weight:400;color:#9ca3af;"> ${escapeHtml(c.priceUnit)}</span>${krwSpan(phpFromPriceStr(c.price))}</div>
         </div>
         <div style="background:#1b4332;color:#fff;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;">${escapeHtml(c.btn || '보기')} →</div>
       </div>
     </a>`;
}

async function buildPackagesHtml(db) {
  const snap = await db.collection('package_cards').get();
  let cards = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  cards.sort((a, b) => (a.order || 0) - (b.order || 0));
  if (cards.length === 0) return '';
  cards = uniqueSlugs(cards);
  return cards.map(renderPackageCard).join('\n');
}

// ---------- 숙소 카드 (아고다) ----------
// index.html 안의 cardHtml()과 같은 모양 — 자바스크립트가 돌면 실시간 목록으로 다시 채워짐
const AGODA_PATH = path.join(__dirname, '..', '..', 'agoda-hotels.json');
const LODGING_STATIC_COUNT = 8;

function renderAgodaCard(h) {
  const n = Math.round(Number(h.starRating) || 0);
  const stars = n > 0 ? '★'.repeat(Math.min(n, 5)) + '☆'.repeat(Math.max(5 - n, 0)) : '';
  const priceNum = Math.round(Number(h.price) || 0);
  const thumbHTML = h.image
    ? `<img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'thumb-emoji\\'>🏨</span>'">`
    : `<span class="thumb-emoji">🏨</span>`;
  const reviewTag = h.reviewScore ? `<span class="lodging-tag special">후기 ${escapeHtml(h.reviewScore)}점</span>` : '';
  return `    <a href="${escapeHtml(h.bookingUrl)}" target="_blank" rel="noopener" class="lodging-card" style="text-decoration:none;display:flex;flex-direction:column;cursor:pointer;">
       <div class="lodging-thumb">
         ${thumbHTML}
         <span class="lodging-type-badge hotel">아고다</span>
       </div>
       <div class="lodging-body">
         ${stars ? `<div class="lodging-stars">${stars}</div>` : ''}
         <div class="lodging-name">${escapeHtml(h.name)}</div>
         <div class="lodging-price">₱${priceNum.toLocaleString()}<span style="font-size:11px;">/박</span>${krwSpan(priceNum)}</div>
         <div class="lodging-location">📍 ${escapeHtml(h.region || '앙헬레스 / 클락')}</div>
         ${reviewTag ? `<div class="lodging-tags">${reviewTag}</div>` : ''}
         <div class="lodging-btn">아고다에서 예약 →</div>
       </div>
     </a>`;
}

function buildLodgingHtml() {
  if (!fs.existsSync(AGODA_PATH)) return '';
  let data;
  try { data = JSON.parse(fs.readFileSync(AGODA_PATH, 'utf-8')); } catch (e) { return ''; }
  const hotels = Array.isArray(data.hotels) ? data.hotels : [];
  if (hotels.length === 0) return '';
  // 화면과 같은 순서(비싼 호텔부터) — 처음 보이는 8개만 정적으로
  return hotels.slice().sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    .slice(0, LODGING_STATIC_COUNT).map(renderAgodaCard).join('\n');
}

// ---------- index.html 스플라이스 ----------

function spliceSection(html, sectionName, newInner) {
  const startTag = `<!-- AUTO-GENERATED:${sectionName}:START`;
  const endTag = `<!-- AUTO-GENERATED:${sectionName}:END -->`;
  const startIdx = html.indexOf(startTag);
  const endIdx = html.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`${sectionName} 마커를 index.html에서 찾지 못했습니다 — 수동 확인 필요`);
  }
  const startTagEnd = html.indexOf('-->', startIdx) + 3;
  const before = html.slice(0, startTagEnd);
  const after = html.slice(endIdx);
  return `${before}\n${newInner}\n    ${after}`;
}

async function main() {
  const db = initFirebase();
  await loadKrwRate(db);

  const [pkgHtml, lodgingHtml] = await Promise.all([
    buildPackagesHtml(db),
    buildLodgingHtml(),
  ]);

  let html = fs.readFileSync(INDEX_PATH, 'utf-8');

  if (pkgHtml) {
    html = spliceSection(html, 'PACKAGES', pkgHtml);
  }
  if (lodgingHtml) {
    html = spliceSection(html, 'LODGING', lodgingHtml);
  }

  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  console.log('index.html 패키지/숙소 정적 콘텐츠 갱신 완료');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
