// .github/scripts/build-sitemap.js
// posts-data.js가 바뀔 때마다(=새 블로그 글 등록) GitHub Actions가 이 스크립트를 실행해
// sitemap.xml과 blog.html의 정적 글 목록을 자동으로 다시 생성합니다.
// PJ님이 직접 실행할 필요 없음 — posts-data.js만 갱신하고 commit하면 나머지는 자동.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SITE = 'https://iclarkgolf.com';

// ---------- 1. posts-data.js에서 POSTS 배열 읽기 ----------
const postsJsRaw = fs.readFileSync(path.join(ROOT, 'posts-data.js'), 'utf8');
// posts-data.js는 `const POSTS = [ ... ];` 형태의 순수 JS이므로 안전하게 평가
const POSTS = new Function(postsJsRaw + '\nreturn POSTS;')();

if (!Array.isArray(POSTS) || POSTS.length === 0) {
  console.error('POSTS 배열을 읽지 못했습니다. posts-data.js 형식을 확인하세요.');
  process.exit(1);
}

function toIsoDate(d) {
  // "2026.07.24" -> "2026-07-24"
  return d.replace(/\./g, '-');
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const latestPostDate = toIsoDate(POSTS[0].date); // POSTS는 최신순으로 정렬되어 있음

// ---------- 2. sitemap.xml 생성 ----------
const STATIC_PAGES = [
  { loc: '/', lastmod: '2026-06-21', changefreq: 'weekly', priority: '1.0' },
  { loc: '/index.html', lastmod: '2026-06-21', changefreq: 'weekly', priority: '1.0' },
  { loc: '/package-detail.html', lastmod: '2026-06-17', changefreq: 'weekly', priority: '0.5' },
  { loc: '/greenfee.html', lastmod: '2026-06-10', changefreq: 'monthly', priority: '0.5' },
  { loc: '/quote.html', lastmod: '2026-06-10', changefreq: 'monthly', priority: '0.5' },
  { loc: '/caddy.html', lastmod: '2026-06-10', changefreq: 'monthly', priority: '0.4' },
  { loc: '/gallery.html', lastmod: '2026-06-10', changefreq: 'monthly', priority: '0.4' },
  { loc: '/about.html', lastmod: '2026-06-21', changefreq: 'monthly', priority: '0.6' },
  { loc: '/privacy.html', lastmod: '2026-06-21', changefreq: 'yearly', priority: '0.4' },
  { loc: '/disclaimer.html', lastmod: '2026-06-21', changefreq: 'yearly', priority: '0.4' },
];

function urlBlock({ loc, lastmod, changefreq, priority }) {
  return `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const blogHubBlock = urlBlock({
  loc: '/blog.html',
  lastmod: latestPostDate,
  changefreq: 'weekly',
  priority: '0.8',
});

// posts-data.js는 최신순 → 사이트맵은 오래된 글부터(p1) 나오도록 정렬해 기존 스타일 유지
const postsAscending = [...POSTS].sort((a, b) => {
  const na = parseInt(a.id.replace('p', ''), 10);
  const nb = parseInt(b.id.replace('p', ''), 10);
  return na - nb;
});

const blogPostBlocks = postsAscending
  .map((p) =>
    urlBlock({
      loc: `/blog-${p.id}.html`,
      lastmod: toIsoDate(p.date),
      changefreq: 'monthly',
      priority: '0.7',
    })
  )
  .join('\n');

// ---------- 2-b. packages-manifest.json에서 패키지 상세페이지 목록 읽기 ----------
// (build-package-pages.js가 6시간마다 자동 생성 — 아직 한번도 안 돌았으면 빈 배열)
const manifestPath = path.join(ROOT, 'packages-manifest.json');
let PACKAGES = [];
if (fs.existsSync(manifestPath)) {
  try {
    PACKAGES = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.warn('packages-manifest.json을 읽지 못했습니다 — 패키지 페이지는 사이트맵에서 생략합니다.');
  }
}
const packageBlocks = PACKAGES
  .map((p) =>
    urlBlock({
      loc: `/package-${p.slug}.html`,
      lastmod: p.lastmod || today(),
      changefreq: 'weekly',
      priority: '0.9',
    })
  )
  .join('\n');
function today() {
  return new Date().toISOString().slice(0, 10);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- 메인 페이지 -->
${urlBlock(STATIC_PAGES[0])}
${urlBlock(STATIC_PAGES[1])}

  <!-- 주요 서비스 페이지 -->
${urlBlock(STATIC_PAGES[2])}
${urlBlock(STATIC_PAGES[3])}
${urlBlock(STATIC_PAGES[4])}
${urlBlock(STATIC_PAGES[5])}
${urlBlock(STATIC_PAGES[6])}

  <!-- 패키지 상세페이지 (packages-manifest.json에서 자동 생성 — build-package-pages.js가 6시간마다 갱신) -->
${packageBlocks}

  <!-- 정보 페이지 -->
${urlBlock(STATIC_PAGES[7])}
${urlBlock(STATIC_PAGES[8])}
${urlBlock(STATIC_PAGES[9])}

  <!-- 블로그 목록 -->
${blogHubBlock}

  <!-- 블로그 포스트 (posts-data.js에서 자동 생성 — 직접 수정하지 마세요) -->
${blogPostBlocks}

</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`sitemap.xml 생성 완료 (블로그 글 ${POSTS.length}개 포함)`);

// ---------- 3. blog.html의 정적 카드 목록 생성 ----------
const blogHtmlPath = path.join(ROOT, 'blog.html');
let blogHtml = fs.readFileSync(blogHtmlPath, 'utf8');

const cards = POSTS.map((p) => {
  return `    <a href="/blog-${p.id}.html" class="blog-card">
      <div class="card-thumb">
        <img src="${p.thumb}" alt="${escAttr(p.title)}" loading="lazy" onerror="this.style.opacity=0">
        <span class="card-cat">${p.cat}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${p.title}</div>
        <div class="card-excerpt">${p.excerpt}</div>
        <div class="card-meta">
          <span>✍️ 투어장</span>
          <span>${p.date}</span>
        </div>
      </div>
    </a>`;
}).join('\n');

const startMarker = '<!-- AUTO-GENERATED:START (수정 금지 — .github/scripts/build-sitemap.js가 자동으로 덮어씁니다) -->';
const endMarker = '<!-- AUTO-GENERATED:END -->';

const startIdx = blogHtml.indexOf(startMarker);
const endIdx = blogHtml.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('blog.html에서 AUTO-GENERATED 마커를 찾지 못했습니다. blog.html이 수동으로 변경되어 마커가 지워진 것 같습니다.');
  process.exit(1);
}

const before = blogHtml.slice(0, startIdx + startMarker.length);
const after = blogHtml.slice(endIdx);

blogHtml = `${before}\n${cards}\n  ${after}`;

fs.writeFileSync(blogHtmlPath, blogHtml, 'utf8');
console.log(`blog.html 정적 글 목록 갱신 완료 (${POSTS.length}개)`);
