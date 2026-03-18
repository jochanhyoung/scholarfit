import { useNavigate } from "react-router";
import { Coins, Sparkles, ArrowRight, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import type { FormData } from "./FormPage";

export function LandingPage() {
  const navigate = useNavigate();
  const [savedData, setSavedData] = useState<FormData | null>(null);

  useEffect(() => {
    const loadSavedData = () => {
      try {
        const saved = localStorage.getItem("scholarshipFormData");
        if (saved) {
          const data = JSON.parse(saved);
          // Check if the saved data has meaningful information
          if (data.lastSemesterGrade && data.totalGrade && data.city && data.district) {
            setSavedData(data);
          }
        }
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    };
    loadSavedData();
  }, []);

  const viewResultsWithSavedData = () => {
    if (savedData) {
      navigate("/results", { state: { formData: savedData } });
    }
  };

  const deleteSavedData = () => {
    localStorage.removeItem("scholarshipFormData");
    setSavedData(null);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0FE] via-white to-[#F9FAFB] opacity-60" />
      
      {/* My Info Button - Fixed Top Right */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        onClick={() => navigate("/my-info")}
        className="fixed top-6 right-6 z-50 bg-white border-2 border-[#3282F6] text-[#3282F6] h-[48px] px-5 rounded-[16px] hover:bg-[#E8F0FE] transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-lg"
        style={{ fontWeight: 600, fontSize: "14px" }}
      >
        <User className="w-5 h-5" />
        내 정보
      </motion.button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          {/* Visual Element */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#3282F6] blur-3xl opacity-20 rounded-full" />
              <div className="relative bg-gradient-to-br from-[#E8F0FE] to-[#3282F6]/20 p-12 rounded-[32px]">
                <Coins className="w-24 h-24 text-[#3282F6]" strokeWidth={1.5} />
                <Sparkles className="w-8 h-8 text-[#3282F6] absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl mb-4"
            style={{ fontWeight: 600 }}
          >
            1분 만에 내게 맞는
            <br />
            <span className="text-[#3282F6]">장학금 찾기</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base md:text-lg text-gray-600 leading-relaxed px-4"
            style={{ fontWeight: 400 }}
          >
            복잡한 서류 확인 없이, 딱 필요한 정보만 입력하고
            <br className="hidden md:block" />
            <span className="md:hidden"> </span>
            혜택을 확인하세요.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-16 w-full"
        >
          {[
            { icon: "⚡", title: "빠른 매칭", desc: "1분이면 충분해요" },
            { icon: "🎯", title: "정확한 추천", desc: "나에게 꼭 맞는 장학금" },
            { icon: "💰", title: "최대 혜택", desc: "놓치는 기회 없이" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 text-center"
              style={{
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="text-2xl md:text-4xl mb-1 md:mb-3">{feature.icon}</div>
              <h3 className="mb-1 md:mb-2 text-xs md:text-base" style={{ fontWeight: 600 }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-tight md:leading-normal" style={{ fontWeight: 400 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-md mb-4 md:mb-0"
        >
          <button
            onClick={() => navigate("/form")}
            className="w-full bg-[#3282F6] text-white h-[60px] rounded-[18px] hover:bg-[#2670e0] transition-all duration-300 hover:shadow-lg hover:shadow-[#3282F6]/30 active:scale-95"
            style={{
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            내 장학금 찾기
          </button>
        </motion.div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 text-sm text-gray-400"
        >
          이미 <span className="text-[#3282F6]">12,847명</span>이 장학금을 찾았어요
        </motion.p>

        {/* Saved Data Section */}
        {savedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 w-full max-w-md"
          >
            <div className="bg-[#E8F0FE] rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
              <p className="text-sm text-gray-600 mb-4" style={{ fontWeight: 500 }}>
                💾 저장된 정보가 있습니다
              </p>
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p>• 평점: {savedData.totalGrade}/{savedData.gradeScale}</p>
                <p>• 지역: {savedData.city} {savedData.district}</p>
                <p>• 소득분위: {savedData.incomeBracket}분위</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={viewResultsWithSavedData}
                  className="flex-1 bg-[#3282F6] text-white h-[48px] rounded-[16px] hover:bg-[#2670e0] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  바로 결과보기
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteSavedData}
                  className="flex-shrink-0 bg-white border border-red-300 text-red-500 h-[48px] px-4 rounded-[16px] hover:bg-red-50 transition-all duration-300 active:scale-95 flex items-center justify-center"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}