/* ============================================================
   i18n.js — ClarkGo 한영 딕셔너리 (공통 파일)
   사용법: HTML 요소에 data-i18n="키" 속성 추가
   예) <h1 data-i18n="hero.title"></h1>
   placeholder: data-i18n-ph="search.placeholder"
   ============================================================ */

const I18N = {

  /* ── 공통 네비 ── */
  kr: {
    'nav.packages':    '골프 패키지',
    'nav.quote':       '맞춤 견적',
    'nav.golf':        '골프장',
    'nav.caddy':       '캐디 매칭',
    'nav.blog':        '블로그',
    'nav.gallery':     '갤러리',
    'nav.inquiry':     '문의하기',
    'nav.back':        '홈으로 돌아가기',
    'nav.shopping':    '쇼핑',
    'nav.search':      '골프장, 호텔, 캐디...',
    'hero.search':     '어떤 여행을 계획하고 계세요?',
    'nav.soon':        '준비중',

    /* ── 히어로 ── */
    'hero.badge':      '📍 필리핀 팜팡가 · 앙헬레스 · 클락',
    'hero.title1':     '클락의 모든 것,',
    'hero.title2':     '한 곳에서',
    'hero.sub':        '골프 · 호텔 · 캐디 · 레슨 · 맞춤 견적',
    'hero.search.btn': '검색',
    'hero.tag1':       '골프 전지훈련',
    'hero.tag2':       '주말 라운드',
    'hero.tag3':       '캐디 매칭',
    'hero.tag4':       '레슨 패키지',
    'hero.tag5':       '나 홀로 여행',

    /* ── 빠른 메뉴 ── */
    'quick.packages':  '골프 패키지',
    'quick.packages.sub': '기획 상품',
    'quick.quote':     '맞춤 견적',
    'quick.quote.sub': '직접 구성',
    'quick.golf':      '골프장',
    'quick.golf.sub':  '코스 정보',
    'quick.caddy':     '캐디 매칭',
    'quick.caddy.sub': '실시간',
    'quick.blog':      '블로그',
    'quick.blog.sub':  '여행 정보',
    'quick.shop':      '쇼핑',
    'quick.shop.sub':  '준비중',

    /* ── 배너 ── */
    'banner.main.badge':  '✨ 지금 인기',
    'banner.main.title1': '나만의 골프 여행',
    'banner.main.title2': '직접 설계하기',
    'banner.main.desc1':  '날짜 · 골프장 · 호텔 · 레슨',
    'banner.main.desc2':  '원하는 것만 골라 견적 확인',
    'banner.main.btn':    '견적 만들기',
    'banner.caddy.title1':'캐디',
    'banner.caddy.title2':'바로 매칭',
    'banner.caddy.desc1': '클락 검증 캐디',
    'banner.caddy.desc2': '한국어 가능',
    'banner.blog.title1': '여행',
    'banner.blog.title2': '정보 블로그',
    'banner.blog.desc1':  '클락 여행 팁',
    'banner.blog.desc2':  '최신 정보',

    /* ── 패키지 ── */
    'sec.packages':    '⛳ 골프 패키지',
    'sec.more':        '전체보기',
    'pkg.tag.starter': '입문',
    'pkg.name.starter':'입문 패키지 3박 4일',
    'pkg.desc.starter':'연습장 레슨 3회 · 9홀 1회 · 조식 포함',
    'pkg.tag.balance': '밸런스',
    'pkg.hot.balance': '인기',
    'pkg.name.balance':'밸런스 패키지 5박 6일',
    'pkg.desc.balance':'필드 레슨 2회 · 18홀 3회 · 3식 포함',
    'pkg.tag.round':   '라운드',
    'pkg.name.round':  '라운드 패키지 5박 6일',
    'pkg.desc.round':  '18홀 5회 · 선택 레슨 1회 · 전용차 포함',
    'pkg.tag.longstay':'장기',
    'pkg.name.longstay':'장기 체류 30박',
    'pkg.desc.longstay':'집중 훈련 · 숙식 포함 · 라운드 무제한',

    /* ── CTA ── */
    'cta.title':       '패키지가 딱 안 맞으세요?',
    'cta.desc':        '원하는 것만 골라서 나만의 견적을 만들어보세요',
    'cta.quote':       '견적 만들기',
    'cta.kakao':       '카카오 문의',

    /* ── 골프장 ── */
    'sec.golf':        '🗺️ 클락 골프장',
    'golf.pradera.name':  '프라데라 베르데',
    'golf.pradera.desc':  '36홀 챔피언십 · 캐디+카트 포함',
    'golf.beverly.name':  '베버리 G&CC',
    'golf.beverly.desc':  '클락 인기 코스',
    'golf.mimosa.name':   '미모사 G&CC',
    'golf.mimosa.desc':   '접근 편리 · 시내 인접',
    'golf.koreana.name':  '코리아나 GC',
    'golf.koreana.desc':  '한국인 운영 · 한국어 서비스',
    'golf.unit':       '/ 18홀',

    /* ── 캐디 ── */
    'sec.caddy':       '🤝 캐디 매칭',
    'caddy.exp1':      '경력 5년',
    'caddy.lang1':     '한국어',
    'caddy.exp2':      '경력 8년',
    'caddy.lang2':     '영어',
    'caddy.exp3':      '경력 3년',
    'caddy.hot':       '인기',
    'caddy.all':       '전체 보기',
    'caddy.all.sub':   '등록 캐디 확인',
    'caddy.all.badge': '바로가기',

    /* ── 카카오·메신저 ── */
    'kakao.title':     '카카오 채널 문의',
    'kakao.desc':      '예약 · 상담 · 궁금한 점',
    'kakao.btn':       '채널 열기',
    'messenger.title': '페이스북 메신저 문의',
    'messenger.desc':  '필리핀 로컬 · 영어 상담 가능',
    'messenger.btn':   '메신저 열기',

    /* ── 블로그 ── */
    'sec.blog':        '📝 여행 정보',
    'blog.tag1':       '여행 팁',
    'blog.title1':     '여름 휴가, 골프 전지훈련으로 바꿔보세요',
    'blog.tag2':       '날씨',
    'blog.title2':     '필리핀 클락 골프 날씨 완전 가이드',
    'blog.tag3':       '캐디 정보',
    'blog.title3':     '필리핀 골프 캐디 완전 가이드',
    'blog.tag4':       '먹자골',
    'blog.title4':     '나 홀로도 전지훈련은 됩니다',

    /* ── 갤러리 ── */
    'sec.gallery':     '📸 갤러리 · 커뮤니티',
    'gallery.btn':     '📸 사진 올리기 · 커뮤니티 참여하기',
    'gallery.empty':   '아직 게시물이 없어요. 첫 번째 사진을 올려보세요!',

    /* ── Coming Soon ── */
    'coming.shop.title':  '한국 상품 쇼핑',
    'coming.shop.desc1':  '클락 로컬용',
    'coming.shop.desc2':  '한국 인기 상품',
    'coming.food.title':  '맛집 가이드',
    'coming.food.desc1':  '클락 추천',
    'coming.food.desc2':  '식당 정보',
    'coming.hotel.title': '호텔 예약',
    'coming.hotel.desc1': '실시간 요금',
    'coming.hotel.desc2': '아고다 연동',
    'coming.badge':       'Coming Soon',

    /* ── 프로필 ── */
    'profile.role':    'SITE OWNER · INSTRUCTOR',
    'profile.loc':     '📍 Pradera Verde Golf Club, Pampanga, Philippines',
    'profile.job':     '🏌️ Golf Instructor · Clark Golf Specialist',
    'profile.lang':    '💬 한국어 · English',
    'profile.btn':     '문의하기',

    /* ── 사이트맵 ── */
    'sitemap.title':        '🗂️ 사이트맵',
    'sitemap.cat1':         '⛳ 골프 여행',
    'sitemap.packages':     '→ 골프 패키지',
    'sitemap.quote':        '→ 맞춤 견적 구성',
    'sitemap.golf':         '→ 클락 골프장 안내',
    'sitemap.cat2':         '🤝 서비스',
    'sitemap.caddy':        '→ 캐디 매칭',
    'sitemap.blog.link':    '→ 블로그 · 여행 정보',
    'sitemap.about':        '→ 아카데미 소개',
    'sitemap.cat3':         '📝 블로그',
    'sitemap.blog1':        '→ 여름 휴가, 골프 전지훈련으로',
    'sitemap.blog2':        '→ 클락 날씨 완전 가이드',
    'sitemap.blog3':        '→ 필리핀 캐디 완전 가이드',
    'sitemap.blog.all':     '→ 전체 블로그 보기',
    'sitemap.cat4':         '📞 연락처',
    'sitemap.kakao.link':   '→ 카카오 채널 문의',
    'sitemap.messenger':    '→ 페이스북 메신저',
    'sitemap.privacy':      '→ 개인정보처리방침',
    'sitemap.disclaimer':   '→ 면책조항',
    'sitemap.pradera.desc': '필리핀 팜팡가 클락 지역 최고의 36홀 챔피언십 골프장',
    'sitemap.pradera.btn':  '페이스북 →',

    /* ── 푸터 ── */
    'footer.packages': '패키지',
    'footer.quote':    '맞춤 견적',
    'footer.caddy':    '캐디 매칭',
    'footer.blog':     '블로그',
    'footer.privacy':  '개인정보처리방침',

    /* ── 하단 고정 버튼 ── */
    'fixed.kakao':     '💬 카카오',
    'fixed.messenger': '메신저',
    'fixed.quote':     '🛒 견적',

    /* ── quote.html ── */
    'q.badge':         '트랙 2 — 맞춤 견적',
    'q.title1':        '나만의',
    'q.title2':        '골프 여행',
    'q.title3':        '직접 설계하기',
    'q.sub':           '원하는 항목을 골라 담으면 자동으로 견적이 계산됩니다',
    'q.step1':         '여행 날짜',
    'q.arrival':       '도착일 Arrival',
    'q.departure':     '출발일 Departure',
    'q.step2':         '참가 인원',
    'q.golfer':        '골퍼',
    'q.nongolfer':     '동반자',
    'q.step3':         '호텔 선택',
    'q.hotel.sub':     '아고다 기준 참고 요금 · 날짜마다 변동됨',
    'q.hotel.input':   '아고다에서 확인한 요금 입력 (1박 1인 $)',
    'q.step4':         '골프장 선택',
    'q.golf.sub':      '18홀 기준 · 복수 선택 가능',
    'q.step5':         '이동 서비스',
    'q.step6':         '레슨',
    'q.step7':         '식사 · 기타 서비스',
    'q.cart.empty':    '항목을 선택하면 견적이 표시됩니다',
    'q.cart.title':    '내 견적',
    'q.rounds':        '라운드 횟수',
    'q.total':         '총 견적',
    'q.stay':          '숙박',
    'q.golf.cart':     '골프장',
    'q.kakao.btn':     '카카오 채널로 문의하기',
    'q.kakao.qr':      '카카오 채널 QR코드',
    'q.kakao.scan':    '스캔하면 바로 채널 연결',
    'q.note':          '견적은 참고용이며 최종 금액은 협의 후 확정됩니다',
    'q.agoda.ref':     '(아고다 기준·변동됨)',

    /* ── gallery.html ── */
    'g.title':         '📸 갤러리 · 커뮤니티',
    'g.tab.all':       '전체',
    'g.tab.round':     '라운드',
    'g.tab.lesson':    '레슨',
    'g.tab.food':      '맛집',
    'g.tab.caddy':     '캐디',
    'g.sort.latest':   '최신순',
    'g.sort.likes':    '인기순',
    'g.upload.btn':    '📸 사진 올리기',
    'g.empty1':        '아직 사진이 없어요',
    'g.empty2':        '첫 번째 사진을 올려보세요!',
    'g.form.nick':     '닉네임',
    'g.form.photo':    '사진을 탭해서 선택하세요',
    'g.form.photo.sub':'JPG, PNG · 최대 5장',
    'g.form.title':    '제목',
    'g.form.content':  '내용 (선택)',
    'g.form.category': '카테고리',
    'g.cat.round':     '⛳ 라운드',
    'g.cat.lesson':    '🏌️ 레슨',
    'g.cat.food':      '🍽️ 맛집',
    'g.cat.caddy':     '🤝 캐디',
    'g.cat.etc':       '📷 기타',
    'g.submit':        '올리기 ✨',
    'g.cancel':        '취소',
    'g.comment.title': '💬 댓글',
    'g.comment.send':  '전송',
    'g.comment.first': '첫 댓글을 남겨보세요!',
    'g.fixed.kakao':   '💬 카카오 문의',
    'g.fixed.upload':  '📸 사진 올리기',
  },

  /* ════════════════════════════════
     ENGLISH
  ════════════════════════════════ */
  en: {
    'nav.packages':    'Golf Packages',
    'nav.quote':       'Custom Quote',
    'nav.golf':        'Golf Courses',
    'nav.caddy':       'Caddy Matching',
    'nav.blog':        'Blog',
    'nav.gallery':     'Gallery',
    'nav.inquiry':     'Contact Us',
    'nav.back':        'Back to Home',
    'nav.shopping':    'Shopping',
    'nav.search':      'Golf courses, hotels, caddies...',
    'hero.search':     'What kind of trip are you planning?',
    'nav.soon':        'Coming Soon',

    'hero.badge':      '📍 Pampanga · Angeles · Clark, Philippines',
    'hero.title1':     'Everything in Clark,',
    'hero.title2':     'All in One Place',
    'hero.sub':        'Golf · Hotel · Caddy · Lessons · Custom Quote',
    'hero.search.btn': 'Search',
    'hero.tag1':       'Golf Training',
    'hero.tag2':       'Weekend Round',
    'hero.tag3':       'Caddy Matching',
    'hero.tag4':       'Lesson Package',
    'hero.tag5':       'Solo Travel',

    'quick.packages':  'Golf Packages',
    'quick.packages.sub': 'Planned Tours',
    'quick.quote':     'Custom Quote',
    'quick.quote.sub': 'Build Your Own',
    'quick.golf':      'Golf Courses',
    'quick.golf.sub':  'Course Info',
    'quick.caddy':     'Caddy Match',
    'quick.caddy.sub': 'Real-time',
    'quick.blog':      'Blog',
    'quick.blog.sub':  'Travel Info',
    'quick.shop':      'Shopping',
    'quick.shop.sub':  'Coming Soon',

    'banner.main.badge':  '✨ Most Popular',
    'banner.main.title1': 'Design Your Own',
    'banner.main.title2': 'Golf Trip',
    'banner.main.desc1':  'Dates · Course · Hotel · Lessons',
    'banner.main.desc2':  'Pick what you want & get a quote',
    'banner.main.btn':    'Build a Quote',
    'banner.caddy.title1':'Caddy',
    'banner.caddy.title2':'Match Now',
    'banner.caddy.desc1': 'Verified Clark Caddies',
    'banner.caddy.desc2': 'Korean available',
    'banner.blog.title1': 'Travel',
    'banner.blog.title2': 'Info Blog',
    'banner.blog.desc1':  'Clark Travel Tips',
    'banner.blog.desc2':  'Latest Updates',

    'sec.packages':    '⛳ Golf Packages',
    'sec.more':        'View All',
    'pkg.tag.starter': 'Beginner',
    'pkg.name.starter':'Starter Package 3N4D',
    'pkg.desc.starter':'Range lessons ×3 · 9-hole round · Breakfast',
    'pkg.tag.balance': 'Balance',
    'pkg.hot.balance': 'Popular',
    'pkg.name.balance':'Balance Package 5N6D',
    'pkg.desc.balance':'Field lessons ×2 · 18-hole ×3 · All meals',
    'pkg.tag.round':   'Rounds',
    'pkg.name.round':  'Round Package 5N6D',
    'pkg.desc.round':  '18-hole ×5 · Optional lesson · Private car',
    'pkg.tag.longstay':'Long Stay',
    'pkg.name.longstay':'Long Stay 30 Nights',
    'pkg.desc.longstay':'Intensive training · Meals · Unlimited rounds',

    'cta.title':       "Packages don't fit perfectly?",
    'cta.desc':        'Pick exactly what you want and build your own quote',
    'cta.quote':       'Build a Quote',
    'cta.kakao':       'KakaoTalk',

    'sec.golf':        '🗺️ Clark Golf Courses',
    'golf.pradera.name':  'Pradera Verde G&CC',
    'golf.pradera.desc':  '36-hole championship · Green fee+caddy+cart',
    'golf.beverly.name':  'Beverly Golf & CC',
    'golf.beverly.desc':  'Popular course in Clark',
    'golf.mimosa.name':   'Mimosa Golf CC',
    'golf.mimosa.desc':   'Easy access · Near city',
    'golf.koreana.name':  'Koreana Golf Club',
    'golf.koreana.desc':  'Korean-run · Korean service',
    'golf.unit':       '/ 18 holes',

    'sec.caddy':       '🤝 Caddy Matching',
    'caddy.exp1':      '5 yrs exp.',
    'caddy.lang1':     'Korean',
    'caddy.exp2':      '8 yrs exp.',
    'caddy.lang2':     'English',
    'caddy.exp3':      '3 yrs exp.',
    'caddy.hot':       'Popular',
    'caddy.all':       'View All',
    'caddy.all.sub':   'See all caddies',
    'caddy.all.badge': 'Go →',

    'kakao.title':     'KakaoTalk Channel',
    'kakao.desc':      'Booking · Consultation · Inquiries',
    'kakao.btn':       'Open Channel',
    'messenger.title': 'Facebook Messenger',
    'messenger.desc':  'Local Filipino · English support',
    'messenger.btn':   'Open Messenger',

    'sec.blog':        '📝 Travel Info',
    'blog.tag1':       'Travel Tips',
    'blog.title1':     'Turn Summer Vacation into Golf Training',
    'blog.tag2':       'Weather',
    'blog.title2':     'Complete Clark Golf Weather Guide',
    'blog.tag3':       'Caddy Info',
    'blog.title3':     'Complete Guide to Philippine Golf Caddies',
    'blog.tag4':       'Food & Golf',
    'blog.title4':     'Solo Golf Training: It Works!',

    'sec.gallery':     '📸 Gallery · Community',
    'gallery.btn':     '📸 Upload Photo · Join Community',
    'gallery.empty':   'No posts yet. Be the first to share!',

    'coming.shop.title':  'Korean Shopping',
    'coming.shop.desc1':  'For Clark locals',
    'coming.shop.desc2':  'Korean popular items',
    'coming.food.title':  'Restaurant Guide',
    'coming.food.desc1':  'Clark picks',
    'coming.food.desc2':  'Dining info',
    'coming.hotel.title': 'Hotel Booking',
    'coming.hotel.desc1': 'Real-time rates',
    'coming.hotel.desc2': 'Agoda integrated',
    'coming.badge':       'Coming Soon',

    'profile.role':    'SITE OWNER · INSTRUCTOR',
    'profile.loc':     '📍 Pradera Verde Golf Club, Pampanga, Philippines',
    'profile.job':     '🏌️ Golf Instructor · Clark Golf Specialist',
    'profile.lang':    '💬 Korean · English',
    'profile.btn':     'Contact',

    'sitemap.title':        '🗂️ Site Map',
    'sitemap.cat1':         '⛳ Golf Travel',
    'sitemap.packages':     '→ Golf Packages',
    'sitemap.quote':        '→ Custom Quote Builder',
    'sitemap.golf':         '→ Clark Golf Courses',
    'sitemap.cat2':         '🤝 Services',
    'sitemap.caddy':        '→ Caddy Matching',
    'sitemap.blog.link':    '→ Blog · Travel Info',
    'sitemap.about':        '→ About the Academy',
    'sitemap.cat3':         '📝 Blog',
    'sitemap.blog1':        '→ Summer Vacation as Golf Training',
    'sitemap.blog2':        '→ Clark Weather Complete Guide',
    'sitemap.blog3':        '→ Philippine Caddy Complete Guide',
    'sitemap.blog.all':     '→ View All Blog Posts',
    'sitemap.cat4':         '📞 Contact',
    'sitemap.kakao.link':   '→ KakaoTalk Channel',
    'sitemap.messenger':    '→ Facebook Messenger',
    'sitemap.privacy':      '→ Privacy Policy',
    'sitemap.disclaimer':   '→ Disclaimer',
    'sitemap.pradera.desc': 'The finest 36-hole championship golf club in Clark, Pampanga, Philippines',
    'sitemap.pradera.btn':  'Facebook →',

    'footer.packages': 'Packages',
    'footer.quote':    'Custom Quote',
    'footer.caddy':    'Caddy Match',
    'footer.blog':     'Blog',
    'footer.privacy':  'Privacy Policy',

    'fixed.kakao':     '💬 KakaoTalk',
    'fixed.messenger': 'Messenger',
    'fixed.quote':     '🛒 Quote',

    'q.badge':         'Track 2 — Custom Quote',
    'q.title1':        'Design Your Own',
    'q.title2':        'Golf Trip',
    'q.title3':        'Your Way',
    'q.sub':           'Select items and your quote is calculated automatically',
    'q.step1':         'Travel Dates',
    'q.arrival':       'Arrival Date',
    'q.departure':     'Departure Date',
    'q.step2':         'Number of Guests',
    'q.golfer':        'Golfer',
    'q.nongolfer':     'Non-golfer',
    'q.step3':         'Hotel Selection',
    'q.hotel.sub':     'Reference rates from Agoda · Prices vary by date',
    'q.hotel.input':   'Enter rate from Agoda (per night per person $)',
    'q.step4':         'Golf Course',
    'q.golf.sub':      '18-hole basis · Multiple selection OK',
    'q.step5':         'Transfer Services',
    'q.step6':         'Lessons',
    'q.step7':         'Meals & Other Services',
    'q.cart.empty':    'Select items to see your quote',
    'q.cart.title':    'My Quote',
    'q.rounds':        'Number of Rounds',
    'q.total':         'Total Quote',
    'q.stay':          'Accommodation',
    'q.golf.cart':     'Golf Course',
    'q.kakao.btn':     'Inquire via KakaoTalk Channel',
    'q.kakao.qr':      'KakaoTalk Channel QR Code',
    'q.kakao.scan':    'Scan to connect instantly',
    'q.note':          'Quote is for reference only. Final price confirmed after consultation.',
    'q.agoda.ref':     '(Agoda reference · subject to change)',

    'g.title':         '📸 Gallery · Community',
    'g.tab.all':       'All',
    'g.tab.round':     'Rounds',
    'g.tab.lesson':    'Lessons',
    'g.tab.food':      'Dining',
    'g.tab.caddy':     'Caddy',
    'g.sort.latest':   'Latest',
    'g.sort.likes':    'Popular',
    'g.upload.btn':    '📸 Upload Photo',
    'g.empty1':        'No photos yet',
    'g.empty2':        'Be the first to share!',
    'g.form.nick':     'Nickname',
    'g.form.photo':    'Tap to select photos',
    'g.form.photo.sub':'JPG, PNG · Up to 5 photos',
    'g.form.title':    'Title',
    'g.form.content':  'Description (optional)',
    'g.form.category': 'Category',
    'g.cat.round':     '⛳ Round',
    'g.cat.lesson':    '🏌️ Lesson',
    'g.cat.food':      '🍽️ Dining',
    'g.cat.caddy':     '🤝 Caddy',
    'g.cat.etc':       '📷 Other',
    'g.submit':        'Post ✨',
    'g.cancel':        'Cancel',
    'g.comment.title': '💬 Comments',
    'g.comment.send':  'Send',
    'g.comment.first': 'Be the first to comment!',
    'g.fixed.kakao':   '💬 KakaoTalk',
    'g.fixed.upload':  '📸 Upload Photo',
  }
};

/* ── setLang 함수 ── */
function setLang(lang) {
  // 1. 모든 data-i18n 요소 텍스트 교체
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang] && I18N[lang][key] !== undefined) {
      el.textContent = I18N[lang][key];
    }
  });

  // 2. placeholder 교체 (input, textarea)
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (I18N[lang] && I18N[lang][key] !== undefined) {
      el.placeholder = I18N[lang][key];
    }
  });

  // 3. html lang 속성 업데이트 (SEO)
  document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';

  // 4. 버튼 활성화 표시
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('on', 'active');
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isKr = btn.textContent.trim() === 'KOR';
    const isEn = btn.textContent.trim() === 'ENG';
    if ((lang === 'kr' && isKr) || (lang === 'en' && isEn)) {
      btn.classList.add('on', 'active');
    }
  });

  // 5. 선택 언어 저장
  try { localStorage.setItem('clarkgo_lang', lang); } catch(e) {}
}

/* ── 페이지 로드 시 언어 복원 ── */
function initLang() {
  let saved = 'kr';
  try { saved = localStorage.getItem('clarkgo_lang') || 'kr'; } catch(e) {}
  // 브라우저 언어 감지 (처음 방문자)
  if (!localStorage.getItem('clarkgo_lang')) {
    const browserLang = navigator.language || navigator.userLanguage || '';
    if (browserLang.startsWith('en') || browserLang.startsWith('fil') || browserLang.startsWith('tl')) {
      saved = 'en';
    }
  }
  setLang(saved);
}

/* DOM 준비 후 실행 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLang);
} else {
  initLang();
}
