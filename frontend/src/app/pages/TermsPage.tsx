import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

/**
 * 서비스 이용약관 페이지
 */
export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.03)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg text-gray-900" style={{ fontWeight: 700 }}>서비스 이용약관</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-3xl p-8 space-y-8" style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>

          <div>
            <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
              장학핏(이하 "서비스")을 이용해 주셔서 감사합니다. 본 약관은 서비스 이용에 관한 기본적인 사항을 규정합니다.
            </p>
            <p className="text-xs text-gray-400 mt-2" style={{ fontWeight: 400 }}>시행일: 2026년 5월 16일</p>
          </div>

          <Section title="제1조 (목적)">
            <p>
              본 약관은 장학핏(ScholarFit)이 제공하는 장학금 추천 서비스(이하 "서비스")의 이용 조건 및 절차,
              이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li><strong>"서비스"</strong>란 장학핏이 웹사이트(scholarfit.chosuncnl.cloud)를 통해 제공하는 장학금 검색·추천 및 관련 부가 서비스를 말합니다.</li>
              <li><strong>"이용자"</strong>란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li><strong>"회원"</strong>이란 Google 계정을 통해 로그인하여 서비스에 등록한 이용자를 말합니다.</li>
            </ul>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>본 약관은 서비스를 이용하는 모든 이용자에게 적용됩니다.</li>
              <li>서비스는 필요 시 약관을 변경할 수 있으며, 변경 시 시행 7일 전까지 서비스 내 공지합니다.</li>
              <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 회원 탈퇴할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title="제4조 (회원가입 및 탈퇴)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>회원가입은 Google OAuth를 통한 로그인으로 완료됩니다.</li>
              <li>회원은 서비스 내에서 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 처리합니다.</li>
              <li>탈퇴 시 회원의 개인정보는 「개인정보처리방침」에 따라 처리됩니다.</li>
            </ul>
          </Section>

          <Section title="제5조 (서비스의 제공)">
            <p>서비스는 다음 기능을 무료로 제공합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 text-sm">
              <li>이용자 정보(학년, 학점, 지역, 소득분위 등) 기반 맞춤 장학금 AI 추천</li>
              <li>공공데이터포털 기반 장학금 정보 검색 및 열람</li>
              <li>Google Calendar를 통한 장학금 마감일 알림 등록</li>
              <li>Google 계정을 통한 검색 정보 저장 및 불러오기</li>
            </ul>
          </Section>

          <Section title="제6조 (회원의 의무)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>이용자는 서비스 이용 시 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.</li>
              <li>서비스의 안정적 운영을 방해하는 행위(해킹, 크롤링, 과도한 요청 등)를 해서는 안 됩니다.</li>
              <li>서비스를 통해 얻은 정보를 상업적 목적으로 무단 이용해서는 안 됩니다.</li>
              <li>관련 법령 및 본 약관을 준수해야 합니다.</li>
            </ul>
          </Section>

          <Section title="제7조 (서비스의 변경 및 중단)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>서비스는 운영상·기술상 필요에 따라 서비스 내용을 변경하거나 일시 중단할 수 있습니다.</li>
              <li>서비스 중단 시 사전에 공지하며, 불가피한 사유가 있는 경우 사후 공지할 수 있습니다.</li>
              <li>서비스는 무료로 제공되므로, 서비스 변경·중단에 따른 별도 보상은 하지 않습니다.</li>
            </ul>
          </Section>

          <Section title="제8조 (책임 제한)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>서비스가 제공하는 장학금 정보는 공공데이터포털 API를 기반으로 하며, 실제 공고와 다를 수 있습니다. 최종 확인은 각 장학 기관의 공식 사이트에서 하시기 바랍니다.</li>
              <li>AI 추천 결과는 참고용이며, 장학금 수혜를 보장하지 않습니다.</li>
              <li>천재지변, 서버 장애 등 불가항력적 사유로 발생한 손해에 대해 책임을 지지 않습니다.</li>
              <li>이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
            </ul>
          </Section>

          <Section title="제9조 (분쟁 해결)">
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
              <li>본 약관은 대한민국 법령에 따라 해석됩니다.</li>
              <li>서비스 이용과 관련하여 분쟁이 발생할 경우, 양 당사자는 원만한 해결을 위해 성실히 협의합니다.</li>
              <li>협의가 이루어지지 않을 경우, 관할 법원에서 해결합니다.</li>
            </ul>
            <div className="mt-4 bg-[#F0F6FF] rounded-2xl p-4 text-sm text-gray-700 space-y-1">
              <p><span style={{ fontWeight: 600 }}>서비스명:</span> 장학핏 (ScholarFit)</p>
              <p><span style={{ fontWeight: 600 }}>운영자:</span> 장학핏 운영팀</p>
              <p><span style={{ fontWeight: 600 }}>이메일:</span> scholarfit20213061@gmail.com</p>
              <p><span style={{ fontWeight: 600 }}>홈페이지:</span> https://scholarfit.chosuncnl.cloud</p>
            </div>
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
