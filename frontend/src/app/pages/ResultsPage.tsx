import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Save, Home, User, Check, X, FileText, CalendarPlus, CalendarCheck } from "lucide-react";
import { addToGoogleCalendar, addAllToGoogleCalendar, type CalendarScholarship } from "@/lib/calendar";
import { FormData } from "./FormPage";

const AI_SEARCH_URL = (import.meta.env.VITE_AI_SEARCH_URL ?? "http://localhost:8001") as string;

interface Scholarship {
  id: string;
  title: string;
  organization: string;
  qualification: string;
  amount: string;
  daysLeft: number;
  deadline: string;
  tags: string[];
  requiredDocuments?: string[];
  score?: number;
  sourceUrl?: string | null;
}

type SortType = "deadline" | "amount" | "relevance";

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getFormData = (): FormData | undefined => {
    if (location.state?.formData) {
      return location.state.formData as FormData;
    }
    try {
      const saved = localStorage.getItem("scholarshipFormData");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    return undefined;
  };

  const formData = getFormData();
  const [sortBy, setSortBy] = useState<SortType>("relevance");
  const [isSaved, setIsSaved] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Calendar state
  const [calendarAdding, setCalendarAdding] = useState<string | null>(null);
  const [calendarAdded, setCalendarAdded] = useState<Set<string>>(new Set());
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData) {
      navigate("/form");
      return;
    }

    const query =
      `${formData.city} ${formData.district} ` +
      `소득${formData.incomeBracket}분위 ` +
      (formData.isFirstYear ? "신입생" : `${formData.year}학년`) +
      " 장학금 추천";

    const body = {
      query,
      grade: formData.isFirstYear ? 1 : formData.year,
      gpa: formData.totalGrade ? parseFloat(formData.totalGrade) : 0,
      income_decile: formData.incomeBracket,
      city: formData.city || null,
      district: formData.district || null,
      major: null,
      language_scores: Object.fromEntries(
        (formData.languageScores ?? []).map((ls) => [ls.test, ls.score])
      ),
    };

    setIsLoading(true);
    setFetchError(null);

    fetch(`${AI_SEARCH_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const results: Scholarship[] = (data.results ?? []).map(
          (r: {
            scholarship_id: string;
            title: string;
            organization: string;
            qualification: string;
            amount: string;
            deadline: string;
            required_docs: string;
            score: number;
            source_url?: string;
          }) => {
            const deadlineDate = r.deadline ? new Date(r.deadline) : null;
            const daysLeft = deadlineDate
              ? Math.max(0, Math.round((deadlineDate.getTime() - Date.now()) / 86400000))
              : 0;
            const tags: string[] = deadlineDate ? [`D-${daysLeft}`] : [];
            return {
              id: r.scholarship_id,
              title: r.title,
              organization: r.organization,
              qualification: r.qualification,
              amount: r.amount,
              daysLeft,
              deadline: r.deadline,
              tags,
              requiredDocuments: r.required_docs
                ? r.required_docs.split(/[○※]/).map((s) => s.trim()).filter((s) => s.length > 0)
                : [],
              score: r.score,
              sourceUrl: r.source_url || null,
            };
          }
        ).filter((s: Scholarship) =>
          !["석사", "박사", "대학원", "석박사"].some((kw) => s.title.includes(kw))
        );
        setScholarships(results);
      })
      .catch(() => {
        setFetchError(
          "장학금 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Check if data is already saved on mount
  useEffect(() => {
    const checkIfSaved = () => {
      try {
        const saved = localStorage.getItem("scholarshipFormData");
        if (saved && formData) {
          const savedData = JSON.parse(saved);
          // Simple comparison - check if key fields match
          if (
            savedData.lastSemesterGrade === formData.lastSemesterGrade &&
            savedData.totalGrade === formData.totalGrade &&
            savedData.city === formData.city
          ) {
            setIsSaved(true);
          }
        }
      } catch (error) {
        console.error("Failed to check saved data:", error);
      }
    };

    if (formData) {
      checkIfSaved();
    }
  }, [formData]);

  const handleSaveClick = () => {
    if (!formData) {
      alert("저장할 데이터가 없습니다.\n정보 입력 페이지로 이동합니다.");
      navigate("/form");
      return;
    }

    // Show confirmation
    const confirmed = window.confirm(
      "검색 조건을 저장하시겠습니까?\n\n" +
      "저장하면 다음부터:\n" +
      "• 정보를 다시 입력하지 않아도 됩니다\n" +
      "• 내 정보 페이지에서 언제든 확인할 수 있습니다"
    );

    if (!confirmed) {
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("scholarshipFormData", JSON.stringify(formData));
      const verification = localStorage.getItem("scholarshipFormData");
      if (verification) {
        setIsSaved(true);
        alert("✅ 저장 완료!\n\n내 정보 페이지에서 확인할 수 있습니다.");
      } else {
        throw new Error("저장 확인 실패");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("❌ 저장에 실패했습니다.\n\n브라우저 설정을 확인해주세요.\n(시크릿 모드에서는 저장이 제한될 수 있습니다)");
    }
  };


  const toCalendarScholarship = (s: Scholarship): CalendarScholarship => ({
    title: s.title,
    organization: s.organization,
    amount: s.amount,
    deadline: s.deadline,
    sourceUrl: s.sourceUrl,
  });

  const handleAddToCalendar = async (scholarship: Scholarship) => {
    setCalendarAdding(scholarship.id);
    setCalendarError(null);
    try {
      await addToGoogleCalendar(toCalendarScholarship(scholarship));
      setCalendarAdded((prev) => new Set(prev).add(scholarship.id));
    } catch (e) {
      setCalendarError(e instanceof Error ? e.message : "캘린더 추가 중 오류가 발생했습니다.");
    } finally {
      setCalendarAdding(null);
    }
  };

  const handleAddAllToCalendar = async () => {
    setBulkStatus("loading");
    setBulkProgress({ current: 0, total: sortedScholarships.length });
    setBulkError(null);
    try {
      await addAllToGoogleCalendar(
        sortedScholarships.map(toCalendarScholarship),
        (current, total) => setBulkProgress({ current, total })
      );
      setBulkStatus("done");
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "캘린더 추가 중 오류가 발생했습니다.");
      setBulkStatus("error");
    }
  };

  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (sortBy === "deadline") return a.daysLeft - b.daysLeft;
    if (sortBy === "amount") {
      const amountA = parseInt(a.amount.replace(/[^0-9]/g, ""));
      const amountB = parseInt(b.amount.replace(/[^0-9]/g, ""));
      return amountB - amountA;
    }
    return 0; // relevance (default order)
  });

  const getShortAmount = (amount: string): string => {
    if (!amount) return "";
    const match = amount.match(/(\d[\d,]*\s*만?\s*원(?:\s*\([^)]*\))?(?:\s*~\s*\d[\d,]*\s*만?\s*원(?:\s*\([^)]*\))?)?)/);
    if (match) return match[1].trim();
    const first = amount.split("○").map((s) => s.trim()).filter((s) => s.length > 0)[0];
    return first ? (first.length > 15 ? first.slice(0, 15) + "…" : first) : "";
  };

  const getAmountLines = (amount: string): string[] => {
    return amount.split("○").map((s) => s.trim()).filter((s) => s.length > 0);
  };

  const getBadgeColor = (tag: string): string => {
    if (tag.startsWith("D-")) {
      const days = parseInt(tag.replace("D-", ""));
      if (days <= 14) return "bg-red-50 text-red-600 border-red-200";
      if (days <= 30) return "bg-orange-50 text-orange-600 border-orange-200";
      return "bg-blue-50 text-blue-600 border-blue-200";
    }
    if (tag.includes("성적")) return "bg-[#E8F0FE] text-[#3282F6] border-[#3282F6]/20";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Get document issuance URL based on document name
  const getDocumentUrl = (documentName: string): string | null => {
    const doc = documentName.toLowerCase();

    // 정부24 - 민원 서류
    if (doc.includes("가족관계증명서") ||
      doc.includes("주민등록등본") ||
      doc.includes("주민등록초본")) {
      return "https://www.gov.kr/portal/main";
    }

    // 국민건강보험공단 - 건강보험료 납부확인서
    if (doc.includes("건강보험") || doc.includes("소득증명")) {
      return "https://www.nhis.or.kr/nhis/index.do";
    }

    // 재학증명서
    if (doc.includes("재학증명서")) {
      return "https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=&CappBizCD=13404000010";
    }

    // 성적증명서
    if (doc.includes("성적증명서")) {
      return "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13404000008";
    }

    // TOEIC
    if (doc.includes("toeic") || doc.includes("토익")) {
      return "https://www.toeic.co.kr/";
    }

    // TOEFL
    if (doc.includes("toefl") || doc.includes("토플")) {
      return "https://www.ets.org/toefl";
    }

    // TEPS
    if (doc.includes("teps") || doc.includes("텝스")) {
      return "https://www.teps.or.kr/";
    }

    // IELTS
    if (doc.includes("ielts") || doc.includes("아이엘츠")) {
      return "https://www.ielts.org/";
    }

    // 어학성적 일반
    if (doc.includes("어학성적")) {
      return null; // 구체적인 시험명이 필요
    }

    // 입학 확인서, 수능 성적표
    if (doc.includes("입학") || doc.includes("수능")) {
      return "https://www.suneung.re.kr/"; // 수능 관련
    }

    return null; // 링크가 없는 경우 (자기소개서, 추천서 등)
  };

  const handleDocumentClick = (documentName: string) => {
    const url = getDocumentUrl(documentName);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50" style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.03)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/form")}
              className="flex items-center gap-2 text-gray-700 hover:text-[#3282F6] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span style={{ fontWeight: 500 }}>다시 검색하기</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-[14px] hover:bg-gray-200 transition-all active:scale-95"
                style={{ fontWeight: 500 }}
                title="홈으로"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">홈</span>
              </button>
              <button
                onClick={handleSaveClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-[14px] transition-all ${isSaved
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-[#3282F6] text-white hover:bg-[#2670e0] active:scale-95 shadow-md"
                  }`}
                style={{ fontWeight: 500 }}
              >
                {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                <span className="hidden sm:inline">{isSaved ? "저장됨" : "저장하기"}</span>
              </button>
              <button
                onClick={() => navigate("/my-info")}
                className="flex items-center gap-2 bg-[#E8F0FE] text-[#3282F6] px-4 py-2 rounded-[14px] hover:bg-[#d0e4fd] transition-all active:scale-95"
                style={{ fontWeight: 500 }}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">내 정보</span>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>
              {formData?.city && formData?.district
                ? `${formData.city} ${formData.district.replace(/시$/, "")}에 사는 `
                : formData?.city
                ? `${formData.city.replace("광역시", "").replace("특별시", "").replace("특별자치시", "").replace("특별자치도", "").replace(/도$/, "")}에 사는 `
                : ""}
              학생님에게 딱 맞는 장학금을 찾았어요!
            </h1>
            <p className="text-[#3282F6]" style={{ fontWeight: 500 }}>
              {isLoading ? "검색 중…" : fetchError ? "검색 오류" : `총 ${scholarships.length}건`}
            </p>
          </div>

          {/* Sort Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: "relevance" as const, label: "적합도순" },
              { value: "deadline" as const, label: "마감순" },
              { value: "amount" as const, label: "금액순" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSortBy(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${sortBy === filter.value
                    ? "bg-[#3282F6] text-white shadow-lg shadow-[#3282F6]/30"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#3282F6]"
                  }`}
                style={{ fontWeight: 500 }}
              >
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Google Calendar Bulk Add Banner */}
      {!isLoading && !fetchError && scholarships.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ boxShadow: "0px 2px 12px rgba(50, 130, 246, 0.08)", border: "1.5px solid #E8F0FE" }}>
            <div>
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                📅 전체 마감일을 Google 캘린더에 추가
              </p>
              <p className="text-gray-400 text-xs mt-0.5" style={{ fontWeight: 400 }}>
                {scholarships.length}개 장학금 · D-7·D-3·D-1 팝업 알림
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <button
                onClick={handleAddAllToCalendar}
                disabled={bulkStatus === "loading" || bulkStatus === "done"}
                className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm transition-all active:scale-95 ${
                  bulkStatus === "done"
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : bulkStatus === "loading"
                    ? "bg-[#E8F0FE] text-[#3282F6] cursor-wait"
                    : "bg-[#3282F6] text-white hover:bg-[#2670e0] shadow-sm"
                }`}
                style={{ fontWeight: 600 }}
              >
                {bulkStatus === "done" ? (
                  <><CalendarCheck className="w-4 h-4" />추가 완료</>
                ) : bulkStatus === "loading" ? (
                  <><div className="w-4 h-4 border-2 border-[#3282F6] border-t-transparent rounded-full animate-spin" />
                  {bulkProgress ? `${bulkProgress.current}/${bulkProgress.total}` : "추가 중..."}</>
                ) : (
                  <><CalendarPlus className="w-4 h-4" />캘린더에 추가</>
                )}
              </button>
              {bulkStatus === "error" && bulkError && (
                <p className="text-red-500 text-xs text-right max-w-[200px]">{bulkError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Cards */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4 pb-8">
        {isLoading && (
          <div className="flex flex-col items-center py-20 gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-[#3282F6] border-t-transparent rounded-full animate-spin" />
            <p style={{ fontWeight: 500 }}>AI가 맞춤 장학금을 찾고 있어요…</p>
          </div>
        )}
        {!isLoading && fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
            <p style={{ fontWeight: 500 }}>{fetchError}</p>
          </div>
        )}
        {!isLoading && !fetchError && scholarships.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500" style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
            <p style={{ fontWeight: 500 }}>조건에 맞는 장학금을 찾지 못했어요.<br />조건을 바꿔서 다시 검색해보세요.</p>
          </div>
        )}
        {!isLoading && !fetchError && sortedScholarships.map((scholarship, index) => (
          <motion.div
            key={scholarship.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
            style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                  {scholarship.title}
                </h3>
                <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
                  {scholarship.organization}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <p className="text-xl text-[#3282F6]" style={{ fontWeight: 600 }}>
                {getShortAmount(scholarship.amount)}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {scholarship.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className={`px-3 py-1 rounded-full text-sm border ${getBadgeColor(tag)}`}
                  style={{ fontWeight: 500 }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedScholarship(scholarship)}
                className="text-[#3282F6] hover:underline"
                style={{ fontWeight: 500 }}
              >
                자세히 보기 →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scholarship Detail Modal */}
      <AnimatePresence>
        {selectedScholarship && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedScholarship(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-start justify-between rounded-t-3xl z-10">
                <div className="flex-1">
                  <h2 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
                    {selectedScholarship.title}
                  </h2>
                  <p className="text-gray-500" style={{ fontWeight: 400 }}>
                    {selectedScholarship.organization}
                  </p>
                  <p className="text-xl text-[#3282F6] mt-2" style={{ fontWeight: 600 }}>
                    {getShortAmount(selectedScholarship.amount)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedScholarship(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 py-6 grid md:grid-cols-3 gap-6">
                {/* Left: Details */}
                <div className="md:col-span-2 space-y-4">
                  {/* Amount Breakdown */}
                  {selectedScholarship.amount && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="text-sm text-gray-600 mb-2" style={{ fontWeight: 600 }}>
                        💰 지원금액
                      </h3>
                      <ul className="space-y-1">
                        {getAmountLines(selectedScholarship.amount).map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                            <span className="text-[#3282F6] flex-shrink-0" style={{ fontWeight: 600 }}>•</span>
                            <span style={{ fontWeight: 400 }}>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deadline */}
                  {selectedScholarship.deadline && (
                    <div className="bg-red-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm text-red-600 mb-1" style={{ fontWeight: 600 }}>
                            📅 마감일
                          </h3>
                          <p className="text-red-700" style={{ fontWeight: 500 }}>
                            {selectedScholarship.deadline}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => handleAddToCalendar(selectedScholarship)}
                            disabled={calendarAdding === selectedScholarship.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs transition-all active:scale-95 flex-shrink-0 ${
                              calendarAdded.has(selectedScholarship.id)
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : calendarAdding === selectedScholarship.id
                                ? "bg-red-100 text-red-400 cursor-wait"
                                : "bg-white text-red-600 border border-red-200 hover:bg-red-100"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {calendarAdded.has(selectedScholarship.id) ? (
                              <><CalendarCheck className="w-3.5 h-3.5" />추가됨</>
                            ) : calendarAdding === selectedScholarship.id ? (
                              <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />추가 중</>
                            ) : (
                              <><CalendarPlus className="w-3.5 h-3.5" />캘린더 추가</>
                            )}
                          </button>
                          {calendarError && calendarAdding === null && !calendarAdded.has(selectedScholarship.id) && (
                            <p className="text-red-500 text-xs text-right max-w-[160px]">{calendarError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 선발대상 */}
                  {(() => {
                    const raw = selectedScholarship.qualification;
                    const isUseful =
                      raw &&
                      !/^[○※\s]*기관확인필요/.test(raw) &&
                      !/^[○※\s]*0+명$/.test(raw) &&
                      raw.trim().length > 2;
                    return (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h3 className="text-sm text-gray-600 mb-1" style={{ fontWeight: 600 }}>
                          👥 선발대상
                        </h3>
                        {isUseful ? (
                          <p className="text-gray-700 text-sm whitespace-pre-line" style={{ fontWeight: 500 }}>
                            {raw}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm italic" style={{ fontWeight: 400 }}>
                            해당 기관 홈페이지나 상세 요강에서 정확한 선발 대상을 확인해 주세요.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right: Required Documents */}
                <div className="md:col-span-1">
                  <div className="sticky top-24 bg-white border-2 border-[#3282F6]/20 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-[#3282F6]" />
                      <h3 className="text-lg" style={{ fontWeight: 600 }}>
                        필요 서류
                      </h3>
                    </div>
                    {selectedScholarship.requiredDocuments && selectedScholarship.requiredDocuments.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedScholarship.requiredDocuments.map((doc, index) => {
                          const hasLink = getDocumentUrl(doc) !== null;
                          return (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#3282F6] text-xs" style={{ fontWeight: 600 }}>
                                  {index + 1}
                                </span>
                              </div>
                              {hasLink ? (
                                <button
                                  onClick={() => handleDocumentClick(doc)}
                                  className="text-gray-700 text-sm text-left hover:text-[#3282F6] hover:underline transition-colors"
                                  style={{ fontWeight: 400 }}
                                  title="클릭하여 발급처로 이동"
                                >
                                  {doc} 🔗
                                </button>
                              ) : (
                                <span className="text-gray-700 text-sm" style={{ fontWeight: 400 }}>
                                  {doc}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>
                        서류 정보가 없습니다
                      </p>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-xs text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>
                        💡 모든 서류는 신청 전 최신 발급본을 준비해주세요. 서류 미비 시 선발에서 제외될 수 있습니다.
                      </p>
                      <p className="text-xs text-[#3282F6] leading-relaxed mt-2" style={{ fontWeight: 500 }}>
                        🔗 링크가 표시된 서류는 클릭하여 발급처로 이동할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Official Site Button */}
              {selectedScholarship.sourceUrl && (
                <div className="px-8 pb-8">
                  <a
                    href={selectedScholarship.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-4 bg-[#3282F6] text-white rounded-2xl hover:bg-[#2670e0] transition-colors active:scale-95"
                    style={{ fontWeight: 600, fontSize: "1rem" }}
                  >
                    공식 사이트 바로가기 →
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}