"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskInput } from "@/types/task";

type Props = {
  defaultValues?: {
    title: string;
    dueDate: string;
    completed: boolean;
  };
  onSubmit: (input: TaskInput) => Promise<void>;
  submitLabel: string;
};

export default function TaskForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ?? "");
  const [completed, setCompleted] = useState(defaultValues?.completed ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = "タスク名は必須です";
    else if (title.trim().length > 200) errs.title = "タスク名は 200 文字以内で入力してください";
    if (!dueDate) errs.dueDate = "締切日は必須です";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), dueDate: new Date(dueDate), completed });
      router.push("/tasks");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          タスク名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="例：議事録を作成する"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          締切日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="completed"
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="completed" className="text-sm text-gray-700">
          完了済み
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
