/**
 * lodging-detail.html(숙소 상세페이지)은 화면에 보이는 내용이 전부 자바스크립트로
 * 나중에 채워지는 방식(그마저도 localStorage에 admin이 남겨둔 캐시나, 페이지 안에
 * 하드코딩된 예전 데이터에 의존)이라, 자바스크립트를 잘 실행하지 못하는
 * 네이버(Yeti)·다음(Daumoa) 검색로봇에게는 "⏳ 불러오는 중..." 빈 페이지로 보인다.
 * (package-detail.html에 있었던 것과 같은 종류의 문제 — build-package-pages.js 참고)
 *
 * 이 스크립트는 Firestore(accommodations)의 각 숙소마다, 실제 내용(이름·설명·가격·사진·
 * 편의시설)이 이미 다 채워진 정적 HTML 파일(lodging-<id>.html)을 만들어 검색엔진이
 * 자바스크립트 없이도 바로 읽을 수 있게 한다. 만들어진 페이지는 lodging-detail.html과
 * 완전히 동일한 화면·기능(사진 슬라이더, 견적 이동 버튼 등)을 그대로 갖고 있다 —
 * 자바스크립트가 실행되면(최신 Firestore 데이터를 기준으로) 다시 한번 채워질 뿐이다.
 *
 * 6시간마다(update-homepage-content.yml) 다른 build 스크립트들과 함께 자동 실행된다.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ROOT = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT, 'lodging-detail.html');
const MANIFEST_PATH = path.join(ROOT, 'lodging-manifest.json');
const SITE = 'https://iclarkgolf.com';

// lodging-detail.html 안의 FALLBACK 이미지 맵과 동일 — 관리자가 사진을 안 올린 숙소용
const FALLBACK_PHOTO = {
  clarkton: 'https://clarkton.com/wp-content/uploads/2021/11/clarkton-new-banner-2021.jpg',
  mango: 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/125000000/124030000/124022300/124022237/f7c5ddfc_z.jpg?tr=q-80,c-at_max,w-800,h-500&_src=imagekit',
  emmaus: 'https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/100000000/99410000/99406100/99406008/ea28c65e_z.jpg?tr=q-80,c-at_max,w-800,h-500&_src=imagekit',
  oasis: 'https://ik.imagekit.io/tvlk/apr-asset/p8EuABHS2sbhHoBGG5-47sW9QD93WhQr5VVZ6b4cXGI=/giata/bigger/21/213520/213520a_hb_a_001.jpg?tr=q-80,c-at_max,w-800,h-500&_src=imagekit',
};

const SPECIAL = ['3식포함', '픽업드롭', '올인클루시브', '조식'];

function initFirebase() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT 환경변수(GitHub Secret)가 없습니다.');
  }
  if (admin.apps && admin.apps.length) return admin.firestore();
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
function escapeAttr(str) {
  return escapeHtml(str).replace(/\n/g, ' ');
}
// 파일명으로 안전하게 쓸 수 있는 슬러그 — 숙소 id는 대체로 이미 영문 소문자라 거의 그대로 통과된다.
function slugifyId(id) {
  const base = String(id || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'lodging';
}

function renderSliderHtml(accom, photos) {
  const emoji = accom.type === 'local' ? '🏠' : '🏨';
  if (!photos.length) {
    return `<div class="slider-slide"><div class="emoji-bg">${emoji}</div></div>`;
  }
  return photos.map((url, i) => `
    <div class="slider-slide">
      <img src="${escapeAttr(url)}" alt="${escapeAttr(accom.name)} 사진 ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}"
        onerror="this.parentElement.innerHTML='<div class=\\'emoji-bg\\'>${emoji}</div>'">
    </div>`).join('');
}

function renderBodyHtml(accom) {
  const isLocal = accom.type === 'local';
  const stars = accom.stars > 0 ? '★'.repeat(accom.stars) + '☆'.repeat(5 - accom.stars) : '';
  const amenList = accom.amenities ? String(accom.amenities).split(',').map((s) => s.trim()).filter(Boolean) : [];
  const chips = amenList.map((t) => `<span class="chip${SPECIAL.includes(t) ? ' special' : ''}">${escapeHtml(t)}</span>`).join('');
  const descHTML = escapeHtml(accom.desc || '').replace(/\n/g, '<br>');

  const priceBlock = isLocal
    ? `<div class="price-main">$${escapeHtml(accom.priceUSD)}<sub>/일</sub></div>
       <div class="price-note">숙박·3식·픽업·세탁<br>ALL 포함</div>`
    : `<div class="price-main">$${escapeHtml(accom.priceUSD)}<sub>/박~</sub></div>
       <div class="price-note">1인 기준 참고 요금<br>실제 요금은 날짜별 상이</div>`;

  return `
    <span class="type-badge ${isLocal ? 'local' : 'hotel'}">${isLocal ? '전지훈련 전용' : '호텔'}</span>
    ${stars ? `<div class="detail-stars">${stars}</div>` : ''}
    <h1 class="detail-name">${escapeHtml(accom.name)}</h1>
    <div class="detail-loc">📍 <span>${escapeHtml(accom.location)}</span></div>

    <div class="price-box">${priceBlock}</div>

    ${chips ? `<div class="sec-title">편의시설</div><div class="amenity-wrap">${chips}</div>` : ''}

    <div class="sec-title">숙소 소개</div>
    <div class="desc-box">${descHTML || '상세 설명을 준비 중입니다.'}</div>

    <div class="location-box">
      <div class="location-icon">🗺️</div>
      <div class="location-text">
        <strong>위치</strong>
        ${escapeHtml(accom.location)}
      </div>
    </div>`;
}

function buildDetailHtml(accom, photos) {
  const isLocal = accom.type === 'local';
  const title = `${accom.name} — iCLARKGOLF`;
  const desc = `필리핀 클락(앙헬레스) ${escapeHtml(accom.location || '')} — ${escapeHtml(accom.name)} 상세 정보와 요금. ${(accom.desc || '').replace(/\n/g, ' ').slice(0, 80)}`.trim();
  const url = `${SITE}/lodging-${slugifyId(accom.slug)}.html`;
  const image = photos[0] || `${SITE}/web-h12.jpg`;

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // 1) 쿼리 파라미터 없이 열려도(정적 파일) 이 페이지가 어떤 숙소인지, 최신 데이터가 무엇인지
  //    자바스크립트에게 알려준다 — package-detail.html의 __FIXED_PACKAGE_ID__와 같은 패턴.
  html = html.replace(
    '<meta charset="UTF-8">',
    `<meta charset="UTF-8">\n<script>window.__FIXED_ACCOM_ID__=${JSON.stringify(accom.id)};window.__FIXED_ACCOM_DATA__=${JSON.stringify({ ...accom, photos })};</script>`
  );

  // 2) <title> 및 검색엔진·SNS 공유용 메타 태그를 실제 내용으로 교체
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: accom.name,
    description: desc,
    image: [image],
    url,
    address: { '@type': 'PostalAddress', addressLocality: accom.location || 'Angeles City, Clark', addressCountry: 'PH' },
    ...(accom.priceUSD ? {
      priceRange: `$${accom.priceUSD}${isLocal ? '/일' : '/박~'}`,
    } : {}),
  };

  const headExtra = `
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeAttr(image)}">
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(image)}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  // 동적 템플릿 전용 noindex 태그는 정적 페이지에서 제거
  html = html.replace(/\n<meta name="robots" content="noindex, follow">/, '');
  html = html.replace(
    /<title>[^<]*<\/title>\n<meta name="description"[^>]*>/,
    `<title>${escapeHtml(title)}</title>${headExtra}`
  );

  // 3) 검색로봇이 자바스크립트 없이도 실제 글자·사진을 볼 수 있도록 화면에 내용을 미리 채워넣는다.
  //    (브라우저에서 열리면 renderBody()/buildSlider()가 어차피 다시 채우므로 이중으로 문제되지 않는다)
  html = html.replace(
    '<div class="slider-slide"><div class="emoji-bg">🏨</div></div>',
    renderSliderHtml(accom, photos)
  );
  html = html.replace(
    '<div style="text-align:center;padding:40px 0;color:var(--text-gray);font-size:13px;">⏳ 불러오는 중...</div>',
    renderBodyHtml(accom)
  );
  const isLocalBadge = accom.type === 'local';
  const ctaHTML = isLocalBadge
    ? `<strong>$${escapeHtml(accom.priceUSD)}</strong><span>ALL-IN / 일</span>`
    : `<strong>$${escapeHtml(accom.priceUSD)}</strong><span>참고 / 박~</span>`;
  html = html.replace(
    '<div class="cta-bar" id="cta-bar" style="display:none;">',
    '<div class="cta-bar" id="cta-bar" style="display:flex;">'
  );
  html = html.replace(
    '<div class="cta-price" id="cta-price"></div>',
    `<div class="cta-price" id="cta-price">${ctaHTML}</div>`
  );

  return html;
}

async function main() {
  const db = initFirebase();

  const rateSnap = await db.collection('settings').doc('exchange').get();
  const appliedRate = (rateSnap.exists && rateSnap.data().appliedUsdPhp) || 53.2;

  const snap = await db.collection('accommodations').get();
  let accoms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  accoms = accoms
    .filter((a) => a.active)
    .map((a) => ({
      ...a,
      slug: slugifyId(a.id),
      priceUSD: a.type === 'local'
        ? Number(a.priceUSD) || 0
        : Math.ceil((Number(a.pricePHP) || 0) / appliedRate),
    }));

  // 이전에 만들어졌던 페이지 목록(이번에 없어진/비활성화된 숙소가 있으면 그 파일은 지운다)
  let prevManifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    try { prevManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')); } catch (e) { prevManifest = []; }
  }
  const currentIds = new Set(accoms.map((a) => a.id));
  for (const old of prevManifest) {
    if (!currentIds.has(old.id)) {
      const oldFile = path.join(ROOT, `lodging-${old.slug}.html`);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
        console.log(`  🗑️ 삭제된 숙소 페이지 정리: lodging-${old.slug}.html`);
      }
    }
  }

  const manifest = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const accom of accoms) {
    const photos = (accom.photos && accom.photos.length) ? accom.photos : (FALLBACK_PHOTO[accom.id] ? [FALLBACK_PHOTO[accom.id]] : []);
    const html = buildDetailHtml(accom, photos);
    const outPath = path.join(ROOT, `lodging-${accom.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    manifest.push({ id: accom.id, slug: accom.slug, name: accom.name, lastmod: today });
    console.log(`  ✅ lodging-${accom.slug}.html 생성`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`lodging-manifest.json 갱신 완료 (숙소 ${manifest.length}개)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { buildDetailHtml, renderBodyHtml };
