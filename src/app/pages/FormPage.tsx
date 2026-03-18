import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Step1Grade } from "../components/steps/Step1Grade";
import { Step2Location } from "../components/steps/Step2Location";
import { Step3IncomeGender } from "../components/steps/Step3IncomeGender";
import { Step4Year } from "../components/steps/Step4Year";
import { Step5Language } from "../components/steps/Step5Language";

export interface FormData {
  // Step 1: Grade
  gradeScale: "4.5" | "4.3" | "4.0";
  lastSemesterGrade: string;
  totalGrade: string;
  
  // Step 2: Location
  city: string;
  district: string;
  
  // Step 3: Income & Gender
  incomeBracket: number;
  gender: "male" | "female" | "none";
  
  // Step 4: Year
  isFirstYear: boolean;
  year: number;
  
  // Step 5: Language (array of test scores)
  languageScores: Array<{
    test: string;
    score: string;
  }>;
}

const TOTAL_STEPS = 5;

const STEP_NAMES = [
  "학년",
  "성적",
  "거주지",
  "기본정보",
  "어학점수"
];

export function FormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Load saved data from localStorage
  const loadSavedData = (): FormData => {
    try {
      const saved = localStorage.getItem("scholarshipFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old data structure to new structure
        if (!parsed.languageScores) {
          // Old structure had hasLanguageScore, languageTest, languageScore
          parsed.languageScores = [];
          if (parsed.hasLanguageScore && parsed.languageTest && parsed.languageScore) {
            parsed.languageScores.push({
              test: parsed.languageTest,
              score: parsed.languageScore
            });
          }
        }
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
    return {
      gradeScale: "4.5",
      lastSemesterGrade: "",
      totalGrade: "",
      city: "",
      district: "",
      incomeBracket: 5,
      gender: "none",
      isFirstYear: false,
      year: 1,
      languageScores: [],
    };
  };

  const [formData, setFormData] = useState<FormData>(loadSavedData());

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const saveFormData = () => {
    try {
      localStorage.setItem("scholarshipFormData", JSON.stringify(formData));
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  const goToStep = (step: number) => {
    if (step <= maxReachedStep) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      setMaxReachedStep((prev) => Math.max(prev, nextStepNum));
    } else {
      // Save to localStorage before navigating to ensure data persistence
      try {
        localStorage.setItem("scholarshipFormData", JSON.stringify(formData));
        console.log("폼 데이터 자동 저장:", formData);
      } catch (error) {
        console.error("Failed to save data:", error);
      }
      // Navigate to results
      navigate("/results", { state: { formData } });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate("/");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.isFirstYear || formData.year > 0;
      case 2:
        // If first year, skip grade requirement
        return formData.isFirstYear || (formData.lastSemesterGrade && formData.totalGrade);
      case 3:
        return formData.city && formData.district;
      case 4:
        return true;
      case 5:
        // Allow proceeding if no language scores, or if all scores are complete
        return formData.languageScores.length === 0 || 
               formData.languageScores.every(score => score.test && score.score);
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header with progress */}
      <div className="bg-white sticky top-0 z-50" style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.03)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevStep}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-sm" style={{ fontWeight: 500, color: "#3282F6" }}>
              {currentStep} / {TOTAL_STEPS}
            </div>
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="홈으로"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 overflow-x-auto pb-1">
            {STEP_NAMES.map((name, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              const isAccessible = stepNum <= maxReachedStep;
              
              return (
                <button
                  key={stepNum}
                  onClick={() => goToStep(stepNum)}
                  disabled={!isAccessible}
                  className={`flex-shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all ${
                    isActive
                      ? "bg-[#3282F6] text-white"
                      : isCompleted
                      ? "bg-[#E8F0FE] text-[#3282F6] hover:bg-[#d0e4fd]"
                      : "bg-gray-100 text-gray-400"
                  } ${isAccessible && !isActive ? "cursor-pointer" : ""} ${!isAccessible ? "cursor-not-allowed" : ""}`}
                  style={{ fontWeight: 500 }}
                >
                  {stepNum}. {name}
                </button>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#3282F6]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <Step4Year data={formData} updateData={updateFormData} />}
            {currentStep === 2 && <Step1Grade data={formData} updateData={updateFormData} />}
            {currentStep === 3 && <Step2Location data={formData} updateData={updateFormData} />}
            {currentStep === 4 && <Step3IncomeGender data={formData} updateData={updateFormData} />}
            {currentStep === 5 && <Step5Language data={formData} updateData={updateFormData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="w-full bg-[#3282F6] text-white h-[60px] rounded-[18px] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#2670e0] transition-all duration-300 hover:shadow-lg hover:shadow-[#3282F6]/30 active:scale-95 disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
            style={{
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {currentStep === TOTAL_STEPS ? "장학금 찾기" : "다음"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}