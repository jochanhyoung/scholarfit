import { FormData } from "../../pages/FormPage";

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function Step1Grade({ data, updateData }: StepProps) {
  const handleGradeChange = (field: 'lastSemesterGrade' | 'totalGrade', value: string) => {
    // Allow empty string
    if (value === '') {
      updateData({ [field]: value });
      return;
    }
    
    // Only allow positive numbers with optional decimal point
    // Reject negative numbers, 'e', 'E', '+', '-'
    if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
      return; // Reject invalid input
    }
    
    const numValue = parseFloat(value);
    const maxGrade = parseFloat(data.gradeScale);
    
    // Validate: 0 < grade <= gradeScale
    if (!isNaN(numValue) && numValue > 0 && numValue <= maxGrade) {
      updateData({ [field]: value });
    } else if (value.endsWith('.') || value.match(/^\d+\.0*$/)) {
      // Allow typing decimal point and trailing zeros (e.g., "4." or "4.0")
      updateData({ [field]: value });
    }
  };

  // If first year student, show message and allow skipping
  if (data.isFirstYear) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
            신입생이시군요! 👋
          </h2>
          <p className="text-gray-500" style={{ fontWeight: 400 }}>
            신입생은 성적 입력이 필요 없습니다
          </p>
        </div>

        <div className="bg-[#E8F0FE] rounded-3xl p-8 text-center" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl mb-2" style={{ fontWeight: 600, color: "#3282F6" }}>
            신입생 전용 장학금을 찾아드려요!
          </h3>
          <p className="text-gray-600" style={{ fontWeight: 400 }}>
            성적 없이도 신청 가능한 장학금이 많이 있습니다
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <p className="text-sm text-gray-600 text-center" style={{ fontWeight: 400 }}>
            💡 다음 단계로 넘어가서 나머지 정보를 입력해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
          어느 정도 공부하셨나요?
        </h2>
        <p className="text-gray-500" style={{ fontWeight: 400 }}>
          성적 정보를 입력해주세요
        </p>
      </div>

      {/* Grade Scale Selector */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <label className="block mb-3 text-gray-700">평점 기준</label>
        <select
          value={data.gradeScale}
          onChange={(e) => updateData({ gradeScale: e.target.value as FormData["gradeScale"] })}
          className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
          style={{ fontWeight: 500 }}
        >
          <option value="4.5">4.5 만점</option>
          <option value="4.3">4.3 만점</option>
          <option value="4.0">4.0 만점</option>
        </select>
      </div>

      {/* Two-Column Grade Input */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <label className="block mb-3 text-gray-700">직전 학기 성적</label>
          <input
            type="text"
            value={data.lastSemesterGrade}
            onChange={(e) => handleGradeChange('lastSemesterGrade', e.target.value)}
            placeholder="예: 4.2"
            inputMode="decimal"
            className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
            style={{ fontWeight: 500 }}
          />
        </div>

        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <label className="block mb-3 text-gray-700">전체 평균 성적</label>
          <input
            type="text"
            value={data.totalGrade}
            onChange={(e) => handleGradeChange('totalGrade', e.target.value)}
            placeholder="예: 4.0"
            inputMode="decimal"
            className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
            style={{ fontWeight: 500 }}
          />
        </div>
      </div>

      <div className="bg-[#E8F0FE] rounded-2xl p-4">
        <p className="text-sm text-[#3282F6]" style={{ fontWeight: 500 }}>
          💡 성적이 높을수록 더 많은 장학금 기회를 찾을 수 있어요
        </p>
      </div>
    </div>
  );
}