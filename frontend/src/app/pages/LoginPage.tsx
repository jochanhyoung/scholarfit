import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    const fromSameOrigin = document.referrer.startsWith(window.location.origin);
    if (fromSameOrigin) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인 중 오류가 발생했습니다.");
      setSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F0FE] via-white to-[#F9FAFB] flex items-center justify-center px-6">
      <button
        onClick={handleBack}
        aria-label="이전 페이지로 돌아가기"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors py-3 px-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm" style={{ fontWeight: 500 }}>뒤로</span>
      </button>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-[32px] p-10 text-center"
        style={{ boxShadow: "0px 8px 40px rgba(50, 130, 246, 0.12)" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-[#E8F0FE] to-[#3282F6]/20 p-6 rounded-[24px]">
            <Coins className="w-12 h-12 text-[#3282F6]" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-2xl mb-2" style={{ fontWeight: 700 }}>
          장학핏
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed" style={{ fontWeight: 400 }}>
          로그인하면 나에게 맞는 장학금을
          <br />더 정확하게 추천받을 수 있어요
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 px-2">{error}</p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-[#3282F6] hover:bg-[#F8FBFF] text-gray-700 h-[56px] rounded-[16px] transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontWeight: 600, fontSize: "15px" }}
        >
          <GoogleIcon />
          {signingIn ? "이동 중..." : "Google로 계속하기"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm transition-colors py-2"
          style={{ fontWeight: 400 }}
        >
          로그인 없이 계속하기
        </button>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.5h3.22c1.89-1.74 2.99-4.3 2.99-7.31z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.1v2.58A9.99 9.99 0 0010 20z"
        fill="#34A853"
      />
      <path
        d="M4.41 11.91A6.02 6.02 0 014.1 10c0-.66.11-1.3.31-1.91V5.51H1.1A10 10 0 000 10c0 1.61.39 3.13 1.1 4.49l3.31-2.58z"
        fill="#FBBC04"
      />
      <path
        d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86C14.96.9 12.7 0 10 0A9.99 9.99 0 001.1 5.51l3.31 2.58C5.2 5.72 7.4 3.96 10 3.96z"
        fill="#EA4335"
      />
    </svg>
  );
}
