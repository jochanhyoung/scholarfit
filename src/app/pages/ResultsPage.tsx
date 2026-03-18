import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Save, Home, User, Check } from "lucide-react";
import { FormData } from "./FormPage";

interface Scholarship {
  id: number;
  title: string;
  organization: string;
  amount: string;
  daysLeft: number;
  gradeRequired?: number;
  location?: string;
  special?: string;
  tags: string[];
}

type SortType = "deadline" | "amount" | "relevance";

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get formData from location.state first, then fall back to localStorage
  const getFormData = (): FormData | undefined => {
    // First try: location.state
    if (location.state?.formData) {
      console.log("✅ formData from location.state:", location.state.formData);
      return location.state.formData as FormData;
    }
    
    // Second try: localStorage
    try {
      const saved = localStorage.getItem("scholarshipFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("✅ formData from localStorage:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
    
    console.error("❌ No formData found anywhere");
    return undefined;
  };
  
  const formData = getFormData();
  const [sortBy, setSortBy] = useState<SortType>("relevance");
  const [isSaved, setIsSaved] = useState(false);

  // Debug: Log formData on mount
  useEffect(() => {
    console.log("=== ResultsPage 마운트 ===");
    console.log("location.state:", location.state);
    console.log("formData:", formData);
    
    // If no formData at all, redirect to form
    if (!formData) {
      console.log("No formData - redirecting to /form");
      navigate("/form");
    }
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
    console.log("=== 저장 버튼 클릭됨 ===");
    console.log("현재 formData:", formData);
    console.log("location.state:", location.state);
    
    if (!formData) {
      console.error("❌ formData가 없습니다!");
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
      console.log("사용자가 저장을 취소함");
      return;
    }

    // Save to localStorage
    try {
      const dataToSave = JSON.stringify(formData);
      console.log("저장할 데이터:", dataToSave);
      
      localStorage.setItem("scholarshipFormData", dataToSave);
      
      // Verify save
      const verification = localStorage.getItem("scholarshipFormData");
      console.log("저장 확인:", verification);
      
      if (verification) {
        setIsSaved(true);
        alert("✅ 저장 완료!\n\n내 정보 페이지에서 확인할 수 있습니다.");
        console.log("저장 성공!");
      } else {
        throw new Error("저장 확인 실패");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("❌ 저장에 실패했습니다.\n\n브라우저 설정을 확인해주세요.\n(시크릿 모드에서는 저장이 제한될 수 있습니다)");
    }
  };

  // Mock scholarship data
  const scholarships: Scholarship[] = [
    {
      id: 1,
      title: "[푸른등대] 기부장학금",
      organization: "삼성",
      amount: "최대 250만원 지원",
      daysLeft: 14,
      gradeRequired: 3.5,
      location: "광주 거주",
      tags: ["D-14", "성적 3.5↑", "광주 거주"],
    },
    {
      id: 2,
      title: "국가장학금 1유형",
      organization: "한국장학재단",
      amount: "최대 350만원 지원",
      daysLeft: 28,
      gradeRequired: 2.8,
      tags: ["D-28", "성적 2.8↑", "소득분위"],
    },
    {
      id: 3,
      title: "미래인재 장학금",
      organization: "현대자동차",
      amount: "최대 500만원 지원",
      daysLeft: 7,
      gradeRequired: 4.0,
      special: "어학우대",
      tags: ["D-7", "성적 4.0↑", "어학우대"],
    },
    {
      id: 4,
      title: "지역인재 육성장학금",
      organization: "광주광역시",
      amount: "최대 150만원 지원",
      daysLeft: 21,
      location: "광주 거주",
      tags: ["D-21", "광주 거주", "지역인재"],
    },
    {
      id: 5,
      title: "우수학생 장학금",
      organization: "롯데장학재단",
      amount: "최대 300만원 지원",
      daysLeft: 35,
      gradeRequired: 3.8,
      tags: ["D-35", "성적 3.8↑"],
    },
    {
      id: 6,
      title: "신입생 특별장학금",
      organization: "대학교",
      amount: "최대 200만원 지원",
      daysLeft: 42,
      tags: ["D-42", "신입생 전용"],
    },
    {
      id: 7,
      title: "글로벌 인재양성 장학금",
      organization: "SK",
      amount: "최대 400만원 지원",
      daysLeft: 18,
      gradeRequired: 3.7,
      special: "TOEIC 800↑",
      tags: ["D-18", "성적 3.7↑", "TOEIC 필수"],
    },
    {
      id: 8,
      title: "저소득층 학업장려금",
      organization: "교육부",
      amount: "최대 180만원 지원",
      daysLeft: 30,
      tags: ["D-30", "소득분위", "1~4분위"],
    },
  ];

  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (sortBy === "deadline") return a.daysLeft - b.daysLeft;
    if (sortBy === "amount") {
      const amountA = parseInt(a.amount.replace(/[^0-9]/g, ""));
      const amountB = parseInt(b.amount.replace(/[^0-9]/g, ""));
      return amountB - amountA;
    }
    return 0; // relevance (default order)
  });

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
                className={`flex items-center gap-2 px-4 py-2 rounded-[14px] transition-all ${
                  isSaved
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
              {formData?.city ? `${formData.city.replace("광역시", "").replace("특별시", "")}에 사는 ` : ""}
              학생님에게 딱 맞는 장학금을 찾았어요!
            </h1>
            <p className="text-[#3282F6]" style={{ fontWeight: 500 }}>
              총 {scholarships.length}건
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  sortBy === filter.value
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

      {/* Scholarship Cards */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4 pb-8">
        {sortedScholarships.map((scholarship, index) => (
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
                {scholarship.amount}
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
                className="text-[#3282F6] hover:underline"
                style={{ fontWeight: 500 }}
              >
                자세히 보기 →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}