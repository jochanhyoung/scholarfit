import { FormData } from "../../pages/FormPage";

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function Step3IncomeGender({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
          기본적인 정보를 알려주세요
        </h2>
        <p className="text-gray-500" style={{ fontWeight: 400 }}>
          소득분위와 성별을 선택해주세요
        </p>
      </div>

      {/* Income Bracket Slider */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <div className="flex justify-between items-center mb-4">
          <label className="text-gray-700">소득분위</label>
          <div
            className="bg-[#3282F6] text-white px-6 py-2 rounded-full"
            style={{ fontWeight: 600, fontSize: "20px" }}
          >
            {data.incomeBracket}분위
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={data.incomeBracket}
          onChange={(e) => updateData({ incomeBracket: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3282F6 0%, #3282F6 ${
              ((data.incomeBracket - 1) / 9) * 100
            }%, #e5e7eb ${((data.incomeBracket - 1) / 9) * 100}%, #e5e7eb 100%)`,
          }}
        />

        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>1분위</span>
          <span>10분위</span>
        </div>

        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #3282F6;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(50, 130, 246, 0.3);
          }
          .slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #3282F6;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(50, 130, 246, 0.3);
          }
        `}</style>
      </div>

      {/* Gender Selection */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <label className="block mb-3 text-gray-700">성별</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "male" as const, label: "남성" },
            { value: "female" as const, label: "여성" },
            { value: "none" as const, label: "선택안함" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ gender: option.value })}
              className={`h-14 rounded-2xl transition-all ${
                data.gender === option.value
                  ? "bg-[#3282F6] text-white shadow-lg shadow-[#3282F6]/30"
                  : "bg-[#F9FAFB] text-gray-700 hover:bg-gray-200"
              }`}
              style={{ fontWeight: 500 }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#E8F0FE] rounded-2xl p-4">
        <p className="text-sm text-[#3282F6]" style={{ fontWeight: 500 }}>
          🔒 모든 정보는 장학금 매칭 목적으로만 사용돼요
        </p>
      </div>
    </div>
  );
}
