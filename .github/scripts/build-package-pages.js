/**
 * 패키지 상세페이지(package-detail.html)는 내용이 전부 자바스크립트로 나중에 채워지는 방식이라
 * 자바스크립트를 잘 실행하지 못하는 네이버(Yeti)·다음(Daumoa) 검색로봇에게는 "빈 페이지"로 보인다.
 *
 * 이 스크립트는 Firestore(package_cards)의 각 패키지마다, 실제 내용(제목·설명·사진·가격·일정)이
 * 이미 다 채워진 정적 HTML 파일을 만들어 검색엔진이 자바스크립트 없이도 바로 읽을 수 있게 한다.
 * 만들어진 페이지는 package-detail.html과 완전히 동일한 화면·기능(30초 문의, 카카오 문의, 맞춤견적
 * 버튼 등)을 그대로 갖고 있다 — 자바스크립트가 실행되면 최신 데이터로 다시 한번 채워질 뿐이다.
 *
 * 6시간마다(update-homepage-content.yml) build-homepage-content.js와 함께 자동 실행된다.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { uniqueSlugs } = require('./lib/slugify');

const ROOT = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT, 'package-detail.html');
const MANIFEST_PATH = path.join(ROOT, 'packages-manifest.json');
const SITE = 'https://iclarkgolf.com';

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

function fillElement(html, elementId, innerHtml) {
  // <... id="elementId" ...></tag>  형태(내용이 비어있는 요소)를 찾아 안에 내용을 채워넣는다.
  const re = new RegExp(`(id="${elementId}"[^>]*>)(\\s*)(</)`, 's');
  if (!re.test(html)) {
    console.warn(`  ⚠️ id="${elementId}" 요소를 템플릿에서 못 찾음 — 건너뜀`);
    return html;
  }
  return html.replace(re, (m, open, _empty, close) => `${open}${innerHtml}${close}`);
}

// 템플릿의 각 섹션은 자바스크립트가 데이터를 다 채운 뒤에야 보이도록 처음엔 전부
// style="display:none;"으로 숨겨져 있다(로딩 중 빈 화면이 번쩍이는 걸 막기 위한 장치).
// 검색로봇은 자바스크립트를 안 돌리므로 이 상태 그대로 두면 실제 내용이 있어도 "숨겨진 텍스트"로
// 취급받을 수 있다 — 그래서 정적 페이지에서는 내용이 있는 섹션의 display:none을 미리 없애준다.
function showBlock(html, elementId, displayValue) {
  const re = new RegExp(`(id="${elementId}"[^>]*)style="display:none;?"`, 's');
  if (!re.test(html)) return html;
  return html.replace(re, (m, prefix) => `${prefix}style="display:${displayValue};"`);
}

function buildDetailHtml(card, allCardsForRelated) {
  const title = `${card.sub1 || ''} ${card.sub2 || ''}`.trim() || card.titleEn || 'iCLARKGOLF 패키지';
  const pageTitle = `${title} — iCLARKGOLF`;
  const desc = `${title} — 필리핀 클락 골프 ${card.copy || '패키지'}. ${card.price || ''}${card.priceUnit || ''} 부터 시작. iCLARKGOLF에서 예약하세요.`.replace(/\n/g, ' ');
  const url = `${SITE}/package-${card.slug}.html`;
  const image = card.heroImg || `${SITE}/web-h12.jpg`;

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // 1) 이 페이지가 어떤 카드인지 자바스크립트에게 알려준다 (?id= 파라미터가 없을 때 쓰는 대체 값)
  html = html.replace(
    '<meta charset="UTF-8">',
    `<meta charset="UTF-8">\n<script>window.__FIXED_PACKAGE_ID__=${JSON.stringify(card.id)};</script>`
  );

  // 2) <title> 및 검색엔진·SNS 공유용 메타 태그를 실제 내용으로 교체
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: desc,
    image: [image],
    url,
    brand: { '@type': 'Brand', name: 'iCLARKGOLF' },
    ...(card.price ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: String(card.price).replace(/[^0-9.]/g, '') || undefined,
        availability: 'https://schema.org/InStock',
        url,
      },
    } : {}),
  };

  const headExtra = `
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${escapeAttr(pageTitle)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeAttr(image)}">
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(pageTitle)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(image)}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(pageTitle)}</title>${headExtra}`
  );

  // 3) 검색로봇이 자바스크립트 없이도 실제 글자를 볼 수 있도록 화면 요소에 내용을 미리 채워넣는다.
  //    (브라우저에서 열리면 어차피 최신 데이터로 다시 채워지므로 이중으로 문제되지 않는다)
  if (card.heroImg) {
    html = html.replace('<div class="hero-img" id="heroImg"></div>',
      `<div class="hero-img" id="heroImg" style="background-image:url(${escapeAttr(card.heroImg)});background-position:center ${card.heroImgPosY !== undefined ? card.heroImgPosY : 45}%;"></div>`);
  }
  html = fillElement(html, 'heroTag', escapeHtml(card.tag || ''));
  html = fillElement(html, 'heroTitle', escapeHtml(card.titleEn || ''));
  html = fillElement(html, 'heroSub1', escapeHtml(card.sub1 || ''));
  html = fillElement(html, 'heroSub2', escapeHtml(card.sub2 || ''));
  html = fillElement(html, 'heroCopy', escapeHtml(card.copy || '').replace(/\n/g, '<br>'));
  html = fillElement(html, 'statPrice', escapeHtml(card.price || ''));
  html = fillElement(html, 'statMinDays', escapeHtml(card.statMinDays || ''));
  html = fillElement(html, 'statPax', escapeHtml(card.statPax || ''));
  if (card.trainingSchedule && card.trainingSchedule.trim()) {
    html = fillElement(html, 'scheduleList', card.trainingSchedule);
  }
  if (card.freeContent && card.freeContent.trim()) {
    html = fillElement(html, 'freeContent', card.freeContent);
  }
  if (card.accomDesc) {
    html = fillElement(html, 'accomDesc', escapeHtml(card.accomDesc).replace(/\n/g, '<br>'));
  }
  if (Array.isArray(card.inclYes) && card.inclYes.length) {
    html = fillElement(html, 'inclYes', card.inclYes.map((t) => `<span>✅ ${escapeHtml(t)}</span>`).join(''));
  }
  if (Array.isArray(card.inclNo) && card.inclNo.length) {
    html = fillElement(html, 'inclNo', card.inclNo.map((t) => `<span>❌ ${escapeHtml(t)}</span>`).join(''));
  }
  if (card.accomName) html = fillElement(html, 'accomName', escapeHtml(card.accomName));
  if (card.trainingName) html = fillElement(html, 'trainingName', escapeHtml(card.trainingName));
  if (card.trainingDesc) html = fillElement(html, 'trainingDesc', escapeHtml(card.trainingDesc).replace(/\n/g, '<br>'));
  if (Array.isArray(card.prices) && card.prices.length) {
    html = fillElement(html, 'priceList', card.prices.map((p) => `
    <div class="price-row${p.featured ? ' featured' : ''}">
      <div class="price-period"><span>${escapeHtml(p.period || '')}</span>${p.badge ? `<span class="price-badge">${escapeHtml(p.badge)}</span>` : ''}</div>
      <span class="price-amount">${escapeHtml(p.amount || '문의')}</span>
    </div>`).join(''));
  }

  // 4) 위에서 채운 섹션들이 실제로 화면(및 검색로봇)에게 "보이게" display:none을 풀어준다.
  //    이 부분은 package-detail.html의 render() 함수가 하는 것과 같은 판단 기준을 그대로 따른다.
  // #loading은 style 속성이 아예 없는 평범한 div라 showBlock으로는 못 숨기므로 직접 처리
  html = html.replace(/(<div id="loading")(>)/, '$1 style="display:none;"$2');
  html = showBlock(html, 'heroSection', 'flex');
  html = showBlock(html, 'statsBar', 'grid');
  html = showBlock(html, 'bottomCta', 'flex');
  html = showBlock(html, 'inclSection', 'block');
  html = showBlock(html, 'priceSection', 'block');
  if (card.trainingSchedule && card.trainingSchedule.trim()) {
    html = showBlock(html, 'scheduleSection', 'block');
  }
  if (card.accomDesc || card.accomName || card.accomLinkUrl) {
    html = showBlock(html, 'accomSection', 'block');
  }
  if (card.trainingName || card.trainingDesc || card.trainingSchedule) {
    html = showBlock(html, 'trainingSection', 'block');
  }
  if (card.freeContent && card.freeContent.trim()) {
    html = showBlock(html, 'freeSection', 'block');
  }

  return html;
}

async function main() {
  const db = initFirebase();
  const snap = await db.collection('package_cards').get();
  const cardsRaw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const cards = uniqueSlugs(cardsRaw);

  // 이전에 만들어졌던 페이지 목록(이번에 없어진 카드가 있으면 그 파일은 지운다)
  let prevManifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    try { prevManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')); } catch (e) { prevManifest = []; }
  }
  const currentIds = new Set(cards.map((c) => c.id));
  for (const old of prevManifest) {
    if (!currentIds.has(old.id)) {
      const oldFile = path.join(ROOT, `package-${old.slug}.html`);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
        console.log(`  🗑️ 삭제된 패키지 페이지 정리: package-${old.slug}.html`);
      }
    }
  }

  const manifest = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const card of cards) {
    const html = buildDetailHtml(card);
    const outPath = path.join(ROOT, `package-${card.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    manifest.push({
      id: card.id,
      slug: card.slug,
      title: `${card.sub1 || ''} ${card.sub2 || ''}`.trim() || card.titleEn || card.id,
      lastmod: today,
    });
    console.log(`  ✅ package-${card.slug}.html 생성`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`packages-manifest.json 갱신 완료 (패키지 ${manifest.length}개)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { buildDetailHtml, fillElement };
