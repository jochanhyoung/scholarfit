export type CalendarScholarship = {
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  sourceUrl?: string | null;
};

function offsetDate(deadline: string, days: number): string {
  const d = new Date(deadline);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function buildCalendarEvents(scholarship: CalendarScholarship): object[] {
  const amountText = scholarship.amount
    .split("○")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  const baseDescription = [
    `기관: ${scholarship.organization}`,
    `금액: ${amountText}`,
    scholarship.sourceUrl ? `공식 사이트: ${scholarship.sourceUrl}` : "",
    "",
    "장학핏(scholarfit.chosuncnl.cloud)에서 추가된 알림입니다.",
  ].filter(Boolean).join("\n");

  const events: object[] = [];

  // 마감일 종일 이벤트
  events.push({
    summary: `[장학금 마감] ${scholarship.title}`,
    description: baseDescription,
    start: { date: scholarship.deadline },
    end: { date: offsetDate(scholarship.deadline, 1) },
    reminders: { useDefault: false, overrides: [] },
  });

  // D-7, D-3, D-1 리마인더 이벤트 (과거 날짜 건너뜀)
  for (const { offset, label, msg } of [
    { offset: -7, label: "D-7", msg: "마감 1주일 전" },
    { offset: -3, label: "D-3", msg: "마감 3일 전" },
    { offset: -1, label: "D-1", msg: "마감 하루 전" },
  ]) {
    const date = offsetDate(scholarship.deadline, offset);
    if (new Date(date) <= new Date()) continue;
    events.push({
      summary: `[${label}] ${scholarship.title} - ${msg}`,
      description: [
        `📅 마감일: ${scholarship.deadline}`,
        `🏢 기관: ${scholarship.organization}`,
        `💰 금액: ${amountText}`,
        scholarship.sourceUrl ? `🔗 공식 사이트: ${scholarship.sourceUrl}` : "",
        "",
        "장학핏(scholarfit.chosuncnl.cloud)에서 추가된 알림입니다.",
      ].filter(Boolean).join("\n"),
      start: { dateTime: `${date}T09:00:00`, timeZone: "Asia/Seoul" },
      end: { dateTime: `${date}T09:30:00`, timeZone: "Asia/Seoul" },
      reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 0 }] },
    });
  }

  return events;
}

async function checkCalendarAuth(): Promise<boolean> {
  try {
    const res = await fetch("/api/calendar/status");
    if (!res.ok) return false;
    const { authorized } = await res.json();
    return authorized === true;
  } catch {
    return false;
  }
}

async function requestCalendarAuth(): Promise<void> {
  const res = await fetch("/api/calendar/start");
  if (!res.ok) throw new Error("캘린더 인증을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
  const { url } = await res.json();

  return new Promise((resolve, reject) => {
    const popup = window.open(url, "gcal-auth", "width=500,height=620,left=300,top=100");
    if (!popup) {
      reject(new Error("팝업이 차단되었습니다. 브라우저의 팝업 허용 후 다시 시도해주세요."));
      return;
    }

    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("인증 시간이 초과되었습니다."));
    }, 5 * 60 * 1000);

    function handler(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "gcal-oauth") return;
      clearTimeout(timer);
      window.removeEventListener("message", handler);
      if (event.data.ok) resolve();
      else reject(new Error("Google Calendar 인증이 취소되었습니다."));
    }
    window.addEventListener("message", handler);
  });
}

async function ensureCalendarAuth(): Promise<void> {
  const authorized = await checkCalendarAuth();
  if (!authorized) await requestCalendarAuth();
}

async function postEventsToBackend(events: object[]): Promise<void> {
  const res = await fetch("/api/calendar/add-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });

  if (res.status === 401) {
    throw new Error("인증이 만료되었습니다. 다시 시도해 주세요.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || "캘린더 이벤트 추가에 실패했습니다.");
  }
}

export async function addToGoogleCalendar(scholarship: CalendarScholarship): Promise<void> {
  await ensureCalendarAuth();
  await postEventsToBackend(buildCalendarEvents(scholarship));
}

export async function addAllToGoogleCalendar(
  scholarships: CalendarScholarship[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  await ensureCalendarAuth();
  for (let i = 0; i < scholarships.length; i++) {
    await postEventsToBackend(buildCalendarEvents(scholarships[i]));
    onProgress?.(i + 1, scholarships.length);
  }
}
