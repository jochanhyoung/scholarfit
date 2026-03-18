import { FormData } from "../../pages/FormPage";

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function Step4Year({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
          현재 학년을 알려주세요
        </h2>
        <p className="text-gray-500" style={{ fontWeight: 400 }}>
          학년별 장학금을 찾아드려요
        </p>
      </div>

      {/* First Year Toggle */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-700 block mb-1">현재 신입생인가요?</label>
            <p className="text-sm text-gray-500">올해 입학한 1학년이신가요?</p>
          </div>
          <button
            onClick={() => updateData({ isFirstYear: !data.isFirstYear })}
            className={`relative inline-flex h-12 w-20 items-center rounded-full transition-colors flex-shrink-0 overflow-hidden ${
              data.isFirstYear ? "bg-[#3282F6]" : "bg-gray-300"
            }`}
          >
            <span
              className="inline-block h-9 w-9 transform rounded-full bg-white transition-transform shadow-md"
              style={{
                transform: data.isFirstYear ? "translateX(40px)" : "translateX(4px)",
              }}
            />
            <span
              className={`absolute text-sm font-medium pointer-events-none ${
                data.isFirstYear ? "left-3 text-white" : "right-3 text-gray-600"
              }`}
            >
              {data.isFirstYear ? "O" : "X"}
            </span>
          </button>
        </div>
      </div>

      {/* Year Selection (shown only if not first year) */}
      {!data.isFirstYear && (
        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <label className="block mb-3 text-gray-700">학년 선택</label>
          <div className="grid grid-cols-5 gap-3">
            {[
              { value: 1, label: "1학년" },
              { value: 2, label: "2학년" },
              { value: 3, label: "3학년" },
              { value: 4, label: "4학년" },
              { value: 5, label: "5학년+" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateData({ year: option.value })}
                className={`h-14 rounded-2xl transition-all ${
                  data.year === option.value
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
      )}

      <div className="bg-[#E8F0FE] rounded-2xl p-4">
        <p className="text-sm text-[#3282F6]" style={{ fontWeight: 500 }}>
          {data.isFirstYear
            ? "🎓 신입생 전용 장학금을 우선적으로 보여드려요"
            : `📚 ${data.year}학년 대상 장학금을 찾고 있어요`}
        </p>
      </div>
    </div>
  );
}
