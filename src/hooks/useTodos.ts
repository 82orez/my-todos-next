import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryClient } from "@/app/providers";

const fetchTodos = async () => {
  const res = await fetch("/api/todos");

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch todos");
  }

  return res.json();
};

export const useTodos = () => {
  const router = useRouter();

  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      try {
        return await fetchTodos();
      } catch (error: any) {
        if (error.message === "Unauthorized") {
          router.push("/users/sign-in"); // ✅ 로그인 페이지로 이동
        }
        throw error;
      }
    },
  });
};

export const useAddTodo = () => {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("할 일 추가 실패");
      return res.json();
    },
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (oldTodos: any) => [{ id: `temp-${Date.now()}`, text, completed: false }, ...oldTodos]);

      return { previousTodos };
    },
    onError: (err, text, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useToggleTodo = () => {
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ id, completed }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        console.error("완료 상태 변경 실패:", errorMessage);
        throw new Error(`완료 상태 변경 실패: ${errorMessage}`);
      }

      return { id, completed };
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (oldTodos: any) => oldTodos?.map((todo: any) => (todo.id === id ? { ...todo, completed } : todo)));

      return { previousTodos };
    },
    onError: (err, { id, completed }, context) => {
      console.error("완료 상태 변경 요청 실패:", err.message);
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

// ✅ 할 일 삭제 훅 추가
export const useDeleteTodo = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("할 일 삭제 실패");
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (oldTodos: any) => oldTodos?.filter((todo: any) => todo.id !== id) || []);

      return { previousTodos };
    },
    onError: (err, id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const res = await fetch("/api/todos", {
        method: "PUT",
        body: JSON.stringify({ id, text }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("할 일 수정 실패");

      return res.json();
    },
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (oldTodos: any) => oldTodos.map((todo: any) => (todo.id === id ? { ...todo, text } : todo)));

      return { previousTodos };
    },
    onError: (err, { id, text }, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
