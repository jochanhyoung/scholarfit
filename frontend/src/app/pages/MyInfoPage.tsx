import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Home, Trash2, Edit, Search, Bell, UserX } from "lucide-react";
import { FormData } from "./FormPage";
import { useAuth } from "@/lib/auth";
import { deleteAccount, signOut } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

export function MyInfoPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [savedData, setSavedData] = useState<FormData | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const loadSavedData = () => {
      try {
        const saved = localStorage.getItem("scholarshipFormData");
        if (saved) {
          setSavedData(JSON.parse(saved));
        }
        const notifSetting = localStorage.getItem("notificationEnabled");
        setNotificationEnabled(notifSetting === "true");
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    };
    loadSavedData();
  }, []);

  const deleteSavedData = () => {
    const confirmed = window.confirm("저장된 정보를 삭제하시겠습니까?");
    if (confirmed) {
      localStorage.removeItem("scholarshipFormData");
      setSavedData(null);
      alert("정보가 삭제되었습니다.");
    }
  };

  const editData = () => {
    navigate("/form");
  };

  const searchWithData = () => {
    if (savedData) {
      navigate("/results", { state: { formData: savedData } });
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(session.access_token);
      localStorage.removeItem("scholarshipFormData");
      localStorage.removeItem("notificationEnabled");
      await signOut();
      navigate("/", { replace: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "계정 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleNotification = () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    localStorage.setItem("notificationEnabled", newValue.toString());
    if (newValue) {
      alert("알림이 설정되었습니다!\n새로운 장학금 소식을 받아보세요.");
    } else {
      alert("알림이 해제되었습니다.");
    }
  };

  const getLanguageTestName = (test: string) => {
    const tests: Record<string, string> = {
      toeic: "TOEIC",
      toefl: "TOEFL",
      ielts: "IELTS",
      teps: "TEPS",
      opic: "OPIc",
    };
    return tests[test] || test;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50" style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.03)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-[#3282F6] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span style={{ fontWeight: 500 }}>뒤로</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#3282F6] transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline" style={{ fontWeight: 500 }}>홈</span>
            </button>
          </div>

          <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>
            내 정보
          </h1>
          <p className="text-gray-600" style={{ fontWeight: 400 }}>
            저장된 장학금 검색 정보를 확인하고 관리하세요
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {savedData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={searchWithData}
                className="flex-1 bg-[#3282F6] text-white h-[56px] rounded-[18px] hover:bg-[#2670e0] transition-all duration-300 hover:shadow-lg hover:shadow-[#3282F6]/30 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: "16px" }}
              >
                <Search className="w-5 h-5" />
                이 정보로 검색하기
              </button>
              <button
                onClick={editData}
                className="flex-shrink-0 bg-white border-2 border-[#3282F6] text-[#3282F6] h-[56px] px-6 rounded-[18px] hover:bg-[#E8F0FE] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: "16px" }}
              >
                <Edit className="w-5 h-5" />
                수정
              </button>
            </div>

            {/* Saved Data Display */}
            <div className="space-y-4">
              {/* Grade Info */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>
                  📊 성적 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>평점 기준</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.gradeScale}점 만점</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>직전 학기 평점</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.lastSemesterGrade}점</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>전체 평점</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.totalGrade}점</span>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>
                  📍 거주지 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>시/도</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>시/군/구</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.district}</span>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>
                  👤 기본 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>소득분위</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>{savedData.incomeBracket}분위</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>성별</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>
                      {savedData.gender === "male" ? "남성" : savedData.gender === "female" ? "여성" : "선택 안함"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Year Info */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>
                  🎓 학년 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontWeight: 400 }}>학년</span>
                    <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>
                      {savedData.isFirstYear ? "신입생" : `${savedData.year}학년`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Info */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>
                  🌏 어학 정보
                </h3>
                <div className="space-y-3">
                  {savedData.languageScores && savedData.languageScores.length > 0 ? (
                    savedData.languageScores.map((score, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600" style={{ fontWeight: 400 }}>시험 종류</span>
                          <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>
                            {score.test}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600" style={{ fontWeight: 400 }}>
                            {["OPIC", "TOEIC Speaking", "JLPT", "HSK"].includes(score.test) ? "등급" : "점수"}
                          </span>
                          <span className="text-[#3282F6]" style={{ fontWeight: 600 }}>
                            {score.score}
                            {!["OPIC", "TOEIC Speaking", "JLPT", "HSK"].includes(score.test) && "점"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-2" style={{ fontWeight: 400 }}>
                      어학 점수 없음
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={deleteSavedData}
                className="w-full bg-white border-2 border-red-300 text-red-500 h-[56px] rounded-[18px] hover:bg-red-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: "16px" }}
              >
                <Trash2 className="w-5 h-5" />
                저장된 정보 삭제
              </button>

              {/* Notification Toggle */}
              <button
                onClick={toggleNotification}
                className="w-full bg-white border-2 border-gray-300 text-gray-500 h-[56px] rounded-[18px] hover:bg-gray-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: "16px" }}
              >
                <Bell className="w-5 h-5" />
                {notificationEnabled ? "알림 해제" : "알림 설정"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl p-12" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
              <div className="text-6xl mb-4">💾</div>
              <h2 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
                저장된 정보가 없습니다
              </h2>
              <p className="text-gray-600 mb-6" style={{ fontWeight: 400 }}>
                장학금 검색 후 정보를 저장하면 여기서 확인할 수 있어요
              </p>
              <button
                onClick={() => navigate("/form")}
                className="bg-[#3282F6] text-white px-8 py-3 rounded-[18px] hover:bg-[#2670e0] transition-all duration-300 hover:shadow-lg hover:shadow-[#3282F6]/30 active:scale-95"
                style={{ fontWeight: 600, fontSize: "16px" }}
              >
                장학금 찾기
              </button>
            </div>
          </motion.div>
        )}
        {/* 계정 탈퇴 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-3" style={{ fontWeight: 400 }}>
            계정을 탈퇴하면 모든 개인정보가 즉시 삭제되며 복구할 수 없습니다.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={deleteLoading}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                style={{ fontWeight: 500 }}
              >
                <UserX className="w-4 h-4" />
                {deleteLoading ? "탈퇴 처리 중..." : "회원 탈퇴"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  탈퇴 시 이메일, 이름, 프로필 등 모든 개인정보가 즉시 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                >
                  탈퇴하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}