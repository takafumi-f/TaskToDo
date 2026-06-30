"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type User } from "firebase/auth";
import { signOut } from "@/lib/auth";
import { subscribeToTasks, toggleCompleted, deleteTask } from "@/lib/tasks";
import type { Task } from "@/types/task";
import AuthGuard from "@/components/AuthGuard";

function TaskListContent({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(user.uid, setTasks);
    return unsubscribe;
  }, [user.uid]);

  async function handleToggle(task: Task) {
    await toggleCompleted(user.uid, task.id, task.completed);
  }

  async function handleDelete(taskId: string) {
    if (!confirm("このタスクを削除しますか？")) return;
    setDeletingId(taskId);
    try {
      await deleteTask(user.uid, taskId);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">TaskToDo</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">
              {user.displayName ?? user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            タスク一覧 ({tasks.length})
          </h2>
          <Link
            href="/tasks/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + 新規作成
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-gray-500">タスクがありません</p>
            <Link
              href="/tasks/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              最初のタスクを作成する
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                deleting={deletingId === task.id}
                onToggle={() => handleToggle(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

type RowProps = {
  task: Task;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

function TaskRow({ task, deleting, onToggle, onDelete }: RowProps) {
  const due = task.dueDate.toDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = !task.completed && due < today;
  const dueDateStr = due.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            task.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {task.title}
        </p>
        <p
          className={`text-xs ${
            isOverdue ? "text-red-500" : "text-gray-500"
          }`}
        >
          締切: {dueDateStr}
          {isOverdue && " (期限超過)"}
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Link
          href={`/tasks/${task.id}/edit`}
          className="rounded-md px-2 py-1 text-xs text-blue-600 transition hover:bg-blue-50"
        >
          編集
        </Link>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-md px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-40"
        >
          {deleting ? "..." : "削除"}
        </button>
      </div>
    </li>
  );
}

export default function TasksPage() {
  return <AuthGuard>{(user) => <TaskListContent user={user} />}</AuthGuard>;
}
