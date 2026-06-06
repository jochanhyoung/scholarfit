import { Link } from "react-router";

/**
 * 공통 푸터 컴포넌트
 * 모든 페이지 하단에 표시되며, 서비스 이용약관 및 개인정보처리방침 링크를 제공합니다.
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 py-4 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
        <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>
          © {new Date().getFullYear()} 장학핏
        </span>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link
            to="/terms"
            className="hover:text-gray-600 transition-colors"
            style={{ fontWeight: 400 }}
          >
            서비스 이용약관
          </Link>
          <span>·</span>
          <Link
            to="/privacy"
            className="hover:text-gray-600 transition-colors"
            style={{ fontWeight: 600 }}
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
