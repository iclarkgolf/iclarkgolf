/**
 * iCLARKGOLF 웹 문의 알림 자동화
 * ─────────────────────────────
 * web_inquiries 컬렉션에서 "카카오이동" 상태가 된 새 문의를 감지해
 * tourjang@gmail.com 으로 이메일 알림을 보냅니다.
 *
 * [설치 방법]
 * 1. script.google.com 접속 → "새 프로젝트"
 * 2. 기본 코드 전체 삭제 → 이 코드 전체 붙여넣기
 * 3. 파일 → 저장 (프로젝트 이름: iclarkgolf-알림 등 자유롭게)
 * 4. 왼쪽 메뉴 "실행" 버튼 옆 함수 선택 드롭다운에서 testSendEmail 선택 → 실행
 *    → 처음 실행 시 권한 허용 화면 나오면 "고급" → "이동" → "허용"
 *    → 본인 이메일로 테스트 메일이 오는지 확인
 * 5. 테스트 메일 잘 오면, 왼쪽 메뉴 "트리거"(시계 아이콘) 클릭
 * 6. 우측 하단 "트리거 추가" 클릭
 * 7. 실행할 함수: checkNewInquiries 선택
 * 8. 이벤트 소스: 시간 기반 트리거
 * 9. 시간 기반 트리거 유형: 분 단위 타이머 → 10분마다
 * 10. 저장
 *
 * 이후로는 손댈 필요 없이 10분마다 자동으로 확인·알림됩니다.
 */

const NOTIFY_EMAIL = 'tourjang@gmail.com';
const FIRESTORE_PROJECT_ID = 'iclarkgolf';
const NOTIFIED_IDS_KEY = 'notifiedInquiryIds';

/** 실제 알림 확인 함수 — 트리거로 주기 실행됨 */
function checkNewInquiries() {
  const props = PropertiesService.getScriptProperties();
  const notifiedIds = JSON.parse(props.getProperty(NOTIFIED_IDS_KEY) || '[]');
  const notifiedSet = new Set(notifiedIds);

  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/web_inquiries?pageSize=200`;
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const data = JSON.parse(res.getContentText());

  if (!data.documents || data.documents.length === 0) return;

  const newLeads = [];

  data.documents.forEach(doc => {
    const docId = doc.name.split('/').pop();
    const f = doc.fields || {};
    const status = f['상태'] ? f['상태'].stringValue : '';

    if (status === '카카오이동' && !notifiedSet.has(docId)) {
      newLeads.push({
        id: docId,
        이름: f['이름'] ? f['이름'].stringValue : '',
        기간: f['기간'] ? f['기간'].stringValue : '-',
        인원: f['인원'] ? f['인원'].stringValue : '-',
        시기: f['시기'] ? f['시기'].stringValue : '-',
        연락처: f['연락처'] ? f['연락처'].stringValue : '',
        페이지: f['페이지'] ? f['페이지'].stringValue : '-',
        created: f['created'] && f['created'].timestampValue ? new Date(f['created'].timestampValue) : null,
      });
      notifiedSet.add(docId);
    }
  });

  if (newLeads.length === 0) return;

  newLeads.sort((a, b) => (a.created && b.created ? a.created - b.created : 0));

  let body = `iCLARKGOLF 웹사이트에서 새로운 문의가 카카오톡으로 넘어갔습니다.\n\n`;
  newLeads.forEach(lead => {
    const timeStr = lead.created
      ? lead.created.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
      : '시간 정보 없음';
    body += `─────────────────────\n`;
    body += `이름: ${lead.이름 || '(미입력)'}\n`;
    body += `기간: ${lead.기간}\n`;
    body += `인원: ${lead.인원}\n`;
    body += `시기: ${lead.시기}\n`;
    body += `연락처: ${lead.연락처 || '(미입력)'}\n`;
    body += `유입 페이지: ${lead.페이지}\n`;
    body += `문의 시각: ${timeStr}\n`;
  });
  body += `─────────────────────\n\n`;
  body += `카카오톡 채널에서 대화를 확인해 주세요.\n`;
  body += `관리자 대시보드: https://iclarkgolf.com/admin.html\n`;

  MailApp.sendEmail(NOTIFY_EMAIL, `[iCLARKGOLF] 새 문의 ${newLeads.length}건 - 카카오톡 확인 필요`, body);

  props.setProperty(NOTIFIED_IDS_KEY, JSON.stringify(Array.from(notifiedSet)));
}

/** 설치 확인용 테스트 메일 — 최초 1회만 수동 실행 */
function testSendEmail() {
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    '[iCLARKGOLF] 알림 자동화 설치 테스트',
    '이 메일이 보이면 알림 자동화 설정이 정상적으로 완료된 것입니다.\n이제 트리거를 등록해 주세요.'
  );
}
