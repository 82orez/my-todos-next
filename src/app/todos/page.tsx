"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTodos, useAddTodo, useToggleTodo, useDeleteTodo, useUpdateTodo } from "@/hooks/useTodos";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrashOutline } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";

export default function TodoPage() {
  const { data: todos, isLoading, error } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodo = useUpdateTodo();

  const [text, setText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setEditId(null);
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading todos</p>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100">
      <div className="w-full max-w-lg px-4">
        <div className="mt-10 w-full max-w-lg">
          <h2 className="mb-2 text-xl font-semibold">할 일 목록</h2>

          {todos?.length === 0 ? (
            <p className="rounded-md bg-white py-6 text-center text-gray-500">새로운 할 일을 추가해 주세요.</p>
          ) : (
            <ul className="rounded-md bg-white p-3 shadow-md">
              {todos.map((todo) => (
                <li key={todo.id} className="mb-2 flex items-center justify-between border-b p-2 last:mb-0 last:border-b-0">
                  <div className="flex w-full items-center">
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
                      <span className="flex-1 whitespace-pre-wrap break-words">{todo.text}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editId === todo.id ? (
                      <button onClick={() => handleSaveTodo(todo.id)} className="text-blue-500 hover:text-blue-700">
                        저장
                      </button>
                    ) : (
                      <button onClick={() => handleEditTodo(todo.id, todo.text)} className="text-gray-500 hover:text-gray-700">
                        <FiEdit3 size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteTodo.mutate(todo.id)} className="text-red-500 hover:text-red-700">
                      <IoTrashOutline size={22} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
