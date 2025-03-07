"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTodos, useAddTodo, useToggleTodo, useDeleteTodo, useUpdateTodo } from "@/hooks/useTodos";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrashOutline } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { FaRegSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TodoPage() {
  const { data: todos, isLoading, error } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodo = useUpdateTodo();

  const [text, setText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // ✅ 입력 필드 참조
  const editRef = useRef<HTMLDivElement>(null); // ✅ 수정 입력창 감지용 ref 추가

  const router = useRouter();
  const { status, data: session } = useSession();

  const handleAddTodo = () => {
    if (text.trim() !== "" && status === "authenticated") {
      addTodo.mutate(text);
      setText("");
      setIsModalOpen(false);
    }
  };

  const handleEditTodo = (id: string, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSaveTodo = async (id: string) => {
    if (editText.trim() !== "") {
      await updateTodo.mutateAsync({ id, text: editText });
      setEditId(null);
    }
  };

  // ✅ Esc 키로 모달 닫기 기능 추가
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setText("");
        setEditId(null);
      }
    };

    if (isModalOpen || editId !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, editId]); // ✅ `editId`도 감시하도록 변경

  // ✅ 모달이 열릴 때 입력창에 자동 포커스 추가
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isModalOpen]);

  // ✅ 입력창 외부 클릭 시 수정 취소
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setEditId(null);
      }
    };

    if (editId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p>Error loading todos</p>;

  const completedTodos = todos?.filter((todo) => todo.completed) || [];
  const activeTodos = todos?.filter((todo) => !todo.completed) || [];

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100">
      {/* ✅ Navbar */}
      <nav className="sticky top-0 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Todo App</h1>
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <div className="hidden text-gray-700 md:block">{session?.user?.email}</div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600">
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

      <div className={"w-full max-w-lg px-2"}>
        {/* 할 일 목록 */}
        <div className="mt-10 w-full max-w-lg" ref={editRef}>
          <h2 className="mb-2 text-xl font-semibold">할 일 목록</h2>

          {activeTodos.length === 0 ? (
            <p className="rounded-md bg-white py-6 text-center text-gray-500">새로운 할 일을 추가해 주세요.</p>
          ) : (
            <ul className="rounded-md bg-white p-3 shadow-md">
              {activeTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="mb-2 flex items-center justify-between gap-3 border-b p-1 last:mb-0 last:border-b-0"
                  onDoubleClick={() => handleEditTodo(todo.id, todo.text)}>
                  <div className="flex w-full items-center gap-1">
                    <input
                      type="checkbox"
                      className="mr-2 h-5 w-5 flex-shrink-0 accent-green-500"
                      checked={todo.completed}
                      onChange={() => toggleTodo.mutate({ id: todo.id, completed: !todo.completed })}
                    />

                    {editId === todo.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTodo(todo.id);
                        }}
                        autoFocus
                        className="w-full border p-1"
                      />
                    ) : (
                      <div className="flex-1 whitespace-pre-wrap break-words">{todo.text}</div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {editId === todo.id ? (
                      <>
                        <button onClick={() => handleSaveTodo(todo.id)} className="text-blue-500 hover:text-blue-700">
                          <FaRegSave size={22} />
                        </button>
                        <button onClick={() => setEditId(null)} className="text-red-500 hover:text-red-700">
                          <MdCancel size={25} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditTodo(todo.id, todo.text)} className="text-gray-600 hover:text-gray-900">
                          <FiEdit3 size={22} />
                        </button>
                        <button onClick={() => deleteTodo.mutate(todo.id)} className="text-gray-600 hover:text-gray-900">
                          <IoTrashOutline size={22} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 완료된 목록 */}
        {completedTodos.length > 0 && (
          <div className="mt-10 w-full max-w-lg">
            <h2 className="mb-2 text-xl font-semibold">완료된 목록</h2>
            <ul className="rounded-md bg-white p-3 shadow-md">
              {completedTodos.map((todo) => (
                <li key={todo.id} className="mb-2 flex items-center justify-between border-b p-1 last:mb-0 last:border-b-0">
                  <div className="flex w-full items-center gap-1">
                    <input
                      type="checkbox"
                      className="mr-2 h-5 w-5 flex-shrink-0 accent-blue-500"
                      checked={todo.completed}
                      onChange={() => toggleTodo.mutate({ id: todo.id, completed: false })}
                    />
                    <span className="flex-1 whitespace-pre-wrap break-words text-gray-500 line-through">{todo.text}</span>
                  </div>
                  <button onClick={() => deleteTodo.mutate(todo.id)} className="ml-2 flex-shrink-0">
                    <IoTrashOutline size={22} className="text-gray-600 hover:text-gray-900" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ✅ FAB 버튼 (하단 고정) */}
      {status === "authenticated" && (
        <button
          onClick={() => {
            setIsModalOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="fixed bottom-6 right-6 transform rounded-full bg-blue-500 p-5 text-white shadow-lg transition hover:scale-110 hover:bg-blue-600">
          + 할 일 추가
        </button>
      )}

      {/* ✅ 모달 (애니메이션 적용) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-3 backdrop-blur-sm">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-[20%] w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">새로운 할 일 추가</h2>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // 기본 동작 방지 (폼 제출 방지)
                    handleAddTodo(); // 할 일 추가
                  }
                }}
                className="mb-4 w-full rounded-md border p-2"
                placeholder="할 일을 입력하세요..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setText("");
                    setIsModalOpen(false);
                  }}
                  className="rounded-md bg-gray-400 px-4 py-2 text-white hover:bg-gray-500">
                  취소
                </button>
                <button
                  onClick={handleAddTodo}
                  className={`rounded-md px-4 py-2 text-white ${addTodo.isPending ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                  disabled={addTodo.isPending}>
                  {addTodo.isPending ? "추가 중..." : "추가"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
