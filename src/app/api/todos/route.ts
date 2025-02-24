import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ 할 일 목록 가져오기
export async function GET() {
  try {
    const todos = await prisma.todos.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

// ✅ 새 할 일 추가
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const newTodo = await prisma.todos.create({
      data: { text },
    });

    return NextResponse.json(newTodo);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add todo" }, { status: 500 });
  }
}

// ✅ 할 일 완료 상태 변경
export async function PATCH(req: Request) {
  try {
    const { id, completed } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updatedTodo = await prisma.todos.update({
      where: { id },
      data: { completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

// ✅ 할 일 삭제 API 추가
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.todos.delete({ where: { id } });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
