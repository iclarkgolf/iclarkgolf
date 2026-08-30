// 패키지 이름(titleEn 등)을 검색엔진 친화적인 URL 조각(슬러그)으로 바꿔준다.
// 예: "PRADERA - All in" -> "pradera-all-in"
function slugify(str) {
  const base = String(str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // 발음 구별 기호 제거
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'package';
}

// 여러 카드가 같은 슬러그를 가지게 되면(예: 이름이 같은 패키지 두 개) 뒤에 -2, -3처럼 번호를 붙여 겹치지 않게 한다.
function uniqueSlugs(cards) {
  const used = new Map(); // slug -> count
  return cards.map((c) => {
    const base = slugify(c.titleEn || c.tag || c.id);
    const count = (used.get(base) || 0) + 1;
    used.set(base, count);
    const slug = count === 1 ? base : `${base}-${count}`;
    return { ...c, slug };
  });
}

module.exports = { slugify, uniqueSlugs };
