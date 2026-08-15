/**
 * 아고다(Agoda) 호텔 가격/사진을 주기적으로 받아와서
 * agoda-hotels.json 파일로 저장한다 (build-homepage-content.js와 같은 방식).
 *
 * 이 스크립트는 GitHub Actions 서버 안에서만 실행되고, API 키는
 * GitHub Secret(AGODA_SITE_ID, AGODA_API_KEY)에서만 읽어온다 —
 * 브라우저나 공개 저장소 어디에도 키 값이 그대로 노출되지 않는다.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'agoda-hotels.json');

// ⬇️ Hotel Data File에서 클락/앙헬레스 지역 호텔 ID를 확인하면 여기에 채워 넣는다.
//    (숫자 하나만 넣으면 됨. 지금은 비어있어서 실행해도 결과가 없다.)
const HOTEL_IDS = [
  // 예시: 407854, 463019,
];

const AGODA_ENDPOINT = 'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

function nextWeekDates() {
  const inDate = new Date();
  inDate.setDate(inDate.getDate() + 14);
  const outDate = new Date(inDate);
  outDate.setDate(outDate.getDate() + 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { checkIn: fmt(inDate), checkOut: fmt(outDate) };
}

async function fetchAgoda(siteId, apiKey, hotelIds) {
  const { checkIn, checkOut } = nextWeekDates();
  const body = {
    criteria: {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      hotelId: hotelIds,
      additional: {
        currency: 'PHP',
        language: 'ko-kr',
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
    console.warn('Agoda API 오류:', data.error.message || data.error);
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
  }));
}

async function main() {
  const siteId = process.env.AGODA_SITE_ID;
  const apiKey = process.env.AGODA_API_KEY;
  if (!siteId || !apiKey) {
    throw new Error('AGODA_SITE_ID / AGODA_API_KEY 환경변수(GitHub Secret)가 없습니다.');
  }
  if (HOTEL_IDS.length === 0) {
    console.log('HOTEL_IDS가 비어있어서 건너뜁니다. fetch-agoda-data.js 안에 호텔 ID를 채워주세요.');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), hotels: [] }, null, 2));
    return;
  }
  const hotels = await fetchAgoda(siteId, apiKey, HOTEL_IDS);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), hotels }, null, 2));
  console.log(`agoda-hotels.json 저장 완료 (${hotels.length}개 호텔)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
