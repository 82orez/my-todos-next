import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchTodos = async () => {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

export const useTodos = () => {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodos });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to add todo");
      return res.json();
    },
    // @ts-ignore
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ id, completed }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    // @ts-ignore
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });
};

// ✅ 할 일 삭제 훅 추가
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      return res.json();
    },
    // @ts-ignore
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });
};
