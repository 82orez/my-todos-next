"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiLoader } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  // ✅ 로그인된 사용자는 todo 페이지로 이동
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/todos");
    }
  }, [status, router]);

  return (
    <>
      {status === "loading" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-50 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-lg">
            {/* React Icons 로딩 아이콘 + Tailwind 애니메이션 적용 */}
            <FiLoader className="h-12 w-12 animate-spin text-gray-500" />
            <p className="mt-4 animate-pulse text-lg font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
          <h1 className="mb-6 text-3xl font-bold">Welcome to the Todo App</h1>
          <p className="mb-6 text-center text-lg text-gray-700">
            Stay organized and keep track of your tasks with our simple and intuitive Todo app.
          </p>
          <button
            onClick={() => router.push("/users/sign-in")}
            className="rounded-md bg-blue-500 px-6 py-3 text-white shadow-md transition hover:bg-blue-600">
            로그인하고 시작하기
          </button>
        </div>
      )}
    </>
  );
}
