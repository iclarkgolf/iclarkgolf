// 방문자 카운터 (공용) — 모든 페이지에서 이 파일 하나만 불러오면 됩니다.
// 한국 현지시간(UTC+9) 기준 "오늘" 계산, 검색엔진 봇 필터링, 브라우저당 하루 1회만 카운트
(async function () {
  try {
    const BOT_UA = /bot|spider|crawl|slurp|bingpreview|facebookexternalhit|kakaotalk|yeti|daumoa|naverbot|baiduspider|ahrefsbot|semrushbot|mj12bot|petalbot|headlesschrome|lighthouse|pingdom|uptimerobot/i;
    const isBot = BOT_UA.test(navigator.userAgent);
    const krNow = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국(UTC+9) 현지 시각으로 보정
    const today = krNow.toISOString().slice(0, 10);
    const lastVisitDate = localStorage.getItem('iclark_last_visit_date');

    if (!isBot && lastVisitDate !== today && !localStorage.getItem('iclark_admin')) {
      localStorage.setItem('iclark_last_visit_date', today);

      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const { getFirestore, doc, getDoc, setDoc, updateDoc, increment } =
        await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

      const cfg2 = { apiKey: "AIzaSyCWoLpUqJ0qhVi3pFlfeB_aSIY4wtmy4qU", authDomain: "iclarkgolf.firebaseapp.com", projectId: "iclarkgolf" };
      const app2 = getApps().find(a => a.name === 'visit') || initializeApp(cfg2, 'visit');
      const db2 = getFirestore(app2);
      const ref = doc(db2, 'visitors', 'stats');
      const snap = await getDoc(ref);

      if (snap.exists()) {
        await updateDoc(ref, { total: increment(1), [`daily.${today}`]: increment(1) });
      } else {
        await setDoc(ref, { total: 1, daily: { [today]: 1 } });
      }
    }
  } catch (e) {
    console.warn('방문자 카운트 실패:', e.message);
  }
})();
