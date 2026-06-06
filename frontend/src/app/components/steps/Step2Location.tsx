import { FormData } from "../../pages/FormPage";

interface StepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

const CITIES = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const DISTRICTS: Record<string, string[]> = {
  "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
  "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
  "인천광역시": ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
  "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
  "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
  "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
  "세종특별자치시": ["세종시"],
  "경기도": ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시", "광명시", "광주시", "군포시", "오산시", "이천시", "양주시", "안성시", "구리시", "포천시", "의왕시", "하남시", "여주시", "동두천시", "과천시", "가평군", "양평군", "연천군"],
  "강원도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
  "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  "전라북도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "군위군", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
  "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
  "제주특별자치도": ["제주시", "서귀포시"],
};

export function Step2Location({ data, updateData }: StepProps) {
  const handleCityChange = (city: string) => {
    updateData({ city, district: "" });
  };

  const availableDistricts = data.city ? DISTRICTS[data.city] || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 600 }}>
          어디에 거주하시나요?
        </h2>
        <p className="text-gray-500" style={{ fontWeight: 400 }}>
          지역 기반 장학금을 찾아드려요
        </p>
      </div>

      {/* City Selection */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <label className="block mb-3 text-gray-700">시/도</label>
        <select
          value={data.city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
          style={{ fontWeight: 500 }}
        >
          <option value="">선택해주세요</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* District Selection */}
      {availableDistricts.length > 0 && (
        <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
          <label className="block mb-3 text-gray-700">시/군/구</label>
          <select
            value={data.district}
            onChange={(e) => updateData({ district: e.target.value })}
            className="w-full h-14 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3282F6] focus:border-transparent transition-all"
            style={{ fontWeight: 500 }}
          >
            <option value="">선택해주세요</option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {data.city && data.district && (
        <div className="bg-[#E8F0FE] rounded-2xl p-4">
          <p className="text-sm text-[#3282F6]" style={{ fontWeight: 500 }}>
            📍 {data.city} {data.district} 기반 장학금을 찾고 있어요
          </p>
        </div>
      )}
    </div>
  );
}