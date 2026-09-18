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

async function fetchAgoda(siteId, apiKey, cityId, regionLabel) {
    const { checkIn, checkOut } = nextWeekDates();
    const body = {
          criteria: {
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                  cityId,
                  additional: {
                            currency: 'PHP',
                            language: 'ko-kr',
                            maxResult: MAX_RESULTS_PER_CITY,
                            sortBy: 'AllGuestsReviewScore', // 후기·평점이 좋은 순서로 정렬
                            minimumStarRating: 3,
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
  });

  const data = await res.json();
    if (data.error) {
          console.warn(`Agoda API 오류 [${regionLabel} / cityId ${cityId}]:`, data.error.message || data.error);
          return [];
    }
    return (data.results || []).map((h) => ({
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
    }));
}

async function main() {
    const siteId = process.env.AGODA_SITE_ID;
    const apiKey = process.env.AGODA_API_KEY;
    if (!siteId || !apiKey) {
          throw new Error('AGODA_SITE_ID / AGODA_API_KEY 환경변수(GitHub Secret)가 없습니다.');
    }

  const seen = new Set();
    const hotels = [];

  for (const { id: cityId, label } of CITY_IDS) {
        const results = await fetchAgoda(siteId, apiKey, cityId, label);
        for (const hotel of results) {
                // 같은 호텔이 여러 지역 조회에 중복으로 잡히는 경우 방지
          if (seen.has(hotel.hotelId)) continue;
                seen.add(hotel.hotelId);
                hotels.push(hotel);
        }
        console.log(`  - ${label} (cityId ${cityId}): ${results.length}개 조회`);
        await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), hotels }, null, 2));
    console.log(`agoda-hotels.json 저장 완료 (총 ${hotels.length}개 호텔, ${CITY_IDS.length}개 지역)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
