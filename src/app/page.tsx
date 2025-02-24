"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTodos, useAddTodo, useToggleTodo, useDeleteTodo } from "@/hooks/useTodos";
import { signOut, useSession } from "next-auth/react";

export default function TodoPage() {
  const { data: todos, isLoading, error } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const [text, setText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { status, data: session } = useSession();

  const handleAddTodo = () => {
    if (text.trim() !== "" && status === "authenticated") {
      addTodo.mutate(text);
      setText("");
      setIsModalOpen(false); // ✅ 모달 닫기
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading todos</p>;

  const completedTodos = todos?.filter((todo) => todo.completed) || [];

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100">
      {/* ✅ Navbar */}
      <nav className="sticky top-0 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Todo App</h1>
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <div className="text-gray-700">{session?.user?.email}</div>
              <button onClick={() => signOut()} className="rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/users/sign-up")}
                className="rounded-md border border-blue-500 px-4 py-2 text-blue-500 transition hover:bg-blue-500 hover:text-white">
                회원가입
              </button>
              <button
                onClick={() => router.push("/users/sign-in")}
                className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
                로그인
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 할 일 목록 */}
      <div className="mt-6 w-full max-w-lg">
        <h2 className="mb-2 text-xl font-semibold">할 일 목록</h2>
        <ul className="rounded-md bg-white p-4 shadow-md">
          {todos
            ?.filter((todo) => !todo.completed)
            .map((todo) => (
              <li key={todo.id} className="flex items-center justify-between border-b p-2 last:border-b-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-5 w-5 accent-green-500"
                    checked={todo.completed}
                    onChange={() => toggleTodo.mutate({ id: todo.id, completed: true })}
                  />
                  <span>{todo.text}</span>
                </div>
                <button onClick={() => deleteTodo.mutate(todo.id)} className="text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* 완료된 목록 */}
      {completedTodos.length > 0 && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="mb-2 text-xl font-semibold">완료된 목록</h2>
          <ul className="rounded-md bg-white p-4 shadow-md">
            {completedTodos.map((todo) => (
              <li key={todo.id} className="flex items-center justify-between border-b p-2 last:border-b-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-5 w-5 accent-red-500"
                    checked={todo.completed}
                    onChange={() => toggleTodo.mutate({ id: todo.id, completed: false })}
                  />
                  <span className="text-gray-500 line-through">{todo.text}</span>
                </div>
                <button onClick={() => deleteTodo.mutate(todo.id)} className="text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ 모달 트리거 버튼 (하단 고정) */}
      {status === "authenticated" && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 rounded-full bg-blue-500 px-6 py-3 text-white shadow-lg transition hover:bg-blue-600">
          + 추가
        </button>
      )}

      {/* ✅ 모달 (할 일 입력창) */}
      {isModalOpen && (
        <div className="fixed inset-0 flex w-full items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">새로운 할 일 추가</h2>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mb-4 w-full rounded-md border p-2"
              placeholder="할 일을 입력하세요..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-gray-400 px-4 py-2 text-white hover:bg-gray-500">
                취소
              </button>
              <button onClick={handleAddTodo} className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
