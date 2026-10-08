/**
 * 아고다(Agoda) 클락/앙헬레스 + 중부루손(팜팡가/타를락/잠발레스/바타안) 지역
 * 호텔 가격/사진을 주기적으로 받아와서 agoda-hotels.json 파일로 저장한다
 * (build-homepage-content.js와 같은 방식).
 *
 * 이 스크립트는 GitHub Actions 서버 안에서만 실행되고, API 키는
 * GitHub Secret(AGODA_SITE_ID, AGODA_API_KEY)에서만 읽어온다 —
 * 브라우저나 공개 저장소 어디에도 키 값이 그대로 노출되지 않는다.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'agoda-hotels.json');

// 골프투어 손님들이 실제로 머무는 중부루손 권역 전체 커버
// — 각 지역명으로 agoda.com에서 검색해 확인한 city ID (2026-09-18)
// 아고다 고객지원팀은 city ID를 개별로 안 알려주므로(자체 확인 방식 안내),
// 검색 자동완성 결과에서 직접 확인한 값들이다. 한 지역에 호텔이 몰려있으면
// 근처 소도시가 같은 city ID로 묶이기도 한다(예: 바타안은 발랑가/마리벨레스/
// 모롱이 전부 18868 하나로 묶임 — 지역 전체가 한 "도시" 단위로 등록돼있음).
const CITY_IDS = [
  { id: 18875, label: '앙헬레스/클락' }, // 기존 지역 (변경 없음)
  { id: 180098, label: '산페르난도(팜팡가)' },
  { id: 176012, label: '마발라캇(팜팡가)' },
  { id: 19543, label: '타를락시티' },
  { id: 18217, label: '올롱가포/수빅(잠발레스)' },
  { id: 670825, label: '이바(잠발레스)' },
  { id: 18868, label: '바타안(발랑가/마리벨레스/모롱)' },
  ];

// 꼭 보여야 하는 단골 호텔 (평점순 상위 목록에 안 잡혀도 항상 포함) — 2026-10-08
// 번호는 agoda.com 검색에서 확인한 아고다 호텔 번호. 추가하려면 한 줄씩 늘리면 됨.
const PINNED_HOTELS = [
  { id: 83260113, name: '망고 스위트 (Mango Suites - Angeles)' },
  { id: 47937777, name: '엠마우스 콘도텔 (Emmaus Condotel)' },
];
const PINNED_REGION = { id: 18875, label: '앙헬레스/클락' };

// 지역 하나당 몇 개 호텔을 가져올지 (지역 수가 늘어난 만큼 지역당 개수는 줄여
// 전체 API 호출 부담과 최종 목록 크기를 적정 수준으로 유지)
const MAX_RESULTS_PER_CITY = 40;

// 같은 API를 여러 번 연속 호출할 때 너무 몰아치지 않도록 호출 사이 대기 시간(ms)
const DELAY_BETWEEN_CALLS_MS = 500;

const AGODA_ENDPOINT = 'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

function nextWeekDates() {
    const inDate = new Date();
    inDate.setDate(inDate.getDate() + 14);
    const outDate = new Date(inDate);
    outDate.setDate(outDate.getDate() + 1);
    const fmt = (d) => d.toISOString().slice(0, 10);
    return { checkIn: fmt(inDate), checkOut: fmt(outDate) };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 아고다 서버가 가끔 늦거나 JSON이 아닌 오류 화면을 돌려줄 때가 있어(일시 장애)
// 지역마다 최대 3번까지 다시 시도한다. 한 번 호출에 30초 이상 걸리면 끊고 재시도.
const MAX_TRIES = 3;
const TIMEOUT_MS = 30000;

async function fetchAgodaOnce(siteId, apiKey, cityId, hotelIds) {
    const { checkIn, checkOut } = nextWeekDates();
    const body = {
          criteria: {
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                  ...(hotelIds ? { hotelId: hotelIds } : { cityId }),
                  additional: {
                            currency: 'PHP',
                            language: 'ko-kr',
                            maxResult: MAX_RESULTS_PER_CITY,
                            sortBy: 'AllGuestsReviewScore', // 후기·평점이 좋은 순서로 정렬
                            ...(hotelIds ? {} : { minimumStarRating: 3 }),
                            occupancy: { numberOfAdult: 2, numberOfChildren: 0 },
                  },
          },
    };

  const res = await fetch(AGODA_ENDPOINT, {
        method: 'POST',
        headers: {
                Authorization: `${siteId}:${apiKey}`,
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { throw new Error(`HTTP ${res.status} — JSON 아님: ${text.slice(0, 120).replace(/\s+/g, ' ')}`); }
    if (data.error) throw new Error('Agoda API 오류: ' + (data.error.message || JSON.stringify(data.error)));
    return data.results || [];
}

// 성공하면 호텔 목록, 3번 다 실패하면 null (→ 이 지역은 지난번 데이터를 그대로 유지)
async function fetchAgoda(siteId, apiKey, cityId, regionLabel, hotelIds) {
    for (let t = 1; t <= MAX_TRIES; t++) {
          try {
                  const results = await fetchAgodaOnce(siteId, apiKey, cityId, hotelIds);
                  return results.map((h) => ({
                            hotelId: h.hotelId,
                            name: h.hotelName,
                            price: h.dailyRate,
                            crossedOutPrice: h.crossedOutRate,
                            currency: h.currency,
                            image: h.imageURL,
                            starRating: h.starRating,
                            reviewScore: h.reviewScore,
                            bookingUrl: h.landingURL,
                            region: regionLabel,
                            cityId,
                            ...(hotelIds ? { pinned: true } : {}),
                  }));
          } catch (err) {
                  console.warn(`  ! ${regionLabel} (cityId ${cityId}) ${t}/${MAX_TRIES}번째 실패: ${err.message}`);
                  if (t < MAX_TRIES) await sleep(3000 * t);
          }
    }
    return null;
}

function loadPrevious() {
    try { return JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')).hotels || []; }
    catch (e) { return []; }
}

async function main() {
    const siteId = process.env.AGODA_SITE_ID;
    const apiKey = process.env.AGODA_API_KEY;
    if (!siteId || !apiKey) {
          throw new Error('AGODA_SITE_ID / AGODA_API_KEY 환경변수(GitHub Secret)가 없습니다.');
    }

  const previous = loadPrevious();
  const seen = new Set();
    const hotels = [];
    let okCities = 0;
    let keptCities = 0;

  // ① 단골 호텔 먼저 (실패하면 지난번 데이터 유지)
  {
        const ids = PINNED_HOTELS.map((h) => h.id);
        let pinned = await fetchAgoda(siteId, apiKey, PINNED_REGION.id, PINNED_REGION.label, ids);
        if (!pinned || !pinned.length) {
                pinned = previous.filter((h) => ids.includes(h.hotelId));
                console.log(`  - 단골 호텔: 조회 실패/0개 → 지난 데이터 ${pinned.length}개 유지`);
        } else {
                console.log(`  - 단골 호텔: ${pinned.length}/${ids.length}개 조회 (${pinned.map((h) => h.name).join(', ')})`);
        }
        for (const hotel of pinned) { if (!seen.has(hotel.hotelId)) { seen.add(hotel.hotelId); hotels.push(hotel); } }
        await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  // ② 지역별 평점순 목록
  for (const { id: cityId, label } of CITY_IDS) {
        let results = await fetchAgoda(siteId, apiKey, cityId, label);
        if (results === null || results.length === 0) {
                // 실패했거나 0개가 오면 사이트에서 호텔이 사라지지 않도록 지난번 목록을 그대로 씀
                const old = previous.filter((h) => h.cityId === cityId);
                console.log(`  - ${label} (cityId ${cityId}): ${results === null ? '조회 실패' : '0개'} → 지난 데이터 ${old.length}개 유지`);
                results = old;
                keptCities++;
        } else {
                okCities++;
                console.log(`  - ${label} (cityId ${cityId}): ${results.length}개 조회`);
        }
        for (const hotel of results) {
                // 같은 호텔이 여러 지역 조회에 중복으로 잡히는 경우 방지
          if (seen.has(hotel.hotelId)) continue;
                seen.add(hotel.hotelId);
                hotels.push(hotel);
        }
        await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  if (okCities === 0) {
        // 아고다 전체 장애 — 파일을 건드리지 않고 정상 종료(실패 메일 안 보냄). 6시간 뒤 다시 시도됨.
        console.log('아고다 서버 응답 없음 — 기존 agoda-hotels.json 그대로 유지하고 다음 실행 때 다시 시도합니다.');
        return;
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), hotels }, null, 2));
    console.log(`agoda-hotels.json 저장 완료 (총 ${hotels.length}개 호텔, 새로 받음 ${okCities}개 지역 / 지난 데이터 유지 ${keptCities}개 지역)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
