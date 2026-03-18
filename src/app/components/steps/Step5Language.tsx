import { FormData } from "../../pages/FormPage";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2 } from "lucide-react";

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

const LANGUAGE_TESTS = [
  "TOEIC",
  "TOEFL",
  "TEPS",
  "OPIC",
  "IELTS",
  "JPT",
  "JLPT",
  "HSK",
  "기타",
];

export function Step5Language({ data, updateData }: StepProps) {
  const addLanguageScore = () => {
    updateData({
      languageScores: [...data.languageScores, { test: "", score: "" }]
    });
  };

  const removeLanguageScore = (index: number) => {
    const newScores = data.languageScores.filter((_, i) => i !== index);
    updateData({ languageScores: newScores });
  };

  const updateLanguageScore = (index: number, field: 'test' | 'score', value: string) => {
    const newScores = [...data.languageScores];
    if (field === 'score') {
      // Only allow numbers
      if (value !== '' && !/^\d+$/.test(value)) {
        return;
      }
    }
    newScores[index] = { ...newScores[index], [field]: value };
    updateData({ languageScores: newScores });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
          어학 점수를 보유하고 계신가요?
        </h2>
        <p className="text-gray-500" style={{ fontWeight: 400 }}>
          어학 관련 장학금을 찾아드려요
        </p>
      </div>

      {/* Language Scores List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.languageScores.map((score, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6"
              style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg" style={{ fontWeight: 600 }}>
                  어학 시험 {index + 1}
                </h3>
                <button
                  onClick={() => removeLanguageScore(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Test Type Selection */}
                <div>
                  <label className="block mb-2 text-sm text-gray-600">시험 종류</label>
                  <select
                    value={score.test}
                    onChange={(e) => updateLanguageScore(index, 'test', e.target.value)}
                    className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
                    style={{ fontWeight: 500 }}
                  >
                    <option value="">선택해주세요</option>
                    {LANGUAGE_TESTS.map((test) => (
                      <option key={test} value={test}>
                        {test}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Input */}
                <div>
                  <label className="block mb-2 text-sm text-gray-600">점수</label>
                  <input
                    type="text"
                    value={score.score}
                    onChange={(e) => updateLanguageScore(index, 'score', e.target.value)}
                    placeholder="예: 850"
                    inputMode="numeric"
                    className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
                    style={{ fontWeight: 500 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Button */}
        <button
          onClick={addLanguageScore}
          className="w-full bg-white border-2 border-dashed border-[#3282F6] text-[#3282F6] h-[60px] rounded-[18px] hover:bg-[#E8F0FE] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          style={{ fontWeight: 600, fontSize: "16px" }}
        >
          <Plus className="w-5 h-5" />
          어학 점수 추가
        </button>
      </div>

      <div className="bg-[#E8F0FE] rounded-2xl p-4">
        <p className="text-sm text-[#3282F6]" style={{ fontWeight: 500 }}>
          {data.languageScores.length > 0
            ? "🌐 어학 능력 우대 장학금도 함께 찾아드려요"
            : "✅ 어학 점수가 없어도 많은 장학금이 있어요"}
        </p>
      </div>
    </div>
  );
}