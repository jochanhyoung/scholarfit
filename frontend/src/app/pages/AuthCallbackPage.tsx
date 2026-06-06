import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        navigate("/", { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate("/login", { replace: true });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#3282F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
