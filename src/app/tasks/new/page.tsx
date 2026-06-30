"use client";

import Link from "next/link";
import { createTask } from "@/lib/tasks";
import TaskForm from "@/components/TaskForm";
import AuthGuard from "@/components/AuthGuard";
import type { User } from "firebase/auth";
import type { TaskInput } from "@/types/task";

function NewTaskContent({ user }: { user: User }) {
  async function handleSubmit(input: TaskInput) {
    await createTask(user.uid, input);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-2xl">
          <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
            ← タスク一覧に戻る
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">新規タスク作成</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <TaskForm onSubmit={handleSubmit} submitLabel="作成する" />
        </div>
      </main>
    </div>
  );
}

export default function NewTaskPage() {
  return <AuthGuard>{(user) => <NewTaskContent user={user} />}</AuthGuard>;
}
