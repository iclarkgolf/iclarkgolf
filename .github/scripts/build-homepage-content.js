/**
 * index.html의 "⛳ 골프 패키지" / "🏨 추천 숙소" 정적 콘텐츠를
 * Firestore(package_cards, accommodations) 최신 데이터로 자동 재생성한다.
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
           <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:#18181b;line-height:1;">${escapeHtml(c.price)}<span style="font-size:12px;font-weight:400;color:#9ca3af;"> ${escapeHtml(c.priceUnit)}</span></div>
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
  // 검색엔진용 정적 페이지(package-<슬러그>.html, build-package-pages.js가 생성)와
  // 같은 슬러그 규칙을 써야 링크가 실제로 존재하는 파일을 가리킨다.
  cards = uniqueSlugs(cards);
  return cards.map(renderPackageCard).join('\n');
}

// ---------- 숙소 카드 ----------

function renderLodgingCard(a) {
  const stars = a.stars > 0 ? '★'.repeat(a.stars) + '☆'.repeat(5 - a.stars) : '';
  const amenList = a.amenities ? String(a.amenities).split(',').map((s) => s.trim()).filter(Boolean) : [];
  const SPECIAL = ['3식포함', '픽업드롭', '올인클루시브', '조식'];
  const tags = amenList.slice(0, 4).map((t) =>
    `<span class="lodging-tag${SPECIAL.includes(t) ? ' special' : ''}">${escapeHtml(t)}</span>`
  ).join('') + (amenList.length > 4 ? `<span class="lodging-tag">+${amenList.length - 4}</span>` : '');

  const photo = (a.photos && a.photos[0]) || a._thumb || '';
  const thumbHTML = photo
    ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(a.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'thumb-emoji\\'>${a.type === 'local' ? '🏠' : '🏨'}</span>'">`
    : `<span class="thumb-emoji">${a.type === 'local' ? '🏠' : '🏨'}</span>`;

  const priceStr = a.type === 'local'
    ? `<span style="font-size:11px;color:#6b7280;">ALL-IN </span>${a.priceUSD}<span style="font-size:11px;">/일</span>`
    : `${a.priceUSD}<span style="font-size:11px;">/박</span>`;

  return `    <a href="lodging-detail.html?id=${escapeHtml(a.id)}" class="lodging-card" style="text-decoration:none;display:flex;flex-direction:column;cursor:pointer;">
       <div class="lodging-thumb">
         ${thumbHTML}
         <span class="lodging-type-badge ${a.type === 'local' ? 'local' : 'hotel'}">${a.type === 'local' ? '전지훈련 전용' : '호텔'}</span>
       </div>
       <div class="lodging-body">
         ${stars ? `<div class="lodging-stars">${stars}</div>` : ''}
         <div class="lodging-name">${escapeHtml(a.name)}</div>
         <div class="lodging-price">${priceStr}</div>
         <div class="lodging-location">📍 ${escapeHtml(a.location)}</div>
         ${tags ? `<div class="lodging-tags">${tags}</div>` : ''}
         <div class="lodging-btn">자세히 보기 →</div>
       </div>
     </a>`;
}

async function buildLodgingHtml(db) {
  const rateSnap = await db.collection('settings').doc('exchange').get();
  const appliedRate = (rateSnap.exists && rateSnap.data().appliedUsdPhp) || 53.2;

  const snap = await db.collection('accommodations').get();
  let accoms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  accoms = accoms
    .filter((a) => a.active)
    .map((a) => ({
      ...a,
      priceUSD: a.type === 'local'
        ? Number(a.priceUSD) || 0
        : Math.ceil((Number(a.pricePHP) || 0) / appliedRate),
    }));
  if (accoms.length === 0) return '';
  return accoms.map(renderLodgingCard).join('\n');
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

  const [pkgHtml, lodgingHtml] = await Promise.all([
    buildPackagesHtml(db),
    buildLodgingHtml(db),
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
