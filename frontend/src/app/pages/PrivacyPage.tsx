import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

/**
 * 개인정보처리방침 페이지
 */
export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.03)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg text-gray-900" style={{ fontWeight: 700 }}>개인정보처리방침</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-3xl p-8 space-y-8" style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>

          <div>
            <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
              장학핏(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
              본 방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 및 처리 방법을 설명합니다.
            </p>
            {/* 시행일자: 요구사항에 따라 2026-05-16 */}
            <p className="text-xs text-gray-400 mt-2" style={{ fontWeight: 400 }}>시행일: 2026년 5월 14일</p>
          </div>

          <Section title="1. 수집하는 개인정보 항목">
            <p>서비스는 Google OAuth를 통한 로그인 시 다음 정보를 <strong>자동으로 수집</strong>합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 text-sm">
              <li>이메일 주소</li>
              <li>이름 (Google 계정 표시 이름)</li>
              <li>프로필 사진 URL</li>
              <li>Google 고유 식별자 (sub)</li>
            </ul>
            <p className="mt-3">장학금 검색 시 이용자가 직접 입력하는 정보:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 text-sm">
              <li>학년, 학점, 거주 지역, 소득분위, 성별, 어학 성적</li>
            </ul>
          </Section>

          <Section title="2. 개인정보 수집 방법">
            <ul className="space-y-1 list-disc list-inside text-sm text-gray-600">
              <li>Google OAuth 로그인 시 자동 수집 (이메일, 이름, 프로필 사진 URL, Google 고유 ID)</li>
              <li>서비스 내 장학금 검색 폼을 통한 이용자 직접 입력</li>
            </ul>
          </Section>

          <Section title="3. 개인정보 수집 및 이용 목적">
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="bg-[#F0F6FF]">
                  <th className="text-left px-3 py-2 rounded-tl-lg text-[#3282F6]" style={{ fontWeight: 600 }}>수집 항목</th>
                  <th className="text-left px-3 py-2 rounded-tr-lg text-[#3282F6]" style={{ fontWeight: 600 }}>이용 목적</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <Row a="이메일, 이름, Google 고유 ID" b="회원 식별 및 서비스 제공" />
                <Row a="프로필 사진 URL" b="내 정보 페이지 프로필 표시" />
                <Row a="학년, 학점, 지역, 소득분위 등" b="맞춤 장학금 추천" />
              </tbody>
            </table>
          </Section>

          <Section title="4. 개인정보 보유 및 이용 기간">
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li><strong>회원 탈퇴 시 즉시 파기</strong>합니다.</li>
              <li>단, 관계 법령에 따라 보존 의무가 있는 경우 해당 기간 동안 보관 후 파기합니다.</li>
            </ul>
            <div className="mt-3 bg-[#F9FAFB] rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p>• 전자상거래법에 따른 계약·청약철회 기록: 5년</p>
              <p>• 통신비밀보호법에 따른 로그인 기록: 3개월</p>
            </div>
          </Section>

          <Section title="5. 개인정보의 제3자 제공">
            <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
            <p className="mt-2">단, 다음의 경우는 예외로 합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의해 요구되는 경우</li>
            </ul>
          </Section>

          <Section title="6. 개인정보 처리 위탁">
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="bg-[#F0F6FF]">
                  <th className="text-left px-3 py-2 rounded-tl-lg text-[#3282F6]" style={{ fontWeight: 600 }}>수탁자</th>
                  <th className="text-left px-3 py-2 rounded-tr-lg text-[#3282F6]" style={{ fontWeight: 600 }}>위탁 업무</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <Row a="Google LLC" b="OAuth 인증 처리" />
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-400" style={{ fontWeight: 400 }}>
              ※ Supabase는 셀프호스팅으로 운영하고 있어 외부 처리 위탁에 해당하지 않습니다.
            </p>
          </Section>

          <Section title="7. 정보주체의 권리·의무 및 행사 방법">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              권리 행사는 서비스 내 "내 정보" 페이지에서 직접 확인·삭제하거나,
              아래 개인정보 보호책임자에게 서면, 이메일로 요청하실 수 있습니다.
            </p>
          </Section>

          <Section title="8. 쿠키(Cookie) 사용">
            <p>서비스는 이용자의 로그인 세션 유지를 위해 쿠키를 사용합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
              <li><strong>사용 목적:</strong> 로그인 인증 상태 유지</li>
              <li><strong>설치·운영:</strong> 브라우저 설정에서 쿠키 허용/차단 가능</li>
              <li>쿠키를 차단할 경우 로그인 기능이 정상적으로 동작하지 않을 수 있습니다.</li>
            </ul>
          </Section>

          {/* 개인정보 보호책임자: placeholder 포함 */}
          <Section title="9. 개인정보 보호책임자">
            <p className="text-sm text-gray-600">
              개인정보 처리에 관한 불만·문의는 아래 연락처로 문의해 주세요.
            </p>
            <div className="mt-3 bg-[#F0F6FF] rounded-2xl p-4 text-sm text-gray-700 space-y-1">
              <p><span style={{ fontWeight: 600 }}>서비스명:</span> 장학핏 (ScholarFit)</p>
              <p><span style={{ fontWeight: 600 }}>보호책임자:</span> 장학핏 운영팀</p>
              <p><span style={{ fontWeight: 600 }}>이메일:</span> scholarfit20213061@gmail.com</p>
              <p><span style={{ fontWeight: 600 }}>홈페이지:</span> https://scholarfit.chosuncnl.cloud</p>
            </div>
          </Section>

          <Section title="10. 개인정보처리방침 변경">
            <p>
              본 개인정보처리방침이 변경될 경우, 시행 7일 전부터 서비스 내 공지사항을 통해 안내합니다.
            </p>
            {/* 시행일자 */}
            <p className="mt-3 text-xs text-gray-400">본 방침은 2026년 5월 16일부터 시행됩니다.</p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base text-gray-900 mb-3" style={{ fontWeight: 700 }}>{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2 text-gray-700" style={{ fontWeight: 500 }}>{a}</td>
      <td className="px-3 py-2">{b}</td>
    </tr>
  );
}
