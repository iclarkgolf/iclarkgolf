/**
 * 아이클락골프 · 말문 자동 점검 (매시간)
 * ------------------------------------------------------------
 * 사람이 손대지 않아도 두 사이트의 "공장 시스템"이 제대로 돌아가는지 매시간 확인합니다.
 *  1. 주소(사이트맵 전체)가 열리는지 — 404·서버 오류
 *  2. 핵심 화면이 실제로 그려지는지 — 브라우저로 열어 내용·자바스크립트 오류 확인
 *  3. 자동 작업이 살아 있는지 — 아고다 호텔 데이터 갱신, 다른 자동 작업(Actions) 실패
 *  4. 보안 문이 잠겨 있는지 — 말문 데이터베이스에 로그인 없이 읽기·쓰기가 막혀 있는지
 *  5. 보안 인증서(https) 만료일
 * 문제가 있으면 GitHub 이슈를 만들어 PJ님 이메일로 알림 → 고쳐지면 자동으로 "복구됨" 알림 후 이슈 닫음.
 */
const { chromium } = require('playwright');
const tls = require('tls');
const fs = require('fs');

const REPO = process.env.GITHUB_REPOSITORY || 'iclarkgolf/iclarkgolf';
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const LABEL = 'site-monitor';
const UA = 'iclarkgolf-site-monitor/1.0 (+https://iclarkgolf.com)';

const MALMUN_FIREBASE = { project: 'malmun-bca03', key: 'AIzaSyD10IdHCDkCybMrkO5fewo0ksYFBmqwWro' };

// ── 브라우저로 열어서 "내용이 실제로 나오는지" 볼 핵심 화면 ──
const SITES = [
  {
    name: '아이클락골프', base: 'https://iclarkgolf.com', host: 'iclarkgolf.com',
    pages: [
      { path: '/', name: '홈', check: { sel: '#pkg-cards > *', min: 1, what: '패키지 카드' } },
      { path: '/', name: '홈 숙소', check: { sel: '#lodging-grid > *', min: 1, what: '추천 숙소(아고다)' } },
      { path: '/quote.html', name: '맞춤견적', check: { sel: '#hotel-list > *', min: 1, what: '호텔 목록' } },
      { path: '/quote.html', name: '맞춤견적 골프', check: { sel: '#golf-list > *', min: 1, what: '골프장 목록' } },
      { path: '/greenfee.html', name: '그린피', check: { text: '프라데라', what: '그린피 표' } },
      { path: '/pool-villa.html', name: '풀빌라', check: { minText: 200, what: '풀빌라 내용' } },
      { path: '/shop.html', name: '중고장터', check: { minText: 100, what: '장터 내용' } },
      { path: '/blog.html', name: '블로그', check: { minText: 300, what: '블로그 글 목록' } }
    ]
  },
  {
    name: '말문', base: 'https://malmunkorean.com', host: 'malmunkorean.com',
    pages: [
      { path: '/', name: '홈', check: { sel: '#tutorCards .tc-card', min: 1, what: '튜터 카드' } },
      { path: '/tutors.html', name: '튜터 목록', check: { sel: '.tutor-card', min: 1, what: '튜터 목록' } },
      { path: '/tutor-profile.html?id=hwyTQsMLZSK3E5CX6cxd', name: '튜터 프로필', check: { sel: '.profile-head .name', min: 1, what: '튜터 이름' } },
      { path: '/pricing.html', name: '요금제', check: { sel: '.price-card', min: 2, what: '수강권 카드' } },
      { path: '/level-test.html', name: '레벨테스트', check: { text: '레벨테스트', what: '레벨테스트 화면' } },
      { path: '/curriculum.html', name: '커리큘럼', check: { minText: 300, what: '커리큘럼 내용' } },
      { path: '/blog.html', name: '커뮤니티', check: { notText: '불러오지 못했', what: '커뮤니티 글' } },
      { path: '/admin.html', name: '관리자 입구', check: { text: '구글로 로그인', what: '관리자 로그인 버튼' } }
    ]
  }
];

// 남의 서비스(광고·통계·지도 등)가 내는 잡음은 오류로 치지 않음
const NOISE = [/TagError|adsbygoogle|pagead/i, /googletagmanager|google-analytics|gtag|googlesyndication|adsbygoogle|doubleclick|adservice/i,
  /favicon/i, /ERR_BLOCKED_BY_CLIENT|ERR_ABORTED/i, /kakao|facebook|fbcdn|instagram|tiktok|naver/i,
  /Failed to load resource: the server responded with a status of 4\d\d/i, /ResizeObserver/i, /third-party cookie/i,
  /paypal/i, /jitsi|8x8/i, /Permissions-Policy/i];
const isNoise = m => NOISE.some(r => r.test(m));

const problems = [];   // { site, what, detail }
const notes = [];
const add = (site, what, detail) => problems.push({ site, what, detail: String(detail || '').slice(0, 400) });

async function fetchStatus(url, tries = 2){
  for(let i = 0; i < tries; i++){
    try{
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: ctl.signal });
      clearTimeout(t);
      const body = await r.text();
      if(r.status < 500 || i === tries - 1) return { status: r.status, body };
    }catch(e){ if(i === tries - 1) return { status: 0, body: '', err: e.message }; }
    await new Promise(r => setTimeout(r, 4000));
  }
}

function certDaysLeft(host){
  return new Promise(res => {
    const s = tls.connect(443, host, { servername: host, timeout: 15000 }, () => {
      const c = s.getPeerCertificate(); s.end();
      res(c && c.valid_to ? Math.floor((new Date(c.valid_to) - Date.now()) / 86400000) : null);
    });
    s.on('error', () => res(null)); s.on('timeout', () => { s.destroy(); res(null); });
  });
}

// 1) 사이트맵의 모든 주소 + robots.txt / ads.txt
async function checkUrls(site){
  const sm = await fetchStatus(site.base + '/sitemap.xml');
  if(sm.status !== 200){ add(site.name, '사이트맵(sitemap.xml)이 열리지 않음', `상태 ${sm.status} ${sm.err || ''}`); return; }
  const locs = [...new Set([...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&')))];
  if(!locs.length) add(site.name, '사이트맵이 비어 있음', '');
  // 같은 파일의 언어별 주소(?lang=)는 한 번만 확인
  const uniq = [...new Set(locs.map(u => u.replace(/([?&])lang=(en|ja|ko)/, '').replace(/[?&]$/, '')))];
  const bad = [];
  for(let i = 0; i < uniq.length; i += 6){
    const chunk = uniq.slice(i, i + 6);
    const rs = await Promise.all(chunk.map(u => fetchStatus(u)));
    rs.forEach((r, k) => { if(r.status !== 200) bad.push(`${chunk[k]} → ${r.status || r.err}`); });
  }
  if(bad.length) add(site.name, `열리지 않는 주소 ${bad.length}개`, bad.join('\n'));
  notes.push(`${site.name}: 주소 ${uniq.length}개 확인`);
  for(const f of ['/robots.txt', '/ads.txt']){
    const r = await fetchStatus(site.base + f);
    if(r.status !== 200) add(site.name, `${f} 가 열리지 않음`, `상태 ${r.status}`);
  }
  const days = await certDaysLeft(site.host);
  if(days === null) add(site.name, '보안 인증서(https) 확인 실패', '');
  else if(days < 14) add(site.name, `보안 인증서 만료 ${days}일 전`, 'GitHub Pages → Enforce HTTPS 확인 필요');
  else notes.push(`${site.name}: 인증서 ${days}일 남음`);
}

// 2) 핵심 화면을 실제 브라우저로 열어 보기
async function checkPages(browser, site){
  let okCount = 0;
  for(const pg of site.pages){
    const ctx = await browser.newContext({ userAgent: UA + ' Chrome/120', viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => {
      const msg = e.message || '', stack = e.stack || '', full = msg + ' ' + stack;
      // 우리 사이트 파일에서 난 오류만 셈 — 광고 등 남의 스크립트(파일 위치가 없거나 다른 주소)는 제외
      const ours = stack.includes(site.host) || (!/https?:\/\//.test(stack) && msg.length >= 5);
      if(ours && !isNoise(full)) errs.push('스크립트 오류: ' + msg + ' ' + stack.split('\n').slice(1, 3).join(' '));
    });
    page.on('console', m => { if(m.type() === 'error' && !isNoise(m.text())) errs.push('콘솔: ' + m.text()); });
    const url = site.base + pg.path;
    try{
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      if(!resp || resp.status() !== 200){ add(site.name, `${pg.name} 화면이 열리지 않음`, `${url} 상태 ${resp && resp.status()}`); await ctx.close(); continue; }
      const c = pg.check; let ok = false, detail = '';
      const deadline = Date.now() + 25000;
      while(Date.now() < deadline && !ok){
        if(c.sel){ const n = await page.locator(c.sel).count(); ok = n >= c.min; detail = `${c.what} ${n}개 (최소 ${c.min})`; }
        else{
          const txt = await page.evaluate(() => document.body ? document.body.innerText : '');
          if(c.text){ ok = txt.includes(c.text); detail = `"${c.text}" 글자 없음`; }
          else if(c.notText){ ok = txt.length > 50 && !txt.includes(c.notText); detail = `"${c.notText}" 표시됨`; }
          else if(c.minText){ ok = txt.replace(/\s+/g, '').length >= c.minText; detail = `내용 ${txt.replace(/\s+/g, '').length}자`; }
        }
        if(!ok) await page.waitForTimeout(1500);
      }
      if(!ok) add(site.name, `${pg.name}: ${c.what}이(가) 안 나옴`, `${url}\n${detail}\n${errs.slice(0, 5).join('\n')}`);
      else if(errs.length) add(site.name, `${pg.name}: 화면은 나오지만 오류 발생`, `${url}\n${errs.slice(0, 5).join('\n')}`);
      else okCount++;
    }catch(e){
      add(site.name, `${pg.name} 화면 점검 실패`, `${url}\n${e.message}`);
    }
    await ctx.close();
  }
  notes.push(`${site.name}: 핵심 화면 ${okCount}/${site.pages.length}개 정상`);
}

// 3) 자동 작업이 살아 있는지
async function checkAutomation(){
  const r = await fetchStatus('https://iclarkgolf.com/agoda-hotels.json');
  try{
    const j = JSON.parse(r.body);
    const h = (Date.now() - new Date(j.updatedAt)) / 3600000;
    if(!(h < 14)) add('아이클락골프', `아고다 호텔 데이터가 ${Math.round(h)}시간째 갱신 안 됨`, '자동 작업 "Update Agoda hotel data" 확인 필요');
    if(!j.hotels || j.hotels.length < 5) add('아이클락골프', `아고다 호텔이 ${j.hotels ? j.hotels.length : 0}개뿐`, '');
    notes.push(`아고다 데이터 ${Math.round(h)}시간 전 갱신, 호텔 ${j.hotels.length}개`);
  }catch(e){ add('아이클락골프', '아고다 호텔 데이터(agoda-hotels.json)를 읽지 못함', r.status + ' ' + e.message); }

  if(GH_TOKEN){
    const runs = await gh(`/repos/${REPO}/actions/runs?per_page=40`);
    const latest = {};
    (runs.workflow_runs || []).forEach(w => { if(w.name !== 'Site monitor' && !latest[w.name] && w.status === 'completed') latest[w.name] = w; });
    Object.values(latest).forEach(w => { if(w.conclusion === 'failure') add('아이클락골프', `자동 작업 "${w.name}" 마지막 실행 실패`, w.html_url); });
    notes.push(`자동 작업 ${Object.keys(latest).length}개 확인`);
  }
}

// 4) 말문 데이터베이스 보안 문 — 로그인 없이 개인정보 읽기·데이터 쓰기가 막혀 있어야 정상
async function checkMalmunSecurity(){
  const B = `https://firestore.googleapis.com/v1/projects/${MALMUN_FIREBASE.project}/databases/(default)/documents`;
  const k = `key=${MALMUN_FIREBASE.key}`;
  const tests = [
    { name: '튜터 지원서(전화·계좌) 읽기', url: `${B}/tutorApplications?pageSize=1&${k}`, method: 'GET' },
    { name: '수강 신청 읽기', url: `${B}/enrollRequests?pageSize=1&${k}`, method: 'GET' },
    { name: '튜터 카드 고치기', url: `${B}/tutors/__monitor_probe?${k}`, method: 'PATCH', body: { fields: { probe: { stringValue: 'x' } } } },
    { name: '공지 쓰기', url: `${B}/notices/__monitor_probe?${k}`, method: 'PATCH', body: { fields: { probe: { stringValue: 'x' } } } }
  ];
  for(const t of tests){
    try{
      const r = await fetch(t.url, { method: t.method, headers: { 'Content-Type': 'application/json' }, body: t.body ? JSON.stringify(t.body) : undefined });
      if(r.status !== 403) add('말문', `🔓 보안 문이 열려 있음: 로그인 없이 "${t.name}" 가능`, `응답 ${r.status} — Firebase 규칙이 바뀌었는지 즉시 확인 필요`);
    }catch(e){ notes.push(`보안 점검 연결 실패(${t.name}): ${e.message}`); }
  }
  if(!problems.some(p => p.what.includes('보안 문'))) notes.push(`말문: 보안 문 ${tests.length}개 잠김 확인`);
  const pub = await fetchStatus(`${B}/tutors?pageSize=1&${k}`);
  if(pub.status !== 200) add('말문', '튜터 정보를 읽지 못함(데이터베이스 연결 문제)', `상태 ${pub.status}`);
}

// ── GitHub 이슈로 알림 ──
async function gh(path, opts = {}){
  const r = await fetch('https://api.github.com' + path, { ...opts, headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  return r.json();
}
// 점검 결과를 저장소의 monitor/status.json 에 남김 (매일 아침 Claude가 읽어 노션 "사이트 점검 기록"에 정리)
function saveStatus(now){
  const file = 'monitor/status.json';
  let prev = { history: [] };
  try{ prev = JSON.parse(fs.readFileSync(file, 'utf8')); }catch(e){}
  const site = n => problems.some(p => p.site === n) ? '문제' : '정상';
  const entry = { at: new Date().toISOString(), atKST: now, ok: problems.length === 0,
    iclarkgolf: site('아이클락골프'), malmun: site('말문'), problems, notes };
  const history = [entry, ...(prev.history || [])].slice(0, 72);   // 최근 72번(약 3일)
  fs.mkdirSync('monitor', { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ latest: entry, history }, null, 1));
  const changed = !prev.latest || prev.latest.ok !== entry.ok || JSON.stringify((prev.latest.problems || []).map(p => p.what)) !== JSON.stringify(problems.map(p => p.what));
  const dailyHour = new Date().getUTCHours() === 21;   // 한국시간 아침 6시대에는 하루 한 번 꼭 기록
  fs.writeFileSync('monitor/.should_commit', (changed || dailyHour) ? '1' : '0');
}
async function report(){
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  saveStatus(now);
  if(process.env.GITHUB_STEP_SUMMARY){
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## 사이트 점검 ${now}\n\n**문제 ${problems.length}개**\n\n` +
      problems.map(p => `- [${p.site}] ${p.what}`).join('\n') + `\n\n정상 항목: ${notes.join(' · ')}\n`);
  }
  const finger = problems.map(p => p.site + '|' + p.what).sort().join('\n');
  console.log(`점검 시각 ${now}\n문제 ${problems.length}개\n` + problems.map(p => `- [${p.site}] ${p.what}\n  ${p.detail.replace(/\n/g, '\n  ')}`).join('\n') + '\n---\n' + notes.join('\n'));
  if(!GH_TOKEN) return;
  const open = await gh(`/repos/${REPO}/issues?state=open&labels=${LABEL}&per_page=5`);
  const issue = Array.isArray(open) && open[0];
  if(problems.length){
    const body = `## 🚨 사이트 점검에서 문제 ${problems.length}개 발견\n점검 시각: ${now} (매시간 자동 점검)\n\n` +
      problems.map(p => `### [${p.site}] ${p.what}\n\`\`\`\n${p.detail || '-'}\n\`\`\``).join('\n') +
      `\n\n---\n정상 항목: ${notes.join(' · ')}\n\nClaude에게 "점검 이슈 확인해 줘"라고 말씀하시면 원인을 찾아 고칩니다.\n<!--finger:${Buffer.from(finger).toString('base64')}-->`;
    if(!issue){
      await gh(`/repos/${REPO}/issues`, { method: 'POST', body: JSON.stringify({ title: `🚨 사이트 점검 실패 — ${problems.length}개 문제 (${now})`, body, labels: [LABEL] }) });
    }else{
      const old = ((issue.body || '').match(/<!--finger:([^>]*)-->/) || [])[1];
      if(old !== Buffer.from(finger).toString('base64')){   // 문제 내용이 바뀐 때만 새로 알림 (매시간 같은 메일 방지)
        await gh(`/repos/${REPO}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ title: `🚨 사이트 점검 실패 — ${problems.length}개 문제 (${now})`, body }) });
        await gh(`/repos/${REPO}/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: `문제 내용이 바뀌었습니다 (${now}).\n\n` + problems.map(p => `- [${p.site}] ${p.what}`).join('\n') }) });
      }
    }
  }else if(issue){
    await gh(`/repos/${REPO}/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: `✅ 모든 점검 정상으로 복구됨 (${now})\n\n${notes.join(' · ')}` }) });
    await gh(`/repos/${REPO}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
  }
}

(async () => {
  for(const s of SITES) await checkUrls(s);
  const browser = await chromium.launch();
  for(const s of SITES) await checkPages(browser, s);
  await browser.close();
  await checkAutomation();
  await checkMalmunSecurity();
  await report();
  if(problems.length) process.exitCode = 1;   // 문제 있으면 Actions 화면에 빨간 X 표시
})().catch(async e => { add('점검 장치', '점검 스크립트 자체 오류', e.stack || e.message); await report(); process.exitCode = 1; });
