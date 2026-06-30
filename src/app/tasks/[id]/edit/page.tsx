"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { updateTask } from "@/lib/tasks";
import TaskForm from "@/components/TaskForm";
import AuthGuard from "@/components/AuthGuard";
import type { User } from "firebase/auth";
import type { Task, TaskInput } from "@/types/task";

function EditTaskContent({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const ref = doc(getFirebaseDb(), "users", user.uid, "tasks", id);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data().deletedAt !== null) {
        setNotFound(true);
      } else {
        setTask({ id: snap.id, ...snap.data() } as Task);
      }
    }
    load();
  }, [user.uid, id]);

  async function handleSubmit(input: TaskInput) {
    await updateTask(user.uid, id, input);
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-600">タスクが見つかりませんでした。</p>
        <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
          タスク一覧に戻る
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const dueDateStr = task.dueDate
    .toDate()
    .toISOString()
    .split("T")[0];

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
        <h2 className="mb-6 text-xl font-bold text-gray-900">タスクを編集</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <TaskForm
            defaultValues={{
              title: task.title,
              dueDate: dueDateStr,
              completed: task.completed,
            }}
            onSubmit={handleSubmit}
            submitLabel="保存する"
          />
        </div>
      </main>
    </div>
  );
}

export default function EditTaskPage() {
  return <AuthGuard>{(user) => <EditTaskContent user={user} />}</AuthGuard>;
}
