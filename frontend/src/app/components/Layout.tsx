import { Outlet } from "react-router";
import { Footer } from "./Footer";

/**
 * 공통 레이아웃 컴포넌트
 * 모든 페이지에 푸터를 공통으로 적용합니다.
 */
export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
