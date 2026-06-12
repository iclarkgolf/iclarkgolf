// ClarkGo i18n — 한국어 / English
const TRANSLATIONS = {
  kr: {
    // Nav
    'nav.search': '골프장, 호텔, 캐디...',
    // Hero
    'hero.badge': '📍 필리핀 팜팡가 · 앙헬레스 · 클락',
    'hero.title1': '클락의 모든 것,',
    'hero.title2': '한 곳에서',
    'hero.sub': '골프 · 호텔 · 캐디 · 레슨 · 맞춤 견적',
    'hero.search': '어떤 여행을 계획하고 계세요?',
    'hero.search.btn': '검색',
    'hero.tag1': '골프 전지훈련',
    'hero.tag2': '주말 라운드',
    'hero.tag3': '캐디 매칭',
    'hero.tag4': '레슨 패키지',
    'hero.tag5': '나 홀로 여행',
    // Quick menu
    'quick.packages': '골프 패키지',
    'quick.packages.sub': '기획 상품',
    'quick.quote': '맞춤 견적',
    'quick.quote.sub': '직접 구성',
    'quick.golf': '골프장',
    'quick.golf.sub': '코스 정보',
    'quick.caddy': '캐디 매칭',
    'quick.caddy.sub': '실시간',
    'quick.blog': '블로그',
    'quick.blog.sub': '여행 정보',
    'quick.shop': '쇼핑',
    'quick.shop.sub': '준비중',
    // Banner
    'banner.main.badge': '✨ 지금 인기',
    'banner.main.title1': '나만의 골프 여행',
    'banner.main.title2': '직접 설계하기',
    'banner.main.desc1': '날짜 · 골프장 · 호텔 · 레슨',
    'banner.main.desc2': '원하는 것만 골라 견적 확인',
    'banner.main.btn': '견적 만들기',
    'banner.caddy.title1': '캐디',
    'banner.caddy.title2': '바로 매칭',
    'banner.caddy.desc1': '클락 검증 캐디',
    'banner.caddy.desc2': '한국어 가능',
    'banner.blog.title1': '여행',
    'banner.blog.title2': '정보 블로그',
    'banner.blog.desc1': '클락 여행 팁',
    'banner.blog.desc2': '최신 정보',
    // Section titles
    'sec.packages': '⛳ 골프 패키지',
    'sec.golf': '🏌️ 클락 골프장',
    'sec.caddy': '🤝 캐디 매칭',
    'sec.blog': '📝 여행 블로그',
    'sec.gallery': '📸 갤러리',
    'sec.more': '전체보기',
    // Packages
    'pkg.tag.starter': '입문',
    'pkg.name.starter': '입문 패키지 3박 4일',
    'pkg.desc.starter': '연습장 레슨 3회 · 9홀 1회 · 조식 포함',
    'pkg.tag.balance': '밸런스',
    'pkg.name.balance': '밸런스 패키지 5박 6일',
    'pkg.desc.balance': '필드 레슨 2회 · 18홀 3회 · 3식 포함',
    'pkg.hot.balance': '인기',
    'pkg.tag.round': '라운드',
    'pkg.name.round': '라운드 패키지 5박 6일',
    'pkg.desc.round': '18홀 5회 · 선택 레슨 1회 · 전용차 포함',
    'pkg.tag.longstay': '장기',
    'pkg.name.longstay': '장기 체류 30박',
    'pkg.desc.longstay': '집중 훈련 · 숙식 포함 · 라운드 무제한',
    // CTA
    'cta.title': '패키지가 딱 안 맞으세요?',
    'cta.desc': '원하는 것만 골라서 나만의 견적을 만들어보세요',
    'cta.quote': '견적 만들기',
    'cta.kakao': '카카오 문의',
    // Caddy
    'caddy.hot': '인기',
    'caddy.new': '신규',
    'caddy.btn': '매칭 요청',
    // Blog
    'blog.more': '블로그 전체보기',
    // Gallery
    'gallery.title': '📸 클락 골프 갤러리',
    'gallery.btn': '📸 사진 올리기 · 커뮤니티 참여하기',
    // Coming soon
    'coming.shop.title': '한국 상품 쇼핑',
    'coming.shop.desc1': '클락 로컬용',
    'coming.shop.desc2': '한국 인기 상품',
    'coming.food.title': '맛집 가이드',
    'coming.food.desc1': '클락 추천',
    'coming.food.desc2': '식당 정보',
    'coming.hotel.title': '호텔 예약',
    'coming.hotel.desc1': '실시간 요금',
    'coming.hotel.desc2': '아고다 연동',
    // Profile
    'profile.btn': '문의하기',
    // Sitemap
    'sitemap.title': '🗂️ 사이트맵',
    'sitemap.cat1': '⛳ 골프 여행',
    'sitemap.packages': '→ 골프 패키지',
    'sitemap.quote': '→ 맞춤 견적 구성',
    'sitemap.golf': '→ 클락 골프장 안내',
    'sitemap.cat2': '🤝 서비스',
    'sitemap.caddy': '→ 캐디 매칭',
    'sitemap.blog.link': '→ 블로그 · 여행 정보',
    'sitemap.about': '→ 아카데미 소개',
    'sitemap.cat3': '📝 블로그',
    'sitemap.blog1': '→ 여름 휴가, 골프 전지훈련으로',
    'sitemap.blog2': '→ 클락 날씨 완전 가이드',
    'sitemap.blog3': '→ 필리핀 캐디 완전 가이드',
    'sitemap.blog.all': '→ 전체 블로그 보기',
    'sitemap.cat4': '📞 연락처',
    'sitemap.kakao.link': '→ 카카오 채널 문의',
    'sitemap.messenger': '→ 페이스북 메신저',
    'sitemap.privacy': '→ 개인정보처리방침',
    'sitemap.disclaimer': '→ 면책조항',
    'sitemap.pradera.desc': '필리핀 팜팡가 클락 지역 최고의 36홀 챔피언십 골프장',
    // Footer
    'footer.home': '홈',
    'footer.packages': '패키지',
    'footer.quote': '맞춤 견적',
    'footer.caddy': '캐디 매칭',
    'footer.blog': '블로그',
    'footer.privacy': '개인정보처리방침',

    'fixed.kakao': '카카오',
    'fixed.messenger': '메신저',
    'fixed.quote': '견적',  },
  en: {
    // Nav
    'nav.search': 'Golf course, hotel, caddy...',
    // Hero
    'hero.badge': '📍 Pampanga · Angeles · Clark, Philippines',
    'hero.title1': 'Everything in Clark,',
    'hero.title2': 'All in One Place',
    'hero.sub': 'Golf · Hotel · Caddy · Lessons · Custom Quote',
    'hero.search': 'What kind of trip are you planning?',
    'hero.search.btn': 'Search',
    'hero.tag1': 'Golf Training Camp',
    'hero.tag2': 'Weekend Round',
    'hero.tag3': 'Caddy Matching',
    'hero.tag4': 'Lesson Package',
    'hero.tag5': 'Solo Travel',
    // Quick menu
    'quick.packages': 'Golf Packages',
    'quick.packages.sub': 'Deals',
    'quick.quote': 'Custom Quote',
    'quick.quote.sub': 'Build your own',
    'quick.golf': 'Golf Courses',
    'quick.golf.sub': 'Course info',
    'quick.caddy': 'Caddy Match',
    'quick.caddy.sub': 'Real-time',
    'quick.blog': 'Blog',
    'quick.blog.sub': 'Travel tips',
    'quick.shop': 'Shopping',
    'quick.shop.sub': 'Coming soon',
    // Banner
    'banner.main.badge': '✨ Popular Now',
    'banner.main.title1': 'Your Custom Golf Trip',
    'banner.main.title2': 'Design It Yourself',
    'banner.main.desc1': 'Date · Course · Hotel · Lessons',
    'banner.main.desc2': 'Pick what you want & get a quote',
    'banner.main.btn': 'Build a Quote',
    'banner.caddy.title1': 'Caddy',
    'banner.caddy.title2': 'Match Now',
    'banner.caddy.desc1': 'Verified Clark caddies',
    'banner.caddy.desc2': 'Korean speaking',
    'banner.blog.title1': 'Travel',
    'banner.blog.title2': 'Info Blog',
    'banner.blog.desc1': 'Clark travel tips',
    'banner.blog.desc2': 'Latest updates',
    // Section titles
    'sec.packages': '⛳ Golf Packages',
    'sec.golf': '🏌️ Clark Golf Courses',
    'sec.caddy': '🤝 Caddy Matching',
    'sec.blog': '📝 Travel Blog',
    'sec.gallery': '📸 Gallery',
    'sec.more': 'View All',
    // Packages
    'pkg.tag.starter': 'Starter',
    'pkg.name.starter': 'Starter Package 3N4D',
    'pkg.desc.starter': '3 range lessons · 9 holes × 1 · Breakfast incl.',
    'pkg.tag.balance': 'Balance',
    'pkg.name.balance': 'Balance Package 5N6D',
    'pkg.desc.balance': '2 field lessons · 18 holes × 3 · 3 meals incl.',
    'pkg.hot.balance': 'Popular',
    'pkg.tag.round': 'Round',
    'pkg.name.round': 'Round Package 5N6D',
    'pkg.desc.round': '18 holes × 5 · 1 optional lesson · Transfer incl.',
    'pkg.tag.longstay': 'Long Stay',
    'pkg.name.longstay': 'Long Stay 30 Nights',
    'pkg.desc.longstay': 'Intensive training · Meals & accommodation · Unlimited rounds',
    // CTA
    'cta.title': "Packages don't quite fit?",
    'cta.desc': 'Pick exactly what you want and build your own quote',
    'cta.quote': 'Build a Quote',
    'cta.kakao': 'KakaoTalk Inquiry',
    // Caddy
    'caddy.hot': 'Popular',
    'caddy.new': 'New',
    'caddy.btn': 'Request Match',
    // Blog
    'blog.more': 'View All Blog Posts',
    // Gallery
    'gallery.title': '📸 Clark Golf Gallery',
    'gallery.btn': '📸 Upload Photos · Join Community',
    // Coming soon
    'coming.shop.title': 'Korean Shopping',
    'coming.shop.desc1': 'Korean products',
    'coming.shop.desc2': 'for Clark locals',
    'coming.food.title': 'Food Guide',
    'coming.food.desc1': 'Top restaurants',
    'coming.food.desc2': 'in Clark',
    'coming.hotel.title': 'Hotel Booking',
    'coming.hotel.desc1': 'Live rates',
    'coming.hotel.desc2': 'Agoda integration',
    // Profile
    'profile.btn': 'Contact Us',
    // Sitemap
    'sitemap.title': '🗂️ Sitemap',
    'sitemap.cat1': '⛳ Golf Travel',
    'sitemap.packages': '→ Golf Packages',
    'sitemap.quote': '→ Custom Quote Builder',
    'sitemap.golf': '→ Clark Golf Courses',
    'sitemap.cat2': '🤝 Services',
    'sitemap.caddy': '→ Caddy Matching',
    'sitemap.blog.link': '→ Blog & Travel Info',
    'sitemap.about': '→ Academy Info',
    'sitemap.cat3': '📝 Blog',
    'sitemap.blog1': '→ Summer Vacation as Golf Training',
    'sitemap.blog2': '→ Complete Clark Weather Guide',
    'sitemap.blog3': '→ Philippines Caddy Complete Guide',
    'sitemap.blog.all': '→ View All Blog Posts',
    'sitemap.cat4': '📞 Contact',
    'sitemap.kakao.link': '→ KakaoTalk Channel',
    'sitemap.messenger': '→ Facebook Messenger',
    'sitemap.privacy': '→ Privacy Policy',
    'sitemap.disclaimer': '→ Disclaimer',
    'sitemap.pradera.desc': 'Best 36-hole championship course in Clark, Pampanga',
    // Footer
    'footer.home': 'Home',
    'footer.packages': 'Packages',
    'footer.quote': 'Custom Quote',
    'footer.caddy': 'Caddy Match',
    'footer.blog': 'Blog',
    'footer.privacy': 'Privacy Policy',
    'fixed.kakao': 'KakaoTalk',
    'fixed.messenger': 'Messenger',
    'fixed.quote': 'Quote',
  }
};

// 현재 언어 설정
let currentLang = localStorage.getItem('clarkgo_lang') || 'kr';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('clarkgo_lang', lang);
  applyTranslations();
  // 버튼 활성화 업데이트
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('on', btn.textContent.trim().toLowerCase().startsWith(lang));
  });
}

function applyTranslations() {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['kr'];
  // 텍스트 번역
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  // placeholder 번역
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key]) el.placeholder = t[key];
  });
}

// 페이지 로드 시 적용
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  // 현재 언어에 맞게 버튼 활성화
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('on', btn.textContent.trim().toLowerCase().startsWith(currentLang));
  });
});